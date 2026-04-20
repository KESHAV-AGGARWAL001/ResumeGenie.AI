'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { apiPost } from '@/lib/api';
import type { BulletRewriteResult } from '@/lib/types';
import toast from 'react-hot-toast';

interface BulletRewriterProps {
  bulletPoint: string;
  context: {
    role: string;
    company: string;
    techStack: string[];
  };
  onRewrite: (text: string) => void;
}

export default function BulletRewriter({ bulletPoint, context, onRewrite }: BulletRewriterProps) {
  const [loading, setLoading] = useState(false);
  const [rewrites, setRewrites] = useState<BulletRewriteResult['rewrites'] | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleRewrite = async () => {
    if (!bulletPoint.trim()) {
      toast.error('Write something first before rewriting');
      return;
    }

    setLoading(true);
    setRewrites(null);

    try {
      const res = await apiPost('/career/rewrite-bullet', { bulletPoint, context });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to rewrite' }));
        throw new Error(err.error || err.message || 'Failed to rewrite');
      }
      const data: BulletRewriteResult = await res.json();
      setRewrites(data.rewrites || []);
      setOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to rewrite bullet point');
    } finally {
      setLoading(false);
    }
  };

  const selectRewrite = (text: string) => {
    onRewrite(text);
    setOpen(false);
    setRewrites(null);
    toast.success('Bullet point updated!');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleRewrite}
        disabled={loading || !bulletPoint.trim()}
        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        title="AI Rewrite"
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin block" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
      </button>

      {open && rewrites && rewrites.length > 0 && (
        <div className="absolute right-0 top-full mt-1 z-50 w-80 bg-white rounded-xl shadow-2xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
          <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">AI Suggestions</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {rewrites.map((rw, i) => (
              <button
                key={i}
                onClick={() => selectRewrite(rw.text)}
                className="w-full text-left px-3 py-2.5 hover:bg-purple-50/50 transition-colors border-b border-slate-100 last:border-0"
              >
                <p className="text-xs text-slate-700 leading-relaxed">{rw.text}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] font-bold text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded">
                    {rw.methodology}
                  </span>
                  <span className="text-[9px] text-slate-400">{rw.improvement}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
