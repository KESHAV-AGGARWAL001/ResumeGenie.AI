import { ClipboardList, Palette, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  step: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

const HOW_IT_WORKS: Step[] = [
  {
    step: '01',
    title: 'Fill the form',
    desc: 'Our guided 8-step form captures everything recruiters look for.',
    icon: ClipboardList,
  },
  {
    step: '02',
    title: 'Pick a template',
    desc: 'Choose from 5 battle-tested LaTeX templates used by FAANG engineers.',
    icon: Palette,
  },
  {
    step: '03',
    title: 'Download & apply',
    desc: 'Get a pixel-perfect PDF in under 2 seconds. Start applying.',
    icon: Rocket,
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-slate-50/50 to-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Three steps. <span className="gradient-text">Done.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="animate-fade-in-up relative text-center group"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-purple-600" />
                </div>
                <div className="text-xs font-black text-purple-400 tracking-widest mb-2">
                  STEP {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
