import {
  Zap,
  Monitor,
  LayoutGrid,
  ShieldCheck,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'LaTeX Quality, Zero Code',
    description:
      'Professional typesetting that makes recruiters stop scrolling. No LaTeX knowledge needed.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: <Monitor className="w-6 h-6" />,
    title: 'AI Career Coach',
    description:
      'Get instant resume scoring, career gap analysis, and JD-optimized bullet points.',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    icon: <LayoutGrid className="w-6 h-6" />,
    title: '5 Pro Templates',
    description:
      'Deedy, Jakes, ModernCV — all the layouts top FAANG engineers use. One-click switch.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Secure & Private',
    description:
      'Google sign-in, Firebase encryption. Your data never leaves your account.',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

export default function FeaturesGrid() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Everything you need to{' '}
            <span className="gradient-text">land the job</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            From structured forms to AI coaching — we handle the hard parts so
            you can focus on what matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="animate-fade-in-up group relative p-8 rounded-3xl bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              style={{ animationDelay: `${0.08 * i}s` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 rounded-3xl`}
              />

              <div
                className={`relative inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>

              <h3 className="relative text-xl font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="relative text-slate-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
