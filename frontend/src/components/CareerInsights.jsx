import React, { useState } from 'react';
import { apiPost } from '../utils/api';

const TABS = [
    { id: 'gap', label: 'Gap Detect' },
    { id: 'optimize', label: 'JD Optimize' },
    { id: 'ats-scan', label: 'ATS Scan' },
    { id: 'tailor', label: 'Tailor' },
    { id: 'cover-letter', label: 'Cover Letter' },
    { id: 'networking-email', label: 'Email Draft' },
];

function SeverityBadge({ severity }) {
    const styles = {
        critical: 'bg-red-100 text-red-700 border-red-200',
        important: 'bg-amber-100 text-amber-700 border-amber-200',
        nice_to_have: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[severity] || styles.nice_to_have}`}>
            {severity?.replace(/_/g, ' ')}
        </span>
    );
}

function ScoreCard({ value, label }) {
    return (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="text-center">
                <span className="text-3xl font-black text-purple-600">{value}%</span>
                <p className="text-xs text-purple-500 font-medium mt-1">{label}</p>
            </div>
        </div>
    );
}

function ActionButton({ onClick, disabled, loading, label, loadingLabel }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-purple-200/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
        >
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? loadingLabel : label}
        </button>
    );
}

function JDInput({ value, onChange }) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">Job Description</label>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
        </div>
    );
}

export default function CareerInsights({ resumeData, onApplyTailored }) {
    const [targetRole, setTargetRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [recruiterName, setRecruiterName] = useState('');
    const [emailTone, setEmailTone] = useState('formal');
    const [activeTab, setActiveTab] = useState('gap');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const [gapResult, setGapResult] = useState(null);
    const [optimizeResult, setOptimizeResult] = useState(null);
    const [atsResult, setAtsResult] = useState(null);
    const [tailorResult, setTailorResult] = useState(null);
    const [coverLetterResult, setCoverLetterResult] = useState(null);
    const [emailResult, setEmailResult] = useState(null);

    const handleCopy = async (text) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGapAnalysis = async () => {
        if (!targetRole.trim()) return;
        setLoading(true); setError(null); setGapResult(null);
        try {
            const res = await apiPost('/career/gap-analysis', { resumeData, targetRole });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Analysis failed');
            setGapResult(data);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleOptimize = async () => {
        if (!jobDescription.trim()) return;
        setLoading(true); setError(null); setOptimizeResult(null);
        try {
            const res = await apiPost('/career/optimize', { resumeData, jobDescription });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Optimization failed');
            setOptimizeResult(data);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleATSScan = async () => {
        if (!jobDescription.trim()) return;
        setLoading(true); setError(null); setAtsResult(null);
        try {
            const res = await apiPost('/career/ats-scan', { resumeData, jobDescription });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'ATS scan failed');
            setAtsResult(data);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleTailor = async () => {
        if (!jobDescription.trim()) return;
        setLoading(true); setError(null); setTailorResult(null);
        try {
            const res = await apiPost('/career/tailor', { resumeData, jobDescription });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Tailoring failed');
            setTailorResult(data);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleCoverLetter = async () => {
        if (!jobDescription.trim() || !companyName.trim()) return;
        setLoading(true); setError(null); setCoverLetterResult(null);
        try {
            const res = await apiPost('/career/cover-letter', { resumeData, jobDescription, companyName });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Cover letter generation failed');
            setCoverLetterResult(data);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleNetworkingEmail = async () => {
        if (!companyName.trim() || !targetRole.trim()) return;
        setLoading(true); setError(null); setEmailResult(null);
        try {
            const res = await apiPost('/career/networking-email', {
                resumeData, targetCompany: companyName, targetRole, recruiterName, tone: emailTone,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Email drafting failed');
            setEmailResult(data);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleCompileCoverLetter = async () => {
        if (!coverLetterResult?.cover_letter_latex) return;
        setLoading(true); setError(null);
        try {
            const res = await apiPost('/compile', { latex: coverLetterResult.cover_letter_latex });
            if (!res.ok) throw new Error('PDF compilation failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'cover_letter.pdf';
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white">
            {/* Tab selector */}
            <div className="flex gap-1 border-b border-slate-100 bg-slate-50/50 p-1.5 mx-4 mt-4 rounded-xl overflow-x-auto custom-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setError(null); }}
                        className={`px-3 py-2 text-[11px] font-bold rounded-lg transition-all duration-200 whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'text-purple-700 bg-white shadow-sm ring-1 ring-black/[0.04]'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                {/* ── Gap Detection ─────────────────────────── */}
                {activeTab === 'gap' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">Target Role</label>
                            <input
                                type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)}
                                placeholder="e.g., Senior Backend Engineer at Google"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <ActionButton onClick={handleGapAnalysis} disabled={!targetRole.trim()} loading={loading} label="Detect Career Gaps" loadingLabel="Analyzing..." />

                        {gapResult && (
                            <div className="space-y-4 mt-4">
                                <ScoreCard value={gapResult.role_match_percentage} label="Role Match" />
                                {gapResult.gaps?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-3">Identified Gaps</h3>
                                        <div className="space-y-3">
                                            {gapResult.gaps.map((gap, i) => (
                                                <div key={i} className="p-4 border border-slate-100 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm font-bold text-slate-800">{gap.area}</span>
                                                        <SeverityBadge severity={gap.severity} />
                                                    </div>
                                                    <p className="text-xs text-slate-600 mb-2">{gap.description}</p>
                                                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                                        <p className="text-xs text-emerald-800 font-medium">Action: {gap.action_plan}</p>
                                                        <p className="text-[10px] text-emerald-600 mt-1">Estimated: {gap.time_estimate}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {gapResult.missing_skills?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-2">Missing Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {gapResult.missing_skills.map((skill, i) => (
                                                <span key={i} className="px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded-md text-xs font-medium">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {gapResult.recommended_projects?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-3">Recommended Projects</h3>
                                        <div className="space-y-2">
                                            {gapResult.recommended_projects.map((proj, i) => (
                                                <div key={i} className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                                    <p className="text-sm font-bold text-blue-800">{proj.name}</p>
                                                    <p className="text-xs text-blue-600 mt-1">{proj.description}</p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {proj.skills_covered?.map((s, j) => (
                                                            <span key={j} className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">{s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {gapResult.career_trajectory_advice && (
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <h3 className="text-sm font-bold text-slate-800 mb-2">Career Advice</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">{gapResult.career_trajectory_advice}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── JD Optimization ──────────────────────── */}
                {activeTab === 'optimize' && (
                    <div className="space-y-4">
                        <JDInput value={jobDescription} onChange={setJobDescription} />
                        <ActionButton onClick={handleOptimize} disabled={!jobDescription.trim()} loading={loading} label="Optimize for This JD" loadingLabel="Optimizing..." />
                        {optimizeResult && (
                            <div className="space-y-4 mt-4">
                                <ScoreCard value={optimizeResult.match_score} label="JD Match Score" />
                                {optimizeResult.overall_strategy && (
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <h3 className="text-sm font-bold text-slate-800 mb-2">Strategy</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">{optimizeResult.overall_strategy}</p>
                                    </div>
                                )}
                                {optimizeResult.keywords_to_include?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-2">Keywords to Include</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {optimizeResult.keywords_to_include.map((kw, i) => (
                                                <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-xs font-medium">{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {optimizeResult.optimized_sections?.experience?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-3">Optimized Bullets</h3>
                                        <div className="space-y-3">
                                            {optimizeResult.optimized_sections.experience.map((exp, i) => (
                                                <div key={i} className="p-3 border border-slate-100 rounded-xl">
                                                    <p className="text-xs text-slate-500 mb-2 italic">{exp.reasoning}</p>
                                                    {exp.optimized_bullets?.map((bullet, j) => (
                                                        <div key={j} className="text-xs bg-purple-50 p-2 rounded-lg border border-purple-100 mb-1">{bullet}</div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    {optimizeResult.optimized_sections?.skills_to_add?.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-emerald-700 mb-1">Add</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {optimizeResult.optimized_sections.skills_to_add.map((s, i) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {optimizeResult.optimized_sections?.skills_to_emphasize?.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-blue-700 mb-1">Emphasize</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {optimizeResult.optimized_sections.skills_to_emphasize.map((s, i) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── ATS Keyword Scanner ──────────────────── */}
                {activeTab === 'ats-scan' && (
                    <div className="space-y-4">
                        <JDInput value={jobDescription} onChange={setJobDescription} />
                        <ActionButton onClick={handleATSScan} disabled={!jobDescription.trim()} loading={loading} label="Scan ATS Keywords" loadingLabel="Scanning..." />
                        {atsResult && (
                            <div className="space-y-4 mt-4">
                                <ScoreCard value={atsResult.overall_match_percentage} label="ATS Match" />

                                {atsResult.category_breakdown && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-3">Category Breakdown</h3>
                                        <div className="space-y-2.5">
                                            {Object.entries(atsResult.category_breakdown).map(([cat, data]) => {
                                                const pct = data.total > 0 ? Math.round((data.matched / data.total) * 100) : 0;
                                                return (
                                                    <div key={cat}>
                                                        <div className="flex justify-between text-xs font-bold mb-1">
                                                            <span className="text-slate-600 capitalize">{cat.replace(/_/g, ' ')}</span>
                                                            <span className="text-slate-500">{data.matched}/{data.total}</span>
                                                        </div>
                                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {atsResult.matched_keywords?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-2">Keywords Found</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {atsResult.matched_keywords.map((kw, i) => (
                                                <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-xs font-medium">
                                                    {kw.keyword}
                                                    <span className="ml-1 text-[9px] text-emerald-500">{kw.match_type}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {atsResult.missing_keywords?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-2">Missing Keywords</h3>
                                        <div className="space-y-2">
                                            {atsResult.missing_keywords.map((kw, i) => (
                                                <div key={i} className="flex items-start gap-2 p-2.5 border border-slate-100 rounded-lg">
                                                    <SeverityBadge severity={kw.importance} />
                                                    <div className="flex-1">
                                                        <span className="text-xs font-bold text-slate-800">{kw.keyword}</span>
                                                        <p className="text-[11px] text-slate-500 mt-0.5">{kw.suggestion}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {atsResult.ats_tips?.length > 0 && (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <h3 className="text-sm font-bold text-blue-800 mb-2">ATS Tips</h3>
                                        <ul className="space-y-1.5">
                                            {atsResult.ats_tips.map((tip, i) => (
                                                <li key={i} className="text-xs text-blue-700 flex items-start gap-1.5">
                                                    <span className="text-blue-400 mt-0.5">&#8226;</span>{tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── One-Click Tailor ─────────────────────── */}
                {activeTab === 'tailor' && (
                    <div className="space-y-4">
                        <JDInput value={jobDescription} onChange={setJobDescription} />
                        <ActionButton onClick={handleTailor} disabled={!jobDescription.trim()} loading={loading} label="Tailor My Resume" loadingLabel="Tailoring..." />
                        {tailorResult && (
                            <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                        <span className="text-2xl font-black text-slate-500">{tailorResult.match_score_before}%</span>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1">Before</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 text-center">
                                        <span className="text-2xl font-black text-emerald-600">{tailorResult.match_score_after}%</span>
                                        <p className="text-[10px] text-emerald-500 font-bold mt-1">After</p>
                                    </div>
                                </div>

                                {tailorResult.keywords_added?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-2">Keywords Added</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {tailorResult.keywords_added.map((kw, i) => (
                                                <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-xs font-medium">{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {tailorResult.changes_summary?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-3">Changes Made</h3>
                                        <div className="space-y-2">
                                            {tailorResult.changes_summary.map((change, i) => (
                                                <div key={i} className="p-3 border border-slate-100 rounded-xl flex items-start gap-2">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                                                        change.change_type === 'reworded' ? 'bg-blue-100 text-blue-700' :
                                                        change.change_type === 'added_keyword' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-purple-100 text-purple-700'
                                                    }`}>{change.change_type}</span>
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-700">{change.section}</span>
                                                        <p className="text-[11px] text-slate-500 mt-0.5">{change.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {onApplyTailored && (
                                    <button
                                        onClick={() => onApplyTailored(tailorResult.tailored_resume_data)}
                                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-emerald-200/50 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        Apply Tailored Resume
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Cover Letter Generator ───────────────── */}
                {activeTab === 'cover-letter' && (
                    <div className="space-y-4">
                        <JDInput value={jobDescription} onChange={setJobDescription} />
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">Company Name</label>
                            <input
                                type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                                placeholder="e.g., Google"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <ActionButton onClick={handleCoverLetter} disabled={!jobDescription.trim() || !companyName.trim()} loading={loading} label="Generate Cover Letter" loadingLabel="Generating..." />
                        {coverLetterResult && (
                            <div className="space-y-4 mt-4">
                                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                                    <div className="prose prose-sm max-w-none">
                                        {coverLetterResult.cover_letter_text?.split('\n\n').map((para, i) => (
                                            <p key={i} className="text-sm text-slate-700 leading-relaxed mb-4 last:mb-0">{para}</p>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCopy(coverLetterResult.cover_letter_text)}
                                        className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        {copied ? (
                                            <><svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Copied!</>
                                        ) : (
                                            <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg> Copy Text</>
                                        )}
                                    </button>
                                    {coverLetterResult.cover_letter_latex && (
                                        <button
                                            onClick={handleCompileCoverLetter}
                                            disabled={loading}
                                            className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-xs rounded-xl hover:shadow-lg hover:shadow-purple-200/50 transition-all flex items-center justify-center gap-1.5 hover:-translate-y-0.5"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            Download PDF
                                        </button>
                                    )}
                                </div>

                                {coverLetterResult.key_points_highlighted?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-2">Key Points Used</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {coverLetterResult.key_points_highlighted.map((pt, i) => (
                                                <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-md text-xs font-medium">{pt}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {coverLetterResult.customization_notes && (
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <h3 className="text-sm font-bold text-slate-800 mb-2">Customization Notes</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">{coverLetterResult.customization_notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Networking Email Drafter ──────────────── */}
                {activeTab === 'networking-email' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">Target Role</label>
                            <input
                                type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)}
                                placeholder="e.g., Senior Backend Engineer"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">Company</label>
                            <input
                                type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                                placeholder="e.g., Google"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">Recruiter Name <span className="text-slate-400 font-normal">(optional)</span></label>
                            <input
                                type="text" value={recruiterName} onChange={e => setRecruiterName(e.target.value)}
                                placeholder="e.g., Jane Smith"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">Tone</label>
                            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                                {['formal', 'conversational', 'brief'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setEmailTone(t)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all duration-200 ${
                                            emailTone === t
                                                ? 'bg-white text-purple-700 shadow-sm ring-1 ring-black/[0.04]'
                                                : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ActionButton onClick={handleNetworkingEmail} disabled={!companyName.trim() || !targetRole.trim()} loading={loading} label="Draft Email" loadingLabel="Drafting..." />
                        {emailResult && (
                            <div className="space-y-4 mt-4">
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</span>
                                            <p className="text-sm font-bold text-slate-800">{emailResult.subject_line}</p>
                                        </div>
                                        <button onClick={() => handleCopy(emailResult.subject_line)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        </button>
                                    </div>
                                    <div className="border-t border-slate-200 pt-3">
                                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{emailResult.email_body}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleCopy(`Subject: ${emailResult.subject_line}\n\n${emailResult.email_body}`)}
                                    className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5"
                                >
                                    {copied ? (
                                        <><svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Copied!</>
                                    ) : (
                                        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg> Copy Full Email</>
                                    )}
                                </button>

                                {emailResult.follow_up_note && (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <h3 className="text-sm font-bold text-blue-800 mb-1">Follow-up Tip</h3>
                                        <p className="text-xs text-blue-700 leading-relaxed">{emailResult.follow_up_note}</p>
                                    </div>
                                )}

                                {emailResult.key_highlights_used?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-2">Resume Points Used</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {emailResult.key_highlights_used.map((h, i) => (
                                                <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-md text-xs font-medium">{h}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
