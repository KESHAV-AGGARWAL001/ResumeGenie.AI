'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useAuthStore } from '@/stores/auth-store';
import { useResumeStore } from '@/stores/resume-store';
import ModeToggle from '@/components/layout/ModeToggle';

export default function AppHeader() {
  const router = useRouter();
  const { user, subscription } = useAuthStore();
  const { resumeData, latex, saveStatus, setSaveStatus } = useResumeStore();

  const saveResumeData = async () => {
    if (!user) return;

    setSaveStatus('Saving...');

    try {
      const userDocRef = doc(db, 'userResumes', user.uid);
      await setDoc(userDocRef, {
        resumeData,
        latex,
        updatedAt: new Date().toISOString(),
      });

      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('Error saving resume:', err);
      setSaveStatus('');
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <header className="px-5 py-3 flex justify-between items-center border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-200/50">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-lg font-black gradient-text hidden sm:block">ResumeGenie</span>
        </div>

        <div className="h-6 w-px bg-slate-200/80" />
        <ModeToggle />
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/templates"
          className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
        >
          Templates
        </Link>
        <Link
          href="/pricing"
          className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
        >
          Pricing
        </Link>

        <div className="h-6 w-px bg-slate-200/80 mx-1" />

        {subscription.tier === 'free' && (
          <Link
            href="/pricing"
            className="px-3 py-1.5 text-[10px] font-black bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-200/50 transition-all hover:-translate-y-0.5 uppercase tracking-wide"
          >
            Upgrade
          </Link>
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
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
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
  );
}
