import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Briefcase, Plus, X } from 'lucide-react';

export default function ExperienceForm({ data, onChange }) {
    const experiences = data.experience || [];

    const addExperience = () => {
        onChange([
            ...experiences,
            {
                id: uuidv4(),
                company: '',
                position: '',
                location: '',
                startDate: '',
                endDate: '',
                techStack: [],
                bulletPoints: ['']
            }
        ]);
    };

    const removeExperience = (id) => {
        onChange(experiences.filter(exp => exp.id !== id));
    };

    const updateExperience = (id, field, value) => {
        onChange(experiences.map(exp =>
            exp.id === id ? { ...exp, [field]: value } : exp
        ));
    };

    const addBulletPoint = (id) => {
        onChange(experiences.map(exp =>
            exp.id === id ? { ...exp, bulletPoints: [...exp.bulletPoints, ''] } : exp
        ));
    };

    const removeBulletPoint = (id, index) => {
        onChange(experiences.map(exp =>
            exp.id === id ? { ...exp, bulletPoints: exp.bulletPoints.filter((_, i) => i !== index) } : exp
        ));
    };

    const updateBulletPoint = (id, index, value) => {
        onChange(experiences.map(exp =>
            exp.id === id ? {
                ...exp,
                bulletPoints: exp.bulletPoints.map((bp, i) => i === index ? value : bp)
            } : exp
        ));
    };

    const updateTechStack = (id, value) => {
        const techArray = value.split(',');
        updateExperience(id, 'techStack', techArray);
    };

    return (
        <div className="space-y-6">
            {experiences.length === 0 && (
                <div className="empty-state">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">No experience added yet</p>
                    <p className="text-xs text-slate-300">Click "Add Experience" to get started</p>
                </div>
            )}

            {experiences.map((exp, expIndex) => (
                <div key={exp.id} className="form-card space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-purple-600">
                            Experience #{expIndex + 1}
                        </h3>
                        <button
                            onClick={() => removeExperience(exp.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Remove
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">
                                Company Name <span className="text-pink-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                placeholder="Tech Corp"
                                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">
                                Position <span className="text-pink-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={exp.position}
                                onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                placeholder="Software Engineer"
                                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">Start Date</label>
                            <input
                                type="text"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                placeholder="Jan 2023"
                                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">End Date</label>
                            <input
                                type="text"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                placeholder="Present"
                                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">Location</label>
                            <input
                                type="text"
                                value={exp.location}
                                onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                placeholder="Remote"
                                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">
                            Tech Stack (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={exp.techStack?.join(',') || ''}
                            onChange={(e) => updateTechStack(exp.id, e.target.value)}
                            placeholder="React, Node.js, MongoDB"
                            className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">
                            Responsibilities & Achievements
                        </label>
                        <div className="space-y-2">
                            {exp.bulletPoints.map((bullet, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={bullet}
                                        onChange={(e) => updateBulletPoint(exp.id, index, e.target.value)}
                                        placeholder="Describe your achievement or responsibility"
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm transition-all"
                                    />
                                    {exp.bulletPoints.length > 1 && (
                                        <button
                                            onClick={() => removeBulletPoint(exp.id, index)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => addBulletPoint(exp.id)}
                                className="text-purple-600 hover:text-purple-700 text-xs font-semibold flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add Bullet Point
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={addExperience}
                className="w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add Experience
            </button>
        </div>
    );
}
