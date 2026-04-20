import type { Metadata } from 'next';
import ResumeRoast from '@/components/roast/ResumeRoast';

export const metadata: Metadata = {
  title: 'Free AI Resume Roast | ResumeGenie.AI',
  description:
    'Get brutally honest AI feedback on your resume. No sugarcoating, no sign-up required. Find out what recruiters really think.',
  keywords: ['resume roast', 'resume review', 'resume feedback', 'AI resume', 'free resume critique'],
  openGraph: {
    title: 'Free AI Resume Roast | ResumeGenie.AI',
    description:
      'Get brutally honest AI feedback on your resume. No sugarcoating, no sign-up required.',
    type: 'website',
    url: 'https://resumegenie.ai/roast',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Resume Roast',
    description: 'Get brutally honest AI feedback on your resume. No sign-up required.',
  },
};

export default function RoastPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <ResumeRoast />
    </div>
  );
}
