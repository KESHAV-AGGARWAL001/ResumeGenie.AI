'use client';

import { useCallback } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import { useAuthStore } from '@/stores/auth-store';
import { useAutoSave } from '@/hooks/useAutoSave';
import { apiPost } from '@/lib/api';
import FormBuilder from '@/components/builder/FormBuilder';
import PdfPreview from '@/components/preview/PdfPreview';
import type { ResumeData } from '@/lib/types';
import toast from 'react-hot-toast';

export default function BuilderPage() {
  const { resumeData, latex, pdfUrl, loading, setResumeData, setLatex, setPdfUrl, setLoading, setError } =
    useResumeStore();
  const { user } = useAuthStore();

  useAutoSave();

  const handleCompile = useCallback(
    async (latexOverride: string | null = null) => {
      const latexToCompile = latexOverride || latex;

      setLoading(true);
      setPdfUrl(null);
      setError(null);

      try {
        const res = await apiPost('/compile', { latex: latexToCompile });

        if (!res.ok) {
          const errorData = await res.json();
          if (res.status === 429 && errorData.upgrade) {
            toast.error('Daily compilation limit reached. Upgrade to Pro for unlimited!', { duration: 5000 });
            throw new Error(errorData.message || 'Limit reached');
          }
          throw new Error(errorData.error || 'Compilation failed');
        }

        const blob = await res.blob();
        setPdfUrl(URL.createObjectURL(blob));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Compilation failed';
        setError('Error compiling LaTeX: ' + message);
      } finally {
        setLoading(false);
      }
    },
    [latex, setLoading, setPdfUrl, setError],
  );

  const handleGenerateResume = useCallback(
    async (templateIdOverride: string | null = null, dataOverride: ResumeData | null = null) => {
      const dataToUse = dataOverride || resumeData;
      if (!dataToUse) {
        setError('Please fill out the form first');
        return;
      }

      setLoading(true);
      setPdfUrl(null);
      setError(null);

      try {
        const templateId =
          templateIdOverride ||
          dataToUse.metadata?.templateId ||
          localStorage.getItem('selectedTemplateId') ||
          'deedy';

        const dataWithUserId = {
          ...dataToUse,
          userId: user?.uid || 'guest',
          metadata: { ...dataToUse.metadata, templateId },
        };

        const latexRes = await apiPost('/template/generate', {
          resumeData: dataWithUserId,
          templateId,
        });

        if (!latexRes.ok) {
          throw new Error('Failed to generate LaTeX code');
        }

        const generatedLatex = await latexRes.text();
        setLatex(generatedLatex);

        await handleCompile(generatedLatex);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Generation failed';
        setError('Error generating resume: ' + message);
        setLoading(false);
      }
    },
    [resumeData, user, setLatex, setLoading, setPdfUrl, setError, handleCompile],
  );

  const handleFormDataChange = useCallback(
    (data: ResumeData) => {
      setResumeData(data);
    },
    [setResumeData],
  );

  return (
    <>
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col rounded-2xl shadow-xl shadow-slate-200/30 border border-slate-200/60 overflow-hidden transition-all duration-500 bg-white">
        <FormBuilder
          resumeData={resumeData}
          onDataChange={handleFormDataChange}
          onGenerateResume={handleGenerateResume}
        />
      </div>

      {/* Right Panel: PDF Preview */}
      <div className="w-1/2 flex flex-col rounded-2xl border border-slate-200/60 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 relative">
        <div className="flex-1 p-6 flex justify-center items-start overflow-y-auto custom-scrollbar">
          <div className="shadow-2xl shadow-slate-400/10 rounded-lg transition-transform duration-300 w-full h-full bg-white ring-1 ring-slate-200/50">
            <PdfPreview pdfUrl={pdfUrl} loading={loading} />
          </div>
        </div>
      </div>
    </>
  );
}
