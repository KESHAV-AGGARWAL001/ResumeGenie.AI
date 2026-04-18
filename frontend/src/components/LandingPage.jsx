import React from 'react';

export default function LandingPage({ onSignIn, onViewTemplates }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">

                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4 border border-purple-200 shadow-sm">
                    ✨ The Future of Resume Building is Here
                </div>

                {/* Hero Title */}
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                    Craft Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-gradient-x">Perfect Resume</span> <br /> in Minutes.
                </h1>

                {/* Subtitle */}
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Professional, LaTeX-quality resumes without the code.
                    Use our AI-powered builder to land your dream job at top tech companies.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                    <button
                        onClick={onSignIn}
                        className="px-8 py-4 text-lg font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                        </svg>
                        Sign in with Google
                    </button>

                    <button
                        onClick={onViewTemplates}
                        className="px-8 py-4 text-lg font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
                    >
                        View Templates
                    </button>
                </div>

                {/* Feature Grid (Mockup) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
                    <FeatureCard
                        icon="⚡"
                        title="Instant LaTeX"
                        desc="Get the professional look of LaTeX without writing a single line of code."
                    />
                    <FeatureCard
                        icon="🤖"
                        title="AI Powered"
                        desc="Smart suggestions and content optimization to beat ATS systems."
                    />
                    <FeatureCard
                        icon="🎨"
                        title="Premium Templates"
                        desc="Designed by experts to highlight your skills and experience effectively."
                    />
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all card-glass">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{desc}</p>
        </div>
    )
}
