'use client';

import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase/config';
import Link from 'next/link';

export default function HeroSection() {
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
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="animate-fade-in-up inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm text-sm font-semibold text-purple-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Powered by Gemini 2.5 Flash AI
        </div>

        <h1 className="animate-fade-in-up stagger-1 text-6xl md:text-8xl font-black tracking-tight leading-[0.95]">
          <span className="text-slate-900">Build a resume</span>
          <br />
          <span className="gradient-text">that gets interviews.</span>
        </h1>

        <p className="animate-fade-in-up stagger-2 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
          LaTeX-quality PDFs in seconds. AI-powered scoring &amp; optimization.
          Trusted by engineers at top tech companies.
        </p>

        <div className="animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button
            onClick={handleSignIn}
            className="group relative px-8 py-4 text-lg font-bold text-white rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 shadow-xl shadow-purple-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-1 active:translate-y-0 flex items-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
            </svg>
            Get Started Free
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>

          <Link
            href="/templates"
            className="px-8 py-4 text-lg font-semibold text-slate-600 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl hover:bg-white hover:border-slate-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            Browse Templates
          </Link>
        </div>

        <div className="animate-fade-in-up stagger-4 pt-8 flex items-center justify-center gap-3 text-sm text-slate-400">
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white ring-2 ring-white shadow-sm bg-gradient-to-br from-purple-400 to-pink-400"
                style={{ opacity: 1 - i * 0.15 }}
              />
            ))}
          </div>
          <span className="font-medium">
            Join 10,000+ engineers building better resumes
          </span>
        </div>
      </div>
    </section>
  );
}
