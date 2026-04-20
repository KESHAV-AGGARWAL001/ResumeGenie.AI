'use client';

import { useState } from 'react';
import { Linkedin, X, Upload, Check, AlertCircle } from 'lucide-react';
import { apiPost } from '@/lib/api';
import type { ResumeData, LinkedInParseResult } from '@/lib/types';
import toast from 'react-hot-toast';

interface LinkedInImportModalProps {
  onClose: () => void;
  onImport: (data: ResumeData) => void;
  existingData: ResumeData;
}

export default function LinkedInImportModal({ onClose, onImport, existingData }: LinkedInImportModalProps) {
  const [linkedInText, setLinkedInText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<LinkedInParseResult | null>(null);

  const handleParse = async () => {
    if (!linkedInText.trim()) {
      toast.error('Paste your LinkedIn profile text first');
      return;
    }

    setLoading(true);
    setParsed(null);

    try {
      const res = await apiPost('/career/parse-linkedin', { linkedInText });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Parse failed' }));
        throw new Error(err.error || err.message || 'Parse failed');
      }
      const data: LinkedInParseResult = await res.json();
      setParsed(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse LinkedIn profile');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsed?.resumeData) return;

    const p = parsed.resumeData;
    const merged: ResumeData = {
      personalInfo: {
        name: p.personalInfo?.name || existingData.personalInfo.name,
        email: p.personalInfo?.email || existingData.personalInfo.email,
        phone: p.personalInfo?.phone || existingData.personalInfo.phone,
        location: p.personalInfo?.location || existingData.personalInfo.location,
      },
      socialProfiles: {
        linkedin: p.socialProfiles?.linkedin || existingData.socialProfiles.linkedin,
        github: p.socialProfiles?.github || existingData.socialProfiles.github,
        leetcode: existingData.socialProfiles.leetcode,
        codechef: existingData.socialProfiles.codechef,
        portfolio: p.socialProfiles?.portfolio || existingData.socialProfiles.portfolio,
      },
      experience: p.experience?.length ? p.experience : existingData.experience,
      projects: p.projects?.length ? p.projects : existingData.projects,
      skills: {
        languages: p.skills?.languages?.length ? p.skills.languages : existingData.skills.languages,
        frameworks: p.skills?.frameworks?.length ? p.skills.frameworks : existingData.skills.frameworks,
        databases: p.skills?.databases?.length ? p.skills.databases : existingData.skills.databases,
        tools: p.skills?.tools?.length ? p.skills.tools : existingData.skills.tools,
      },
      achievements: p.achievements?.length ? p.achievements : existingData.achievements,
      certifications: p.certifications?.length ? p.certifications : existingData.certifications,
      education: p.education?.length ? p.education : existingData.education,
      metadata: existingData.metadata,
    };

    onImport(merged);
    toast.success('LinkedIn data imported successfully!');
    onClose();
  };

  const countFields = (data: Partial<ResumeData>): number => {
    let count = 0;
    if (data.personalInfo?.name) count++;
    if (data.experience?.length) count++;
    if (data.education?.length) count++;
    if (data.skills?.languages?.length || data.skills?.frameworks?.length) count++;
    if (data.projects?.length) count++;
    if (data.certifications?.length) count++;
    return count;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">Import from LinkedIn</h3>
              <p className="text-xs text-slate-400">Paste your profile text to auto-fill your resume</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!parsed ? (
            <>
              {/* Instructions */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-700 mb-2">How to export from LinkedIn:</p>
                <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
                  <li>Go to your LinkedIn profile</li>
                  <li>Copy your About section, Experience, Education, and Skills</li>
                  <li>Paste everything below</li>
                </ol>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  LinkedIn Profile Text <span className="text-pink-500">*</span>
                </label>
                <textarea
                  value={linkedInText}
                  onChange={(e) => setLinkedInText(e.target.value)}
                  placeholder="Paste your LinkedIn profile content here — About, Experience, Education, Skills, Certifications..."
                  rows={12}
                  className="w-full px-4 py-3 rounded-xl text-sm border border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
                />
              </div>

              <button
                onClick={handleParse}
                disabled={loading || !linkedInText.trim()}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Parsing profile...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Parse LinkedIn Data
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Preview */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-700">Profile parsed successfully!</p>
                  <p className="text-xs text-emerald-600">
                    Found {countFields(parsed.resumeData)} sections &middot; {parsed.confidence}% confidence
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Data Preview</p>

                {parsed.resumeData.personalInfo?.name && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Name</span>
                    <p className="text-sm text-slate-700">{parsed.resumeData.personalInfo.name}</p>
                  </div>
                )}

                {parsed.resumeData.experience && parsed.resumeData.experience.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Experience ({parsed.resumeData.experience.length})</span>
                    {parsed.resumeData.experience.map((exp, i) => (
                      <p key={i} className="text-sm text-slate-700 mt-1">
                        {exp.position} at {exp.company}
                      </p>
                    ))}
                  </div>
                )}

                {parsed.resumeData.education && parsed.resumeData.education.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Education ({parsed.resumeData.education.length})</span>
                    {parsed.resumeData.education.map((edu, i) => (
                      <p key={i} className="text-sm text-slate-700 mt-1">
                        {edu.degree} — {edu.institution}
                      </p>
                    ))}
                  </div>
                )}

                {parsed.resumeData.skills && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Skills</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {[
                        ...(parsed.resumeData.skills.languages || []),
                        ...(parsed.resumeData.skills.frameworks || []),
                        ...(parsed.resumeData.skills.tools || []),
                      ]
                        .filter(Boolean)
                        .slice(0, 15)
                        .map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-md">
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Importing will replace empty fields with LinkedIn data. Existing data in non-empty fields will be preserved.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {parsed && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
            <button
              onClick={() => setParsed(null)}
              className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleConfirmImport}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Confirm Import
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
