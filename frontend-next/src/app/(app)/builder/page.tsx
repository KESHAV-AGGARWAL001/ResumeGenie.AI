'use client';

import { useCallback, useRef } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import { useAuthStore } from '@/stores/auth-store';
import { useAutoSave } from '@/hooks/useAutoSave';
import { apiPost } from '@/lib/api';
import FormBuilder from '@/components/builder/FormBuilder';
import PdfPreview from '@/components/preview/PdfPreview';
import AtsScoreWidget from '@/components/builder/AtsScoreWidget';
import type { ResumeData } from '@/lib/types';
import toast from 'react-hot-toast';

export default function BuilderPage() {
  const { resumeData, latex, pdfUrl, loading, error, setResumeData, setLatex, setPdfUrl, setLoading, setError } =
    useResumeStore();
  const { user } = useAuthStore();
  const prevBlobUrlRef = useRef<string | null>(null);

  useAutoSave();

  const handleCompile = useCallback(
    async (latexToCompile: string) => {
      setLoading(true);
      setError(null);

      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current);
        prevBlobUrlRef.current = null;
      }
      setPdfUrl(null);

      try {
        const res = await apiPost('/compile', { latex: latexToCompile });

        if (!res.ok) {
          let errorMsg = 'Compilation failed';
          try {
            const errorData = await res.json();
            if (res.status === 429 && errorData.upgrade) {
              toast.error('Daily compilation limit reached. Upgrade to Pro for unlimited!', { duration: 5000 });
              throw new Error(errorData.message || 'Limit reached');
            }
            errorMsg = errorData.error || errorData.message || errorMsg;
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== 'Limit reached') {
              errorMsg = `Server error (${res.status})`;
            } else {
              throw parseErr;
            }
          }
          throw new Error(errorMsg);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        prevBlobUrlRef.current = url;
        setPdfUrl(url);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Compilation failed';
        setError(message);
        toast.error(message, { duration: 5000 });
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setPdfUrl, setError],
  );

  const handleGenerateResume = useCallback(
    async (templateIdOverride: string | null = null, dataOverride: ResumeData | null = null) => {
      const dataToUse = dataOverride || resumeData;
      if (!dataToUse) {
        toast.error('Please fill out the form first');
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
          let errorMsg = 'Failed to generate LaTeX code';
          try {
            const errData = await latexRes.json();
            errorMsg = errData.error || errData.message || errorMsg;
          } catch {
            // response wasn't JSON
          }
          throw new Error(errorMsg);
        }

        const generatedLatex = await latexRes.text();
        setLatex(generatedLatex);

        await handleCompile(generatedLatex);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Generation failed';
        setError(message);
        toast.error(message, { duration: 5000 });
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
            <PdfPreview pdfUrl={pdfUrl} loading={loading} error={error} />
          </div>
        </div>
      </div>

      <AtsScoreWidget />
    </>
  );
}
