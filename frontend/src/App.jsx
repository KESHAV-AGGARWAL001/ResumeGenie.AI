import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import TemplatesPage from './components/TemplatesPage';
import Editor from './components/Editor';
import Preview from './components/Preview';
import FormBuilder from './components/FormBuilder/FormBuilder';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import ModeToggle from './components/ModeToggle';
import { auth, provider, db } from './firebase';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { apiGet, apiPost, BACKEND_URL } from './utils/api';

const DEFAULT_LATEX = `\\documentclass[letterpaper,11pt]{article}
% ... (Deedy template content here or load from backend)
`;

const INITIAL_RESUME_DATA = {
  personalInfo: {
    name: "Keshav Mittal",
    email: "keshav.mittal1105@gmail.com",
    phone: "+91-9413514915",
    location: "Noida, INDIA"
  },
  socialProfiles: {
    linkedin: "https://linkedin.com/in/keshav-mittal",
    github: "https://github.com/keshav-mittal",
    leetcode: "https://leetcode.com/keshav-mittal",
    codechef: "https://www.codechef.com/users/keshav-mittal"
  },
  experience: [
    {
      id: "exp1",
      company: "Ultimate Kronos Group (UKG)",
      position: "Software Development Engineer 1",
      location: "Noida, INDIA",
      startDate: "Aug 2025",
      endDate: "Present",
      techStack: ["Java", "PostgreSQL", "Terraform", "Python", "GCP"],
      bulletPoints: [
        "Re-architected a mission-critical payroll API by shifting from cache-based retrieval to PostgreSQL paginated querying (65k row chunks), eliminating timeout failures and reducing infrastructure cost.",
        "Created a GitHub Actions workflow to automate GCP secret migrations using Terraform, Python; required for the Deploy Service pipeline and project creation on GCP saved time (20 min/project).",
        "Building an AI diagnostic agent integrating Teams, GitHub, Jira, and PES APIs to surface swarm issues and accelerate root-cause identification."
      ]
    },
    {
      id: "exp2",
      company: "WebSonix",
      position: "Software Developer Intern",
      location: "Mumbai, INDIA",
      startDate: "May 2024",
      endDate: "Nov 2024",
      techStack: ["ReactJS", "Firebase"],
      bulletPoints: [
        "Engineered and deployed an innovative web portal using ReactJS with Firebase backend services.",
        "Interacted with 200+ potential customers, preparing the product for launch and building community interest.",
        "Optimized performance by reducing response time from 3s to under 1s."
      ]
    }
  ],
  projects: [
    {
      id: "proj1",
      name: "ResumeGenie.AI",
      techStack: ["React.js", "TypeScript", "Node.js", "Express.js", "Gemini 2.0", "Firebase", "Docker", "XeLaTeX"],
      link: "",
      bulletPoints: [
        "Engineered a comprehensive AI Career Consultant using Gemini 2.0 Flash, delivering real-time resume analysis, scoring, and role-specific optimizations with 95%+ accuracy.",
        "Developed a dynamic LaTeX multi-template engine supporting professional layouts (Deedy, Jakes, ModernCV), enabling instant design synchronization via Express.js.",
        "Architected a scalable PDF compilation pipeline leveraging Dockerized XeLaTeX environments, reducing document generation latency to <2 seconds.",
        "Integrated Firebase Auth and Firestore for secure profile management, allowing users to apply AI-driven revisions directly to their structured resume data."
      ]
    },
    {
      id: "proj2",
      name: "Legal-text Summarizer",
      techStack: ["Python", "Spring Boot", "HuggingFace", "GenAI", "Dropbox"],
      link: "",
      bulletPoints: [
        "Fine-tuned a T5-based model for legal-text summarization through data preprocessing and task-specific training, improving summarization accuracy by 23% over baseline.",
        "Developed a Spring Boot service integrating Gemini 2.0 Flash and Dropbox to generate a dataset of 7,050 summaries with facts, arguments, and statutes via Generative AI APIs.",
        "Achieved a cosine similarity of 31.68% compared to the Illegal-Bert model from IIT Kharagpur and automated weekly scraping of ˜200 legal cases/month using BeautifulSoup to expand the dataset."
      ]
    }
  ],
  skills: {
    languages: ["C++", "Java", "Python", "HTML", "CSS", "JavaScript"],
    frameworks: ["Next.js", "Spring Boot", "React.js", "Node.js", "Express.js"],
    databases: ["MongoDB", "MySQL", "PostgreSQL"],
    tools: ["Git", "GitHub", "Postman", "Redis", "Docker", "Kubernetes", "Terraform", "SOLID", "HLD", "LLD", "OOPS", "DBMS", "OS", "CN"]
  },
  achievements: [
    "Solved 1500+ DSA problems on LeetCode (top 7.89%, rating 1793) and 550+ on CodeChef.",
    "Top 5% among 5000+ in Adobe’s GenSolve Hackathon, showcasing strong team collaboration.",
    "Secured 3rd rank (NITH) in Codekaze with an AIR 717.",
    "Runner-Up in Inter-Year Table Tennis Doubles, 2025 at NIT Hamirpur."
  ],
  certifications: [],
  education: [
    {
      id: "edu1",
      institution: "National Institute of Technology, Hamirpur",
      degree: "Bachelor of Technology in Computer Science and Engineering",
      location: "Hamirpur",
      startDate: "Dec 2021",
      endDate: "May 2025",
      gpa: "9.07 / 10.0",
      honors: []
    }
  ]
};

