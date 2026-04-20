'use client';

import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useResumeStore } from '@/stores/resume-store';
import { apiPost } from '@/lib/api';
import type { InterviewQuestion } from '@/lib/types';
import toast from 'react-hot-toast';

const INTERVIEW_TYPES = [
  { id: 'behavioral' as const, label: 'Behavioral', description: 'Past experience & soft skills' },
  { id: 'technical' as const, label: 'Technical', description: 'Coding & system design' },
  { id: 'situational' as const, label: 'Situational', description: 'Hypothetical scenarios' },
];

function QuestionCard({ question, index }: { question: InterviewQuestion; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-start gap-3"
      >
        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 text-white text-xs font-black flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-relaxed">{question.question}</p>
        </div>
        <span className="flex-shrink-0 text-slate-400 mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-4 space-y-3 border-t border-slate-100">
          <div className="pt-3">
            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Sample Answer</p>
            <p className="text-sm text-slate-600 leading-relaxed">{question.sampleAnswer}</p>
          </div>
          <div className="flex items-start gap-2 p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">{question.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewPrep() {
  const { resumeData } = useResumeStore();
  const [jobDescription, setJobDescription] = useState('');
  const [interviewType, setInterviewType] = useState<'behavioral' | 'technical' | 'situational'>('behavioral');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setLoading(true);
    setQuestions([]);

    try {
      const res = await apiPost('/career/interview-prep', {
        resumeData,
        jobDescription,
        type: interviewType,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Generation failed' }));
        throw new Error(err.error || err.message || 'Generation failed');
      }

      const data = await res.json();
      setQuestions(data.questions || []);
      toast.success(`Generated ${data.questions?.length || 0} questions!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex gap-5">
      {/* Left: Input Panel */}
      <div className="w-[380px] flex-shrink-0 flex flex-col rounded-2xl shadow-xl shadow-slate-200/30 border border-slate-200/60 overflow-hidden bg-white">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-purple-50/30">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <h2 className="text-sm font-black text-slate-800">Interview Prep</h2>
          </div>
          <p className="text-xs text-slate-400">Get AI-generated questions tailored to your resume</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">Interview Type</label>
            <div className="grid grid-cols-3 gap-2">
              {INTERVIEW_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setInterviewType(t.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    interviewType === t.id
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-200/40'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {INTERVIEW_TYPES.find((t) => t.id === interviewType)?.description}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">
              Job Description <span className="text-pink-500">*</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={10}
              className="w-full px-4 py-3 rounded-xl text-sm border border-slate-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !jobDescription.trim()}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-purple-200/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Generate Questions
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right: Results */}
      <div className="flex-1 flex flex-col rounded-2xl border border-slate-200/60 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50">
        <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-purple-50/30">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Questions {questions.length > 0 && `(${questions.length})`}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {questions.length > 0 ? (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <QuestionCard key={i} question={q} index={i} />
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/60 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-9 h-9 text-slate-300" />
                </div>
                <p className="text-base font-bold text-slate-500">No questions yet</p>
                <p className="text-sm text-slate-400 mt-1 max-w-[260px] mx-auto">
                  Select a type, paste a job description, and generate personalized interview questions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
