'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase/config';

export default function MarketingHeader() {
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push('/builder');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-200/50">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <Link href="/" className="text-xl font-black gradient-text">
          ResumeGenie.AI
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/templates"
          className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors"
        >
          Templates
        </Link>
        <button
          onClick={handleSignIn}
          className="px-5 py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 hover:-translate-y-0.5 transition-all duration-300"
        >
          Log in
        </button>
      </div>
    </header>
  );
}
