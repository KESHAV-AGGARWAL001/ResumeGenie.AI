'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import AppHeader from '@/components/layout/AppHeader';
import UsageBanner from '@/components/layout/UsageBanner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50/80">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full font-sans text-slate-900 flex flex-col bg-slate-50/80">
      <UsageBanner />
      <AppHeader />
      <main className="flex-1 flex overflow-hidden p-5 gap-5 max-w-[1920px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
