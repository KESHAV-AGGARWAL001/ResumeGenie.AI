'use client';

import { useState, useEffect } from 'react';

const STATS = [
  { value: '10K+', label: 'Resumes Created' },
  { value: '95%', label: 'ATS Pass Rate' },
  { value: '4.9', label: 'User Rating' },
  { value: '<2s', label: 'PDF Generation' },
];

function AnimatedCounter({ end }: { end: string }) {
  const [count, setCount] = useState<string | number>(0);

  useEffect(() => {
    const num = parseInt(end.replace(/[^0-9]/g, '')) || 0;
    if (num === 0) {
      setCount(end);
      return;
    }
    let current = 0;
    const step = Math.ceil(num / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= num) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current.toLocaleString());
      }
    }, 30);
    return () => clearInterval(timer);
  }, [end]);

  return <span>{count}</span>;
}

export default function StatsBar() {
  return (
    <section className="relative py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="animate-fade-in-up text-center p-6 rounded-2xl card-glass hover:shadow-md transition-all group"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="text-3xl md:text-4xl font-black gradient-text group-hover:scale-110 transition-transform">
                <AnimatedCounter end={stat.value} />
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
