import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { apiGet } from '../utils/api';

export default function UsageBanner({ onUpgrade }) {
    const [usage, setUsage] = useState(null);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const res = await apiGet('/payments/status');
                if (res.ok) {
                    const data = await res.json();
                    if (data.subscription?.tier === 'free') {
                        setUsage(data);
                    } else {
                        setUsage(null);
                    }
                }
            } catch (e) {
                // Silently fail
            }
        };
        fetchUsage();
        const interval = setInterval(fetchUsage, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (!usage) return null;

    const compilesUsed = usage.usage?.compilationsToday || 0;
    const compilesLimit = usage.limits?.compilationsPerDay || 3;
    const aiUsed = usage.usage?.aiAnalysesToday || 0;
    const aiLimit = usage.limits?.aiAnalysesPerDay || 1;

    const isNearLimit = compilesUsed >= compilesLimit - 1 || aiUsed >= aiLimit;

    if (compilesUsed === 0 && aiUsed === 0) return null;

    return (
        <div className={`px-5 py-2 text-xs font-semibold flex items-center justify-between gap-4 animate-slide-down ${
            isNearLimit
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-b border-amber-200/60'
                : 'bg-gradient-to-r from-slate-50 to-purple-50/30 text-slate-500 border-b border-slate-200/60'
        }`}>
            <div className="flex items-center gap-3">
                <Zap className={`w-3.5 h-3.5 ${isNearLimit ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>
                    {compilesUsed}/{compilesLimit} compiles &middot; {aiUsed}/{aiLimit} AI analyses today
                </span>
            </div>
            {isNearLimit && (
                <button
                    onClick={onUpgrade}
                    className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-[10px] font-black hover:shadow-lg hover:shadow-amber-200/50 transition-all hover:-translate-y-0.5 uppercase tracking-wide"
                >
                    Upgrade
                </button>
            )}
        </div>
    );
}
