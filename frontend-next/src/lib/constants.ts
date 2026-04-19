import type { ResumeData } from '@/lib/types';

export const DEFAULT_LATEX = `\\documentclass[letterpaper,11pt]{article}
% ... (Deedy template content here or load from backend)
`;

export const INITIAL_RESUME_DATA: ResumeData = {
  personalInfo: { name: '', email: '', phone: '', location: '' },
  socialProfiles: { linkedin: '', github: '', leetcode: '', codechef: '' },
  experience: [],
  projects: [],
  skills: { languages: [], frameworks: [], databases: [], tools: [] },
  achievements: [],
  certifications: [],
  education: [],
};

export const SITE_CONFIG = {
  name: 'ResumeGenie.AI',
  description: 'AI-powered resume builder with LaTeX-quality PDFs. Build professional resumes, get AI analysis, and optimize for ATS — all in seconds.',
  url: 'https://resumegenie.ai',
  ogImage: '/og-default.png',
  creator: 'ResumeGenie.AI',
};
