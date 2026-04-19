import React from 'react';

const TEMPLATES = [
    {
        id: 'deedy',
        name: 'Deedy Reversed',
        description: 'The classic two-column layout preferred by top tech companies.',
        tags: ['Two Column', 'Tech', 'Compact'],
        layout: 'two-col',
        gradient: 'from-slate-700 to-slate-900',
        popular: true,
    },
    {
        id: 'jakes',
        name: "Jake's Resume",
        description: 'The gold standard for single-column resumes. Optimized for ATS parsing.',
        tags: ['Single Column', 'ATS Friendly', 'Dense'],
        layout: 'single-col',
        gradient: 'from-violet-600 to-purple-800',
        popular: true,
    },
    {
        id: 'moderncv',
        name: 'Modern CV',
        description: 'A professional layout suitable for corporate and academic roles.',
        tags: ['Classic', 'Professional'],
        layout: 'single-col',
        gradient: 'from-sky-500 to-blue-700',
    },
    {
        id: 'modern',
        name: 'Modern Single Column',
        description: 'Clean, modern design with a distinct header and clear hierarchy.',
        tags: ['Single Column', 'Modern', 'Clean'],
        layout: 'single-col',
        gradient: 'from-emerald-500 to-teal-700',
    },
    {
        id: 'moderndeedy',
        name: 'Modern Deedy',
        description: 'A refreshed two-column layout with improved typography and spacing.',
        tags: ['Two Column', 'Modern', 'Compact'],
        layout: 'two-col',
        gradient: 'from-rose-500 to-pink-700',
    }
];

function TemplatePreview({ layout, gradient }) {
    if (layout === 'two-col') {
        return (
            <div className="w-36 h-48 bg-white rounded-lg shadow-xl flex flex-row overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                <div className={`w-[38%] bg-gradient-to-b ${gradient} p-2 flex flex-col gap-1.5`}>
                    <div className="w-full h-5 rounded-sm bg-white/20" />
                    <div className="w-3/4 h-1.5 rounded-full bg-white/15" />
                    <div className="w-full h-1.5 rounded-full bg-white/15" />
                    <div className="w-2/3 h-1.5 rounded-full bg-white/15" />
                    <div className="mt-auto w-full h-8 rounded-sm bg-white/10" />
                </div>
                <div className="flex-1 p-2 flex flex-col gap-1.5">
                    <div className="w-full h-3 rounded-sm bg-slate-100" />
                    <div className="w-full h-14 rounded-sm bg-slate-50 border border-slate-100" />
                    <div className="w-1/2 h-2 rounded-sm bg-slate-100" />
                    <div className="w-full h-14 rounded-sm bg-slate-50 border border-slate-100" />
                </div>
            </div>
        );
    }
    return (
        <div className="w-36 h-48 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
            <div className={`h-10 bg-gradient-to-r ${gradient} flex items-end px-3 pb-1.5`}>
                <div className="w-16 h-2 rounded-full bg-white/30" />
            </div>
            <div className="flex-1 p-2.5 flex flex-col gap-1.5">
                <div className="w-1/3 h-2 rounded-sm bg-slate-200" />
                <div className="w-full h-10 rounded-sm bg-slate-50 border border-slate-100" />
                <div className="w-1/4 h-2 rounded-sm bg-slate-200" />
                <div className="w-full h-10 rounded-sm bg-slate-50 border border-slate-100" />
                <div className="w-1/3 h-2 rounded-sm bg-slate-200" />
                <div className="w-full h-6 rounded-sm bg-slate-50 border border-slate-100" />
            </div>
        </div>
    );
}

export default function TemplatesPage({ onBack, onSelect }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="px-6 py-3.5 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-lg font-black gradient-text">Templates</span>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
                <div className="text-center mb-14 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-xs font-bold text-purple-600 mb-6">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                        5 Battle-Tested Layouts
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                        Pick a template. <span className="gradient-text">Stand out.</span>
                    </h1>
                    <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
                        Every template is ATS-optimized, LaTeX-powered, and used by engineers at FAANG companies.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TEMPLATES.map((template, i) => (
                        <div
                            key={template.id}
                            className="animate-fade-in-up group relative bg-white rounded-2xl overflow-hidden border border-slate-200/60 hover:border-slate-300 hover:shadow-2xl hover:shadow-purple-100/40 transition-all duration-500 hover:-translate-y-1 flex flex-col cursor-pointer"
                            style={{ animationDelay: `${0.06 * i}s` }}
                        >
                            {template.popular && (
                                <div className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black rounded-lg shadow-lg shadow-purple-200/50 uppercase tracking-wide">
                                    Popular
                                </div>
                            )}

                            <div className={`h-56 bg-gradient-to-br ${template.gradient} relative overflow-hidden flex items-center justify-center`}>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
                                <TemplatePreview layout={template.layout} gradient={template.gradient} />

                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                    <button
                                        onClick={() => onSelect(template.id)}
                                        className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                                    >
                                        Use This Template
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-base font-bold text-slate-900 mb-1">{template.name}</h3>
                                <p className="text-slate-500 text-xs leading-relaxed mb-4 flex-1">{template.description}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {template.tags.map((tag, tagIdx) => (
                                        <span key={tag} className={`px-2 py-0.5 text-[10px] rounded-md font-bold ${
                                            tagIdx === 0
                                                ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}>
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
