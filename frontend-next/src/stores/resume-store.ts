import { create } from 'zustand';
import type { ResumeData } from '@/lib/types';
import { INITIAL_RESUME_DATA, DEFAULT_LATEX } from '@/lib/constants';

interface ResumeState {
  resumeData: ResumeData;
  latex: string;
  pdfUrl: string | null;
  loading: boolean;
  error: string | null;
  saveStatus: string;
  setResumeData: (data: ResumeData) => void;
  setLatex: (latex: string) => void;
  setPdfUrl: (url: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSaveStatus: (status: string) => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  resumeData: INITIAL_RESUME_DATA,
  latex: DEFAULT_LATEX,
  pdfUrl: null,
  loading: false,
  error: null,
  saveStatus: '',
  setResumeData: (resumeData) => set({ resumeData }),
  setLatex: (latex) => set({ latex }),
  setPdfUrl: (pdfUrl) => set({ pdfUrl }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
}));
