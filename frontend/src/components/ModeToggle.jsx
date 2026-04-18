import React from 'react';

export default function ModeToggle({ mode, onModeChange }) {
    return (
        <div className="flex bg-gray-100/80 p-1.5 rounded-xl border border-gray-200/50 backdrop-blur-sm">
            <button
                onClick={() => onModeChange('form')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'form'
                    ? 'bg-white text-purple-700 shadow-sm ring-1 ring-black/5 transform scale-100'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Form Builder
            </button>
            <button
                onClick={() => onModeChange('editor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'editor'
                    ? 'bg-white text-purple-700 shadow-sm ring-1 ring-black/5 transform scale-100'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Code Editor
            </button>
            <button
                onClick={() => onModeChange('resume-analyzer')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'resume-analyzer'
                    ? 'bg-white text-purple-700 shadow-sm ring-1 ring-black/5 transform scale-100'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resume PDF Analyzer
            </button>
        </div>
    );
}
