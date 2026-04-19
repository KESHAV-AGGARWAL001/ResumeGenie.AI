'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ModeItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const MODES: ModeItem[] = [
  {
    id: 'form',
    label: 'Builder',
    href: '/builder',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'editor',
    label: 'LaTeX',
    href: '/editor',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: 'resume-analyzer',
    label: 'Analyzer',
    href: '/analyzer',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'career-insights',
    label: 'Career AI',
    href: '/career',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    badge: 'AI',
  },
];

export default function ModeToggle() {
  const pathname = usePathname();

  return (
    <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 backdrop-blur-sm shadow-inner">
      {MODES.map((m) => {
        const active = pathname.startsWith(m.href);
        return (
          <Link
            key={m.id}
            href={m.href}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 active:scale-[0.97] ${
              active
                ? 'bg-white text-purple-700 shadow-md shadow-purple-200/40 ring-1 ring-black/[0.04]'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <span className={`transition-colors ${active ? 'text-purple-600' : ''}`}>
              {m.icon}
            </span>
            {m.label}
            {m.badge && (
              <span className={`px-1.5 py-0.5 text-[9px] font-black rounded-md leading-none ${
                active
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {m.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