export default function App() {
  const [mode, setMode] = useState('form'); // 'form' or 'editor'
  const [latex, setLatex] = useState(DEFAULT_LATEX);
  const [resumeData, setResumeData] = useState(INITIAL_RESUME_DATA);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewingTemplates, setViewingTemplates] = useState(false); // Added state
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  // Load template from backend when component mounts
  useEffect(() => {
    let didSetFromUser = false;

    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
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

  if (viewingTemplates) {
    return <TemplatesPage onBack={() => setViewingTemplates(false)} onSelect={handleTemplateSelect} />;
  }

  if (!user) {

    return (
      <div className="min-h-screen font-sans text-gray-900">
        <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-10 relative">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              ResumeGenie.AI
            </span>
          </div>
          <button
            onClick={signIn}
            className="text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors"
          >
            Log in
          </button>
        </header>
        <LandingPage onSignIn={signIn} onViewTemplates={() => setViewingTemplates(true)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full font-sans text-gray-900 flex flex-col bg-gray-50/50">

      {/* Modern Header */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            ResumeGenie
          </span>
          <ModeToggle mode={mode} onModeChange={setMode} />
          <div className="h-6 w-px bg-gray-200"></div>
          <button
            onClick={() => setViewingTemplates(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
          >
            <span className="text-lg">🖼️</span> Templates
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-600">
              {user.displayName || user.email}
            </span>
          </div>

          <button
            onClick={saveResumeData}
            disabled={saveStatus === 'Saving...'}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg shadow-lg transition-all hover:-translate-y-0.5 ${saveStatus === 'Saved successfully!'
              ? 'bg-green-600 text-white shadow-green-200'
              : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-200'
              }`}
          >
            {saveStatus === 'Saving...' ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Saving...
              </>
            ) : saveStatus === 'Saved successfully!' ? (
              <>
                <span>✓</span> Saved!
              </>
            ) : (
              <>
                <span>💾</span> Save Progress
              </>
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content Area - Card Style */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6 max-w-[1920px] mx-auto w-full">
        {mode === 'resume-analyzer' ? (
          <div className="w-full h-full rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden bg-white">
            <ResumeAnalyzer />
          </div>
        ) : (
          <>
            {/* Left Panel: Form, Editor or AI */}
            <div className={`w-1/2 flex flex-col rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-100/50 ring-1 ring-black/5 ${mode === 'editor' ? 'bg-[#1e1e1e]' : 'bg-white'
              }`}>
              {mode === 'form' ? (
                <FormBuilder
                  resumeData={resumeData}
                  onDataChange={handleFormDataChange}
                  onGenerateResume={handleGenerateResume}
                />
              ) : (
                <div className="h-full flex flex-col relative">
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => handleCompile()}
                      disabled={loading}
                      className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Compiling...
                        </>
                      ) : (
                        '⚡ Compile PDF'
                      )}
                    </button>
                  </div>
                  <div className="flex-1">
                    <Editor
                      key={latex.substring(0, 50) + mode} // Force refresh on content OR mode change
                      value={latex}
                      onChange={setLatex}
                      height="100%"
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineHeight: 1.6,
                        fontFamily: "'Fira Code', 'Monaco', monospace",
                        padding: { top: 24, bottom: 24 },
                        smoothScrolling: true
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: PDF Preview */}
            <div className="w-1/2 flex flex-col bg-gray-800/5 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden relative group">
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm -z-10"></div>

              {/* Preview Header/Controls could go here */}

              <div className="flex-1 p-8 flex justify-center items-start overflow-y-auto custom-scrollbar">
                <div className="shadow-2xl shadow-gray-400/20 rounded-sm transition-transform duration-300 w-full h-full bg-white">
                  <Preview pdfUrl={pdfUrl} />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
