import React, { useState, useEffect, useCallback, useRef } from 'react';
import LandingPage from './components/LandingPage';
import TemplatesPage from './components/TemplatesPage';
import PricingPage from './components/PricingPage';
import Editor from './components/Editor';
import Preview from './components/Preview';
import FormBuilder from './components/FormBuilder/FormBuilder';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import ModeToggle from './components/ModeToggle';
import { auth, provider, db } from './firebase';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { apiGet, apiPost, BACKEND_URL } from './utils/api';
import UsageBanner from './components/UsageBanner';
import CareerInsights from './components/CareerInsights';
import toast, { Toaster } from 'react-hot-toast';

const DEFAULT_LATEX = `\\documentclass[letterpaper,11pt]{article}
% ... (Deedy template content here or load from backend)
`;

const INITIAL_RESUME_DATA = {
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    location: ""
  },
  socialProfiles: {
    linkedin: "",
    github: "",
    leetcode: "",
    codechef: ""
  },
  experience: [],
  projects: [],
  skills: {
    languages: [],
    frameworks: [],
    databases: [],
    tools: []
  },
  achievements: [],
  certifications: [],
  education: []
};

export default function App() {
  const [mode, setMode] = useState('form'); // 'form' or 'editor'
  const [latex, setLatex] = useState(DEFAULT_LATEX);
  const [resumeData, setResumeData] = useState(INITIAL_RESUME_DATA);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewingTemplates, setViewingTemplates] = useState(false);
  const [viewingPricing, setViewingPricing] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [subscription, setSubscription] = useState({ tier: 'free', status: 'active' });
  const autoSaveTimerRef = useRef(null);

  // Handle payment redirect params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Your plan has been upgraded.');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      toast('Payment cancelled.', { icon: 'info' });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Load template from backend when component mounts
  useEffect(() => {
    let didSetFromUser = false;

    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);

        // Fetch subscription status
        try {
          const subRes = await apiGet('/payments/status');
          if (subRes.ok) {
            const subData = await subRes.json();
            setSubscription(subData.subscription || { tier: 'free', status: 'active' });
          }
        } catch (e) {
          // Subscription fetch failed — default to free
        }

        // Try to load user's saved resume data
        const docRef = doc(db, 'userResumes', authUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.resumeData) {
            setResumeData(data.resumeData);
            didSetFromUser = true;
          }
          if (data.latex) {
            setLatex(data.latex);
          }
        } else {
          // New user: check local storage for template preference
          const savedTemplateId = localStorage.getItem('selectedTemplateId');
          if (savedTemplateId) {
            setResumeData(prev => {
              const updatedData = {
                ...prev,
                metadata: { ...prev?.metadata, templateId: savedTemplateId }
              };
              // Fetch the code for the saved template on mount
              handleGenerateResume(savedTemplateId, updatedData);
              return updatedData;
            });
            didSetFromUser = true;
          }
        }
      } else {
        setUser(null);
      }
    });

    // Fetch default template if not set from user
    const fetchTemplate = async () => {
      if (!didSetFromUser) {
        try {
          const response = await apiGet('/template');
          if (response.ok) {
            const templateText = await response.text();
            setLatex(templateText);
          }
        } catch (error) {
          console.error('Error fetching template:', error);
        }
      }
    };
    fetchTemplate();

    return () => unsubscribe();
  }, []);

  // Save resume data to Firestore
  const saveResumeData = async () => {
    if (!user) {
      setError('Please sign in to save your resume');
      return;
    }

    setSaveStatus('Saving...');
    setError(null);

    try {
      const userDocRef = doc(db, 'userResumes', user.uid);
      await setDoc(userDocRef, {
        resumeData: resumeData,
        latex: latex,
        updatedAt: new Date().toISOString()
      });

      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setError('Error saving resume: ' + err.message);
      setSaveStatus('');
    }
  };

  // Google Sign-In
  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      return result.user; // Return user for chaining
    } catch (error) {
      setError('Error signing in with Google: ' + error.message);
      return null;
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      setError('Error signing out: ' + error.message);
    }
  };

  // Auto-save: debounced save 30s after last change
  useEffect(() => {
    if (!user) return;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      const userDocRef = doc(db, 'userResumes', user.uid);
      setDoc(userDocRef, {
        resumeData: resumeData,
        latex: latex,
        updatedAt: new Date().toISOString()
      }).then(() => {
        setSaveStatus('Auto-saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }).catch(() => {});
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [resumeData, latex, user]);

  // Handle form data changes
  const handleFormDataChange = useCallback((data) => {
    setResumeData(data);
  }, []);

  // Generate resume from form data
  const handleGenerateResume = async (templateIdOverride = null, dataOverride = null) => {
    const dataToUse = dataOverride || resumeData;
    if (!dataToUse) {
      setError('Please fill out the form first');
      return;
    }

    setLoading(true);
    setPdfUrl(null);
    setError(null);

    try {
      const templateId = templateIdOverride || dataToUse.metadata?.templateId || localStorage.getItem('selectedTemplateId') || 'deedy';

      const dataWithUserId = {
        ...dataToUse,
        userId: user?.uid || 'guest',
        metadata: { ...dataToUse.metadata, templateId }
      };

      // 1. First, fetch the raw LaTeX code to update the editor on the left
      const latexRes = await apiPost('/template/generate', {
        resumeData: dataWithUserId,
        templateId
      });

      if (!latexRes.ok) {
        throw new Error('Failed to generate LaTeX code');
      }

      const generatedLatex = await latexRes.text();
      console.log(`[Frontend] Received LaTeX (first 100 chars): ${generatedLatex.substring(0, 100).replace(/\n/g, ' ')}...`);
      setLatex(generatedLatex); // Updates the left-hand editor

      // 2. Then, compile that LaTeX into a PDF for the right-hand preview
      await handleCompile(generatedLatex);

    } catch (err) {
      setError('Error generating resume: ' + err.message);
      setLoading(false);
    }
  };

  // Handle LaTeX compilation (for editor mode)
  const handleCompile = async (latexOverride = null) => {
    const latexToCompile = latexOverride || latex;

    setLoading(true);
    setPdfUrl(null);
    setError(null);

    try {
      const res = await apiPost('/compile', { latex: latexToCompile });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 429 && errorData.upgrade) {
          toast.error('Daily compilation limit reached. Upgrade to Pro for unlimited!', { duration: 5000 });
          throw new Error(errorData.message || 'Limit reached');
        }
        throw new Error(errorData.error || 'Compilation failed');
      }

      const blob = await res.blob();
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError('Error compiling LaTeX: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle template selection
  const handleTemplateSelect = async (templateId) => {
    // Store preference
    localStorage.setItem('selectedTemplateId', templateId);

    let currentUser = user;
    if (!currentUser) {
      currentUser = await signIn();
    }

    if (currentUser) {
      const updatedData = {
        ...resumeData,
        metadata: { ...resumeData.metadata, templateId }
      };
      setResumeData(updatedData);
      setViewingTemplates(false);
      // Automatically regenerate resume to show new template
      console.log(`[Frontend] Triggering generation for template: ${templateId}`);
      handleGenerateResume(templateId, updatedData);
    }
  };

  if (viewingPricing) {
    return (
      <PricingPage
        currentTier={subscription.tier}
        onBack={() => setViewingPricing(false)}
      />
    );
  }

  if (viewingTemplates) {
    return <TemplatesPage onBack={() => setViewingTemplates(false)} onSelect={handleTemplateSelect} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen font-sans text-slate-900">
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-200/50">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <span className="text-xl font-black gradient-text">ResumeGenie.AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewingTemplates(true)}
              className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors"
            >
              Templates
            </button>
            <button
              onClick={signIn}
              className="px-5 py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 hover:-translate-y-0.5 transition-all duration-300"
            >
              Log in
            </button>
          </div>
        </header>
        <LandingPage onSignIn={signIn} onViewTemplates={() => setViewingTemplates(true)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full font-sans text-slate-900 flex flex-col bg-slate-50/80">
      <Toaster position="top-right" toastOptions={{
        style: { fontSize: '13px', borderRadius: '16px', fontWeight: 600, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' },
        success: { duration: 3000, style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
        error: { duration: 5000, style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
      }} />

      <UsageBanner onUpgrade={() => setViewingPricing(true)} />

      {/* Header */}
      <header className="px-5 py-3 flex justify-between items-center border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-200/50">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <span className="text-lg font-black gradient-text hidden sm:block">ResumeGenie</span>
          </div>

          <div className="h-6 w-px bg-slate-200/80" />
          <ModeToggle mode={mode} onModeChange={setMode} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewingTemplates(true)}
            className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
          >
            Templates
          </button>
          <button
            onClick={() => setViewingPricing(true)}
            className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
          >
            Pricing
          </button>

          <div className="h-6 w-px bg-slate-200/80 mx-1" />

          {subscription.tier === 'free' && (
            <button
              onClick={() => setViewingPricing(true)}
              className="px-3 py-1.5 text-[10px] font-black bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-200/50 transition-all hover:-translate-y-0.5 uppercase tracking-wide"
            >
              Upgrade
            </button>
          )}

          <button
            onClick={saveResumeData}
            disabled={saveStatus === 'Saving...'}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300 hover:-translate-y-0.5 ${
              saveStatus === 'Saved successfully!'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200/50'
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200/50'
            }`}
          >
            {saveStatus === 'Saving...' ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving
              </>
            ) : saveStatus === 'Saved successfully!' ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Saved
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                Save
              </>
            )}
          </button>

          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-7 h-7 rounded-lg object-cover ring-2 ring-slate-100" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-black">
                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                </div>
              )}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide ${
                subscription.tier === 'enterprise' ? 'bg-amber-100 text-amber-700' :
                subscription.tier === 'pro' ? 'bg-purple-100 text-purple-700' :
                'bg-slate-100 text-slate-500'
              }`}>
                {subscription.tier}
              </span>
            </button>

            <div className="absolute right-0 top-full mt-1 w-48 py-1 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user.displayName || 'User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4 max-w-[1920px] mx-auto w-full">
        {mode === 'resume-analyzer' ? (
          <div className="w-full h-full rounded-2xl shadow-xl shadow-slate-200/30 border border-slate-200/60 overflow-hidden bg-white">
            <ResumeAnalyzer />
          </div>
        ) : mode === 'career-insights' ? (
          <div className="w-full h-full rounded-2xl shadow-xl shadow-slate-200/30 border border-slate-200/60 overflow-hidden bg-white">
            <CareerInsights
              resumeData={resumeData}
              onApplyTailored={(data) => {
                setResumeData(data);
                toast.success('Tailored resume applied! Switch to Builder to see changes.');
              }}
            />
          </div>
        ) : (
          <>
            {/* Left Panel */}
            <div className={`w-1/2 flex flex-col rounded-2xl shadow-xl shadow-slate-200/30 border border-slate-200/60 overflow-hidden transition-all duration-500 ${
              mode === 'editor' ? 'bg-[#1a1b26]' : 'bg-white'
            }`}>
              {mode === 'form' ? (
                <FormBuilder
                  resumeData={resumeData}
                  onDataChange={handleFormDataChange}
                  onGenerateResume={handleGenerateResume}
                />
              ) : (
                <div className="h-full flex flex-col relative">
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={() => handleCompile()}
                      disabled={loading}
                      className="px-5 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-purple-300/40 transition-all flex items-center gap-2 hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Compiling...
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          Compile PDF
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex-1">
                    <Editor
                      key={latex.substring(0, 50) + mode}
                      value={latex}
                      onChange={setLatex}
                      height="100%"
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineHeight: 1.7,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        padding: { top: 20, bottom: 20 },
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        renderLineHighlight: 'gutter',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: PDF Preview */}
            <div className="w-1/2 flex flex-col rounded-2xl border border-slate-200/60 overflow-hidden bg-slate-100/50 relative">
              <div className="flex-1 p-6 flex justify-center items-start overflow-y-auto custom-scrollbar">
                <div className="shadow-2xl shadow-slate-400/10 rounded-lg transition-transform duration-300 w-full h-full bg-white ring-1 ring-slate-200/50">
                  <Preview pdfUrl={pdfUrl} loading={loading} />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
