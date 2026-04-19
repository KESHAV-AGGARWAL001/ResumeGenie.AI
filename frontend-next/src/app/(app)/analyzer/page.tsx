'use client';

import ResumeAnalyzer from '@/components/analyzer/ResumeAnalyzer';

export default function AnalyzerPage() {
  return (
    <div className="w-full h-full rounded-2xl shadow-xl shadow-slate-200/30 border border-slate-200/60 overflow-hidden bg-white">
      <ResumeAnalyzer />
    </div>
  );
}
