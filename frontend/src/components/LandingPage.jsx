import React, { useState, useEffect } from 'react';

const STATS = [
    { value: '10K+', label: 'Resumes Created' },
    { value: '95%', label: 'ATS Pass Rate' },
    { value: '4.9', label: 'User Rating' },
    { value: '<2s', label: 'PDF Generation' },
];

const FEATURES = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        title: 'LaTeX Quality, Zero Code',
        description: 'Professional typesetting that makes recruiters stop scrolling. No LaTeX knowledge needed.',
        gradient: 'from-violet-500 to-purple-600',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        title: 'AI Career Coach',
        description: 'Get instant resume scoring, career gap analysis, and JD-optimized bullet points.',
        gradient: 'from-pink-500 to-rose-600',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
        ),
        title: '5 Pro Templates',
        description: 'Deedy, Jakes, ModernCV — all the layouts top FAANG engineers use. One-click switch.',
        gradient: 'from-amber-500 to-orange-600',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        title: 'Secure & Private',
        description: 'Google sign-in, Firebase encryption. Your data never leaves your account.',
        gradient: 'from-emerald-500 to-teal-600',
    },
];

const TEMPLATES_PREVIEW = [
    { name: 'Deedy', type: 'Two Column', color: '#1e293b' },
    { name: 'Jakes', type: 'Single Column', color: '#7c3aed' },
    { name: 'ModernCV', type: 'Classic', color: '#0ea5e9' },
];

function AnimatedCounter({ end, suffix = '' }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const num = parseInt(end.replace(/[^0-9]/g, '')) || 0;
        if (num === 0) { setCount(end); return; }
        let current = 0;
        const step = Math.ceil(num / 40);
        const timer = setInterval(() => {
            current += step;
            if (current >= num) { setCount(end); clearInterval(timer); }
            else { setCount(current.toLocaleString() + suffix); }
        }, 30);
        return () => clearInterval(timer);
    }, [end, suffix]);
    return <span>{count}</span>;
}

export default function LandingPage({ onSignIn, onViewTemplates }) {
    return (
        <div className="relative overflow-hidden">
            {/* Floating orbs background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl animate-float" />
                <div className="absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-pink-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-blue-200/20 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
            </div>

            {/* ─── Hero Section ────────────────────────────────────────── */}
            <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Badge */}
                    <div className="animate-fade-in-up inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm text-sm font-semibold text-purple-700">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Powered by Gemini 2.5 Flash AI
                    </div>

                    {/* Title */}
                    <h1 className="animate-fade-in-up stagger-1 text-6xl md:text-8xl font-black tracking-tight leading-[0.95]">
                        <span className="text-slate-900">Build a resume</span>
                        <br />
                        <span className="gradient-text">that gets interviews.</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="animate-fade-in-up stagger-2 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        LaTeX-quality PDFs in seconds. AI-powered scoring & optimization.
                        Trusted by engineers at top tech companies.
                    </p>

                    {/* CTA */}
                    <div className="animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <button
                            onClick={onSignIn}
                            className="group relative px-8 py-4 text-lg font-bold text-white rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 shadow-xl shadow-purple-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-1 active:translate-y-0 flex items-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                            </svg>
                            Get Started Free
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>

                        <button
                            onClick={onViewTemplates}
                            className="px-8 py-4 text-lg font-semibold text-slate-600 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl hover:bg-white hover:border-slate-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                        >
                            Browse Templates
                        </button>
                    </div>

                    {/* Social proof */}
                    <div className="animate-fade-in-up stagger-4 pt-8 flex items-center justify-center gap-3 text-sm text-slate-400">
                        <div className="flex -space-x-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400" style={{ opacity: 1 - i * 0.15 }} />
                            ))}
                        </div>
                        <span className="font-medium">Join 10,000+ engineers building better resumes</span>
                    </div>
                </div>
            </section>

            {/* ─── Stats Bar ───────────────────────────────────────────── */}
            <section className="relative py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {STATS.map((stat, i) => (
                            <div key={i} className="animate-fade-in-up text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm hover:shadow-md transition-all group" style={{ animationDelay: `${0.1 * i}s` }}>
                                <div className="text-3xl md:text-4xl font-black gradient-text group-hover:scale-110 transition-transform">
                                    <AnimatedCounter end={stat.value} />
                                </div>
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Features Grid ───────────────────────────────────────── */}
            <section className="relative py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                            Everything you need to <span className="gradient-text">land the job</span>
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            From structured forms to AI coaching — we handle the hard parts so you can focus on what matters.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {FEATURES.map((feature, i) => (
                            <div
                                key={i}
                                className="animate-fade-in-up group relative p-8 rounded-3xl bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                                style={{ animationDelay: `${0.08 * i}s` }}
                            >
                                {/* Gradient glow on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 rounded-3xl`} />

                                <div className={`relative inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>

                                <h3 className="relative text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="relative text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── How It Works ────────────────────────────────────────── */}
            <section className="relative py-24 px-6 bg-gradient-to-b from-slate-50/50 to-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                            Three steps. <span className="gradient-text">Done.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Fill the form', desc: 'Our guided 8-step form captures everything recruiters look for.', icon: '📝' },
                            { step: '02', title: 'Pick a template', desc: 'Choose from 5 battle-tested LaTeX templates used by FAANG engineers.', icon: '🎨' },
                            { step: '03', title: 'Download & apply', desc: 'Get a pixel-perfect PDF in under 2 seconds. Start applying.', icon: '🚀' },
                        ].map((item, i) => (
                            <div key={i} className="animate-fade-in-up relative text-center group" style={{ animationDelay: `${0.1 * i}s` }}>
                                <div className="text-6xl mb-6 group-hover:scale-125 transition-transform duration-300">{item.icon}</div>
                                <div className="text-xs font-black text-purple-400 tracking-widest mb-2">STEP {item.step}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Final CTA ───────────────────────────────────────────── */}
            <section className="relative py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="p-12 rounded-[2rem] bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23fff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

                        <h2 className="relative text-3xl md:text-4xl font-black mb-4">
                            Ready to stand out?
                        </h2>
                        <p className="relative text-purple-100 text-lg mb-8 max-w-md mx-auto">
                            Stop tweaking margins in Google Docs. Build a resume that actually gets you interviews.
                        </p>
                        <button
                            onClick={onSignIn}
                            className="relative px-10 py-4 text-lg font-bold bg-white text-purple-700 rounded-2xl hover:bg-purple-50 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                        >
                            Start Building — It's Free
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── Footer ──────────────────────────────────────────────── */}
            <footer className="py-8 px-6 border-t border-slate-100">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <span className="text-sm font-bold gradient-text">ResumeGenie.AI</span>
                    <span className="text-xs text-slate-400">&copy; {new Date().getFullYear()} ResumeGenie.AI. Built with AI.</span>
                </div>
            </footer>
        </div>
    );
}
