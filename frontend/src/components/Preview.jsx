import React, { useRef } from 'react';

export default function Preview({ pdfUrl, loading }) {
    const iframeRef = useRef(null);

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
            <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview</span>
                {pdfUrl && (
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-purple-200/50 transition-all hover:-translate-y-0.5"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100/50">
                {loading ? (
                    <div className="flex flex-col items-center gap-4">
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
                        className="w-full h-full min-h-[60vh] flex-1"
                        style={{ border: 'none', background: 'transparent' }}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4 text-slate-400 p-16">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-slate-500">No preview yet</p>
                            <p className="text-xs text-slate-300 mt-1 max-w-[200px]">Fill out the form and generate your resume to see it here</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
