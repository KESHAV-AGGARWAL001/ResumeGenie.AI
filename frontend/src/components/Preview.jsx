import React, { useRef, useState } from 'react';

export default function Preview({ pdfUrl }) {
    const iframeRef = useRef(null);
    const [zoom, setZoom] = useState(1);

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
        <div className="w-full h-full rounded-lg shadow border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
            <div className="p-2 border-b flex justify-end gap-2 bg-white dark:bg-gray-900">
                <button
                    onClick={handleDownload}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 shadow"
                >
                    Download PDF
                </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 dark:bg-gray-950">
                {pdfUrl ? (
                    <iframe
                        ref={iframeRef}
                        src={pdfUrl}
                        title="PDF Preview"
                        className="w-full h-full min-h-[60vh] flex-1"
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', border: 'none', background: 'transparent' }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        PDF preview will appear here
                    </div>
                )}
            </div>
        </div>
    );
}