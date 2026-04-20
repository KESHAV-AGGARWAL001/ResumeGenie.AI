'use client';

import { useState } from 'react';
import { ScanLine, ChevronDown, X } from 'lucide-react';
import { useResumeStore } from '@/stores/resume-store';
import { apiPost } from '@/lib/api';
import type { QuickATSResult } from '@/lib/types';
import toast from 'react-hot-toast';

function scoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function scoreBg(score: number): string {
  if (score >= 75) return 'from-emerald-500 to-emerald-600';
  if (score >= 50) return 'from-amber-400 to-amber-500';
  return 'from-red-500 to-red-600';
}

function scoreRingColor(score: number): string {
  if (score >= 75) return 'border-emerald-400';
  if (score >= 50) return 'border-amber-400';
  return 'border-red-400';
}

export default function AtsScoreWidget() {
  const { resumeData, targetJD, setTargetJD } = useResumeStore();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickATSResult | null>(null);

  if (dismissed) return null;

  const handleScan = async () => {
    if (!targetJD.trim()) {
      toast.error('Enter a job description first');
      return;
    }

    setLoading(true);
    try {
      const res = await apiPost('/career/quick-ats', { resumeData, jobDescription: targetJD });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Scan failed' }));
        throw new Error(err.error || err.message || 'Scan failed');
      }
      const data: QuickATSResult = await res.json();
      setResult(data);
      setExpanded(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ATS scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className={`group relative w-14 h-14 rounded-2xl bg-gradient-to-br ${
            result ? scoreBg(result.score) : 'from-purple-600 to-violet-600'
          } text-white shadow-lg shadow-purple-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center`}
        >
          {result ? (
            <span className="text-lg font-black">{result.score}</span>
          ) : (
            <ScanLine className="w-6 h-6" />
          )}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            ATS Score
          </span>
        </button>
      ) : (
        <div className="w-80 bg-white rounded-2xl shadow-2xl shadow-slate-300/40 border border-slate-200/80 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-black text-purple-700 uppercase tracking-wider">ATS Scanner</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <textarea
              value={targetJD}
              onChange={(e) => setTargetJD(e.target.value)}
              placeholder="Paste the target job description here..."
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
            />

            <button
              onClick={handleScan}
              disabled={loading || !targetJD.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-purple-200/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <ScanLine className="w-3.5 h-3.5" />
                  Scan ATS Score
                </>
              )}
            </button>

            {result && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-center">
                  <div className={`w-20 h-20 rounded-full border-4 ${scoreRingColor(result.score)} flex items-center justify-center bg-white`}>
                    <span className={`text-2xl font-black ${scoreColor(result.score)}`}>{result.score}</span>
                  </div>
                </div>

                {result.missingKeywords.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Missing Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-md border border-red-100">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.topSuggestion && (
                  <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100">
                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">Top Suggestion</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{result.topSuggestion}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
