import React, { useState } from 'react';
import { apiPost } from '../utils/api';

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

export default function CareerInsights({ resumeData }) {
    const [targetRole, setTargetRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [activeTab, setActiveTab] = useState('gap');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [gapResult, setGapResult] = useState(null);
    const [optimizeResult, setOptimizeResult] = useState(null);

    const handleGapAnalysis = async () => {
        if (!targetRole.trim()) return;
        setLoading(true);
        setError(null);
        setGapResult(null);

        try {
            const res = await apiPost('/career/gap-analysis', { resumeData, targetRole });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Analysis failed');
            setGapResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOptimize = async () => {
        if (!jobDescription.trim()) return;
        setLoading(true);
        setError(null);
        setOptimizeResult(null);

        try {
            const res = await apiPost('/career/optimize', { resumeData, jobDescription });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Optimization failed');
            setOptimizeResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white">
            {/* Tab selector */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-1 mx-4 mt-4 rounded-xl">
                <button
                    onClick={() => setActiveTab('gap')}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                        activeTab === 'gap'
                            ? 'text-purple-700 bg-white shadow-sm ring-1 ring-black/[0.04]'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Career Gap Detection
                </button>
                <button
                    onClick={() => setActiveTab('optimize')}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                        activeTab === 'optimize'
                            ? 'text-purple-700 bg-white shadow-sm ring-1 ring-black/[0.04]'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    JD Optimization
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'gap' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Target Role
                            </label>
                            <input
                                type="text"
                                value={targetRole}
                                onChange={e => setTargetRole(e.target.value)}
                                placeholder="e.g., Senior Backend Engineer at Google"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <button
                            onClick={handleGapAnalysis}
                            disabled={!targetRole.trim() || loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-purple-200/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : null}
                            {loading ? 'Analyzing...' : 'Detect Career Gaps'}
                        </button>

                        {gapResult && (
                            <div className="space-y-4 mt-4">
                                {/* Match Score */}
                                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                                    <div className="text-center">
                                        <span className="text-3xl font-black text-purple-600">{gapResult.role_match_percentage}%</span>
                                        <p className="text-xs text-purple-500 font-medium mt-1">Role Match</p>
                                    </div>
                                </div>

                                {/* Gaps */}
                                {gapResult.gaps?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800 mb-3">Identified Gaps</h3>
                                        <div className="space-y-3">
                                            {gapResult.gaps.map((gap, i) => (
                                                <div key={i} className="p-4 border border-gray-100 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm font-bold text-gray-800">{gap.area}</span>
                                                        <SeverityBadge severity={gap.severity} />
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-2">{gap.description}</p>
                                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                                        <p className="text-xs text-green-800 font-medium">Action: {gap.action_plan}</p>
                                                        <p className="text-[10px] text-green-600 mt-1">Estimated time: {gap.time_estimate}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Missing Skills */}
                                {gapResult.missing_skills?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800 mb-2">Missing Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {gapResult.missing_skills.map((skill, i) => (
                                                <span key={i} className="px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded-md text-xs font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recommended Projects */}
                                {gapResult.recommended_projects?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800 mb-3">Recommended Projects</h3>
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

                                {/* Career Advice */}
                                {gapResult.career_trajectory_advice && (
                                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <h3 className="text-sm font-bold text-gray-800 mb-2">Career Advice</h3>
                                        <p className="text-xs text-gray-600 leading-relaxed">{gapResult.career_trajectory_advice}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'optimize' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Job Description
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                                placeholder="Paste the full job description here..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm min-h-[150px] focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <button
                            onClick={handleOptimize}
                            disabled={!jobDescription.trim() || loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-purple-200/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : null}
                            {loading ? 'Optimizing...' : 'Optimize for This JD'}
                        </button>

                        {optimizeResult && (
                            <div className="space-y-4 mt-4">
                                {/* Match Score */}
                                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                                    <div className="text-center">
                                        <span className="text-3xl font-black text-purple-600">{optimizeResult.match_score}%</span>
                                        <p className="text-xs text-purple-500 font-medium mt-1">JD Match Score</p>
                                    </div>
                                </div>

                                {/* Strategy */}
                                {optimizeResult.overall_strategy && (
                                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <h3 className="text-sm font-bold text-gray-800 mb-2">Optimization Strategy</h3>
                                        <p className="text-xs text-gray-600 leading-relaxed">{optimizeResult.overall_strategy}</p>
                                    </div>
                                )}

                                {/* Keywords */}
                                {optimizeResult.keywords_to_include?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800 mb-2">Keywords to Include</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {optimizeResult.keywords_to_include.map((kw, i) => (
                                                <span key={i} className="px-2 py-1 bg-green-50 text-green-700 border border-green-100 rounded-md text-xs font-medium">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Optimized Bullets */}
                                {optimizeResult.optimized_sections?.experience?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800 mb-3">Optimized Experience Bullets</h3>
                                        <div className="space-y-3">
                                            {optimizeResult.optimized_sections.experience.map((exp, i) => (
                                                <div key={i} className="p-3 border border-gray-100 rounded-xl">
                                                    <p className="text-xs text-gray-500 mb-2 italic">{exp.reasoning}</p>
                                                    {exp.optimized_bullets?.map((bullet, j) => (
                                                        <div key={j} className="text-xs bg-purple-50 p-2 rounded-lg border border-purple-100 mb-1">
                                                            {bullet}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Skills Changes */}
                                <div className="grid grid-cols-2 gap-3">
                                    {optimizeResult.optimized_sections?.skills_to_add?.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-green-700 mb-1">Add these skills</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {optimizeResult.optimized_sections.skills_to_add.map((s, i) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded border border-green-100">{s}</span>
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

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
