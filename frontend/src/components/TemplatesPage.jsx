import React from 'react';

const TEMPLATES = [
    {
        id: 'deedy',
        name: 'Deedy Reversed',
        description: 'The classic two-column layout preferred by top tech companies. Highlight your skills and education alongside your experience.',
        tags: ['Two Column', 'Tech', 'Compact'],
        color: 'bg-slate-800' // Placeholder for thumbnail style
    },
    {
        id: 'jakes',
        name: "Jake's Resume (Overleaf)",
        description: 'The gold standard for single-column resumes. Optimized for ATS parsing and maximum content density. Used by thousands of successful applicants.',
        tags: ['Single Column', 'ATS Friendly', 'Dense'],
        color: 'bg-white border-2 border-slate-200'
    },
    {
        id: 'moderncv',
        name: 'Modern CV',
        description: 'A widely used, professional single-column layout suitable for corporate and academic roles.',
        tags: ['Classic', 'Professional'],
        color: 'bg-gray-50 border border-gray-200'
    },
    {
        id: 'modern',
        name: 'Modern Single Column',
        description: 'A clean, modern single-column design with a distinct header and clear hierarchy.',
        tags: ['Single Column', 'Modern', 'Clean'],
        color: 'bg-white border border-gray-300'
    },
    {
        id: 'moderndeedy',
        name: 'Modern Deedy',
        description: 'A refreshed take on the classic two-column layout with improved typography and spacing.',
        tags: ['Two Column', 'Modern', 'Compact'],
        color: 'bg-slate-50 border border-slate-200'
    }
];

export default function TemplatesPage({ onBack, onSelect }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    >
                        ← Back
                    </button>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        Resume Templates
                    </span>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">
                        Choose Your Style
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Professionally designed templates that follow best practices for ATS compatibility and readability.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {TEMPLATES.map(template => (
                        <div
                            key={template.id}
                            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col"
                        >
                            {/* Visual Preview Placeholder */}
                            <div className="h-64 bg-gray-100 relative overflow-hidden flex items-center justify-center p-8 group-hover:bg-purple-50/50 transition-colors">
                                {/* Abstract Representation of Layout */}
                                {['deedy', 'moderndeedy'].includes(template.id) ? (
                                    <div className="w-40 h-56 bg-white shadow-sm flex flex-row p-2 gap-2 text-[4px] text-gray-300">
                                        <div className="w-1/3 flex flex-col gap-1">
                                            <div className="w-full h-8 bg-gray-800 rounded-sm mb-2"></div>
                                            <div className="w-full h-2 bg-gray-200 rounded-sm"></div>
                                            <div className="w-full h-2 bg-gray-200 rounded-sm"></div>
                                            <div className="w-full h-10 bg-gray-100 rounded-sm mt-2"></div>
                                        </div>
                                        <div className="w-2/3 flex flex-col gap-1">
                                            <div className="w-full h-4 bg-gray-100 rounded-sm"></div>
                                            <div className="w-full h-20 bg-gray-50 rounded-sm border border-gray-100"></div>
                                            <div className="w-full h-20 bg-gray-50 rounded-sm border border-gray-100"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-40 h-56 bg-white shadow-sm flex flex-col p-3 gap-2 text-[4px] text-gray-300">
                                        <div className="w-full h-6 bg-gray-800 rounded-sm mx-auto mb-1"></div>
                                        <div className="w-full h-px bg-gray-200"></div>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="w-1/3 h-2 bg-gray-200 rounded-sm"></div>
                                            <div className="w-full h-12 bg-gray-50 rounded-sm border border-gray-100"></div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="w-1/3 h-2 bg-gray-200 rounded-sm"></div>
                                            <div className="w-full h-12 bg-gray-50 rounded-sm border border-gray-100"></div>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <button
                                        onClick={() => onSelect(template.id)}
                                        className="px-6 py-3 bg-white text-gray-900 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
                                    >
                                        Use This Template
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 flex-1">{template.description}</p>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {template.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
