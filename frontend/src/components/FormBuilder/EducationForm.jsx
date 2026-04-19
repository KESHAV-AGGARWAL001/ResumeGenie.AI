import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GraduationCap, Plus } from 'lucide-react';

export default function EducationForm({ data, onChange }) {
    const education = data.education || [];

    const addEducation = () => {
        onChange([
            ...education,
            {
                id: uuidv4(),
                institution: '',
                degree: '',
                location: '',
                startDate: '',
                endDate: '',
                gpa: '',
                honors: []
            }
        ]);
    };

    const removeEducation = (id) => {
        onChange(education.filter(edu => edu.id !== id));
    };

    const updateEducation = (id, field, value) => {
        onChange(education.map(edu =>
            edu.id === id ? { ...edu, [field]: value } : edu
        ));
    };

    const updateHonors = (id, value) => {
        const honorsArray = value.split(',');
        updateEducation(id, 'honors', honorsArray);
    };

    return (
        <div className="space-y-6">
            {education.length === 0 && (
                <div className="empty-state">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">No education added yet</p>
                    <p className="text-xs text-slate-300">Click "Add Education" to get started</p>
                </div>
            )}

            {education.map((edu, eduIndex) => (
                <div key={edu.id} className="form-card space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-purple-600">
                            Education #{eduIndex + 1}
                        </h3>
                        <button
                            onClick={() => removeEducation(edu.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Remove
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">
                            Institution <span className="text-pink-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            placeholder="University of California, Berkeley"
                            className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">
                            Degree <span className="text-pink-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="Bachelor of Science in Computer Science"
                            className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">Start Date</label>
                            <input
                                type="text"
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                placeholder="2016"
                                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">End Date</label>
                            <input
                                type="text"
                                value={edu.endDate}
                                onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                placeholder="2020"
                                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">Location</label>
                            <input
                                type="text"
                                value={edu.location}
                                onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                                placeholder="Berkeley, CA"
                                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">GPA</label>
                        <input
                            type="text"
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                            placeholder="3.9/4.0"
                            className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">
                            Honors & Awards (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={edu.honors?.join(',') || ''}
                            onChange={(e) => updateHonors(edu.id, e.target.value)}
                            placeholder="Dean's List, Summa Cum Laude"
                            className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                        />
                    </div>
                </div>
            ))}

            <button
                onClick={addEducation}
                className="w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add Education
            </button>
        </div>
    );
}
