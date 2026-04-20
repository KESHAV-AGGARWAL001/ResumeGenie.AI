'use client';

import { useState } from 'react';
import { Flame, Copy, AlertTriangle } from 'lucide-react';
import type { RoastResult } from '@/lib/types';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function FlameRating({ score }: { score: number }) {
  const flames = Math.round(score / 20);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Flame
          key={i}
          className={`w-8 h-8 transition-all ${
            i <= flames
              ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]'
              : 'text-slate-300'
          }`}
          fill={i <= flames ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

export default function ResumeRoast() {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);

  const handleRoast = async () => {
    if (!resumeText.trim()) {
      toast.error('Paste your resume text first!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/ai/roast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: resumeText.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Roast failed' }));
        throw new Error(err.error || err.message || 'Roast failed');
      }

      const data: RoastResult = await res.json();
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to roast resume');
    } finally {
      setLoading(false);
    }
  };

  const copyRoast = () => {
    if (result) {
      navigator.clipboard.writeText(result.roast);
      toast.success('Roast copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-6">
          <Flame className="w-4 h-4" />
          Free AI Resume Roast
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
          Get Your Resume{' '}
          <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Roasted
          </span>
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Brutally honest AI feedback on your resume. No sugarcoating. No sign-up required.
        </p>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
              Paste Your Resume
            </label>
            <div className="flex items-center gap-1.5 text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[10px] font-bold">No data is stored</span>
            </div>
          </div>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste the full text of your resume here. Copy everything — name, experience, education, skills..."
            rows={10}
            className="w-full px-4 py-3 rounded-xl text-sm border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 resize-none transition-all font-mono"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-slate-400">
              {resumeText.length > 0 ? `${resumeText.split(/\s+/).filter(Boolean).length} words` : 'Waiting for input...'}
            </span>
            <button
              onClick={handleRoast}
              disabled={loading || !resumeText.trim()}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-orange-200/50 disabled:opacity-50 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Roasting...
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  Roast My Resume
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Score Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-center">
            <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-4">Roast Score</p>
            <div className="text-6xl font-black text-white mb-3">{result.roastScore}<span className="text-2xl text-slate-400">/100</span></div>
            <FlameRating score={result.roastScore} />
            <div className="mt-6 px-6 py-3 bg-white/10 rounded-xl inline-block">
              <p className="text-sm font-bold text-orange-300 italic">&ldquo;{result.memeVerdict}&rdquo;</p>
            </div>
          </div>

          {/* Roast Text */}
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/30 border border-slate-200/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest">The Roast</span>
              <button
                onClick={copyRoast}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.roast}</p>
            </div>
          </div>

          {/* Improvements */}
          {result.improvements.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/30 border border-slate-200/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Actually Useful Improvements</span>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {result.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-[10px] font-black flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-600 leading-relaxed">{imp}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 mb-4">Want to actually fix your resume?</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-purple-200/50 transition-all hover:-translate-y-0.5"
            >
              Try ResumeGenie.AI Free
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
