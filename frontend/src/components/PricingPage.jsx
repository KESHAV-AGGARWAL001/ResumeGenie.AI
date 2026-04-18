import React, { useState } from 'react';
import { apiPost } from '../utils/api';

const PLANS = [
    {
        id: 'free',
        name: 'Starter',
        price: '$0',
        period: 'forever',
        description: 'Get started with the basics',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        ),
        features: [
            '3 PDF compilations per day',
            '1 AI resume analysis per day',
            '2 templates (Deedy, Jakes)',
            '1 saved resume',
        ],
        limitations: [
            'No JD matching',
            'No premium templates',
        ],
        cta: 'Current Plan',
        popular: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$9.99',
        period: '/month',
        description: 'Everything to land your dream job',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        ),
        features: [
            'Unlimited PDF compilations',
            '10 AI analyses per day',
            'All 5 premium templates',
            '5 saved resume versions',
            'No watermark',
            'JD matching & alignment',
            'Priority compilation',
            'Email support',
        ],
        limitations: [],
        cta: 'Upgrade to Pro',
        popular: true,
        priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '$29.99',
        period: '/month',
        description: 'For power users and teams',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        ),
        features: [
            'Everything in Pro',
            'Unlimited AI analyses',
            'Unlimited saved resumes',
            'Custom template upload',
            'API access',
            'Priority support',
        ],
        limitations: [],
        cta: 'Upgrade to Enterprise',
        popular: false,
        priceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
    },
];

export default function PricingPage({ currentTier = 'free', onBack, onUpgradeSuccess }) {
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);

    const handleUpgrade = async (plan) => {
        if (!plan.priceId) return;
        setLoading(plan.id);
        setError(null);

        try {
            const res = await apiPost('/payments/create-checkout', { priceId: plan.priceId });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create checkout session');
            window.location.href = data.url;
        } catch (err) {
            setError(err.message);
            setLoading(null);
        }
    };

    const handleManageSubscription = async () => {
        setLoading('manage');
        setError(null);

        try {
            const res = await apiPost('/payments/create-portal', {});
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to open subscription portal');
            window.location.href = data.url;
        } catch (err) {
            setError(err.message);
            setLoading(null);
        }
    };

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
                    <span className="text-lg font-black gradient-text">Pricing</span>
                </div>
                {currentTier !== 'free' && (
                    <button
                        onClick={handleManageSubscription}
                        disabled={loading === 'manage'}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                    >
                        {loading === 'manage' ? 'Loading...' : 'Manage Subscription'}
                    </button>
                )}
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16">
                <div className="text-center mb-14 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                        Simple pricing, <span className="gradient-text">powerful results.</span>
                    </h1>
                    <p className="text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
                        Start free. Upgrade when you're ready to unlock the full power of AI-driven resume building.
                    </p>
                </div>

                {error && (
                    <div className="max-w-md mx-auto mb-8 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {PLANS.map((plan, i) => {
                        const isCurrent = plan.id === currentTier;
                        const isDowngrade = (currentTier === 'enterprise' && plan.id === 'pro') ||
                            (currentTier !== 'free' && plan.id === 'free');

                        return (
                            <div
                                key={plan.id}
                                className={`animate-fade-in-up relative rounded-2xl p-6 flex flex-col transition-all duration-500 ${
                                    plan.popular
                                        ? 'bg-gradient-to-b from-purple-600 via-violet-600 to-indigo-700 text-white shadow-2xl shadow-purple-300/30 scale-[1.03] border-0 ring-1 ring-purple-400/30'
                                        : 'bg-white border border-slate-200/60 hover:border-slate-300 hover:shadow-xl'
                                }`}
                                style={{ animationDelay: `${0.08 * i}s` }}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-purple-700 text-[10px] font-black rounded-lg shadow-lg uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-5">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                                        plan.popular
                                            ? 'bg-white/15'
                                            : 'bg-slate-100'
                                    }`}>
                                        <span className={plan.popular ? 'text-white' : 'text-slate-600'}>{plan.icon}</span>
                                    </div>
                                    <h3 className={`text-lg font-bold mb-1 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                                    <p className={`text-xs mb-4 ${plan.popular ? 'text-purple-200' : 'text-slate-400'}`}>{plan.description}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-4xl font-black ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                                        <span className={`text-sm ${plan.popular ? 'text-purple-200' : 'text-slate-400'}`}>{plan.period}</span>
                                    </div>
                                </div>

                                <ul className="space-y-2.5 mb-6 flex-1">
                                    {plan.features.map((feature, fi) => (
                                        <li key={fi} className={`flex items-start gap-2 text-xs ${plan.popular ? 'text-purple-100' : 'text-slate-600'}`}>
                                            <svg className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? 'text-emerald-300' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            {feature}
                                        </li>
                                    ))}
                                    {plan.limitations.map((limitation, li) => (
                                        <li key={`lim-${li}`} className={`flex items-start gap-2 text-xs ${plan.popular ? 'text-purple-300/60' : 'text-slate-300'}`}>
                                            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                            {limitation}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleUpgrade(plan)}
                                    disabled={isCurrent || isDowngrade || loading === plan.id || !plan.priceId}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                                        isCurrent
                                            ? plan.popular ? 'bg-white/20 text-white/70 cursor-default' : 'bg-slate-100 text-slate-400 cursor-default'
                                            : plan.popular
                                                ? 'bg-white text-purple-700 hover:bg-purple-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200/50 hover:-translate-y-0.5'
                                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                                >
                                    {loading === plan.id ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className={`w-4 h-4 border-2 rounded-full animate-spin ${plan.popular ? 'border-purple-200 border-t-purple-700' : 'border-white/30 border-t-white'}`} />
                                            Redirecting...
                                        </span>
                                    ) : isCurrent ? (
                                        'Current Plan'
                                    ) : isDowngrade ? (
                                        'Manage via Portal'
                                    ) : (
                                        plan.cta
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-14 text-center space-y-2">
                    <div className="flex items-center justify-center gap-6 text-slate-400">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                            <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Secure payments via Stripe
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                            <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Cancel anytime
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
