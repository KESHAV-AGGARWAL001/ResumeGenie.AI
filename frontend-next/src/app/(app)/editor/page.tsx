'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useResumeStore } from '@/stores/resume-store';
import { useAutoSave } from '@/hooks/useAutoSave';
import { apiPost } from '@/lib/api';
import PdfPreview from '@/components/preview/PdfPreview';
import toast from 'react-hot-toast';

const LaTeXEditor = dynamic(() => import('@/components/editor/LaTeXEditor'), { ssr: false });

export default function EditorPage() {
  const { latex, pdfUrl, loading, setLatex, setPdfUrl, setLoading, setError } = useResumeStore();

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

  return (
    <>
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col rounded-2xl shadow-xl shadow-slate-200/30 border border-slate-200/60 overflow-hidden transition-all duration-500 bg-[#1a1b26]">
        <div className="h-full flex flex-col relative">
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => handleCompile()}
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-purple-300/40 transition-all flex items-center gap-2 hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Compiling...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Compile PDF
                </>
              )}
            </button>
          </div>
          <div className="flex-1">
            <LaTeXEditor
              value={latex}
              onChange={setLatex}
              height="100%"
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineHeight: 1.7,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 20, bottom: 20 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                renderLineHighlight: 'gutter',
              }}
            />
          </div>
        </div>
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
