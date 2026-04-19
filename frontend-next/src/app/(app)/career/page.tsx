'use client';

import { useResumeStore } from '@/stores/resume-store';
import CareerInsights from '@/components/career/CareerInsights';
import type { ResumeData } from '@/lib/types';
import toast from 'react-hot-toast';

export default function CareerPage() {
  const { resumeData, setResumeData } = useResumeStore();

  const handleApplyTailored = (data: ResumeData) => {
    setResumeData(data);
    toast.success('Tailored resume applied! Switch to Builder to see changes.');
  };

  return (
    <div className="w-full h-full rounded-2xl shadow-xl shadow-slate-200/30 border border-slate-200/60 overflow-hidden bg-white">
      <CareerInsights resumeData={resumeData} onApplyTailored={handleApplyTailored} />
    </div>
  );
}
