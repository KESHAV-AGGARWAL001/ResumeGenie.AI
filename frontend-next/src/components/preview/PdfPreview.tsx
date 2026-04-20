'use client';

import { useRef } from 'react';
import { FileText, Download, AlertCircle } from 'lucide-react';

interface PdfPreviewProps {
  pdfUrl: string | null;
  loading: boolean;
  error?: string | null;
}

export default function PdfPreview({ pdfUrl, loading, error }: PdfPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="w-full h-full rounded-xl bg-white flex flex-col overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50/80 to-purple-50/30 backdrop-blur-sm">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview</span>
        {pdfUrl && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-purple-200/50 transition-all hover:-translate-y-0.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100/50">
        {loading ? (
          <div className="flex flex-col items-center gap-4 backdrop-blur-sm bg-white/50 p-10 rounded-2xl">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 border-4 border-purple-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">Compiling your resume</p>
              <p className="text-xs text-slate-400 mt-1">Powered by XeLaTeX engine</p>
            </div>
          </div>
        ) : pdfUrl ? (
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            title="PDF Preview"
            sandbox="allow-same-origin"
            className="w-full h-full min-h-[60vh] flex-1"
            style={{ border: 'none', background: 'transparent' }}
          />
        ) : error ? (
          <div className="flex flex-col items-center gap-4 p-16 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-red-600">Compilation Error</p>
              <p className="text-xs text-red-400 mt-2 leading-relaxed">{error}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-16">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/60 flex items-center justify-center">
              <FileText className="w-9 h-9 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-500">No preview yet</p>
              <p className="text-sm text-slate-400 mt-1 max-w-[240px]">
                Fill out the form and generate your resume to see it here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
