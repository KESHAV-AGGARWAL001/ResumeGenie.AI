import React from 'react';
import { v4 as uuidv4 } from 'uuid';

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
        // Allow free typing of comma separated values
        const honorsArray = value.split(',');
        updateEducation(id, 'honors', honorsArray);
    };

    return (
        <div className="space-y-8">
            {education.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No education added yet. Click "Add Education" to get started.
                </p>
            )}

            {education.map((edu, eduIndex) => (
                <div key={edu.id} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                            Education #{eduIndex + 1}
                        </h3>
                        <button
                            onClick={() => removeEducation(edu.id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                        >
                            Remove
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Institution <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            placeholder="University of California, Berkeley"
                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Degree <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="Bachelor of Science in Computer Science"
                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Start Date
                            </label>
                            <input
                                type="text"
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                placeholder="2016"
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                End Date
                            </label>
                            <input
                                type="text"
                                value={edu.endDate}
                                onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                placeholder="2020"
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                value={edu.location}
                                onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                                placeholder="Berkeley, CA"
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            GPA
                        </label>
                        <input
                            type="text"
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                            placeholder="3.9/4.0"
                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Honors & Awards (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={edu.honors?.join(',') || ''}
                            onChange={(e) => updateHonors(edu.id, e.target.value)}
                            placeholder="Dean's List, Summa Cum Laude"
                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                    </div>
                </div>
            ))}

            <button
                onClick={addEducation}
                className="w-full py-3 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium transition-all"
            >
                + Add Education
            </button>
        </div>
    );
}
