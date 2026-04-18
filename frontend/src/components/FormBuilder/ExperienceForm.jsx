import React from 'react';
import { v4 as uuidv4 } from 'uuid';

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
        // Allow free typing of comma separated values
        const techArray = value.split(',');
        updateExperience(id, 'techStack', techArray);
    };

    return (
        <div className="space-y-8">
            {experiences.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No experience added yet. Click "Add Experience" to get started.
                </p>
            )}

            {experiences.map((exp, expIndex) => (
                <div key={exp.id} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                            Experience #{expIndex + 1}
                        </h3>
                        <button
                            onClick={() => removeExperience(exp.id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                        >
                            Remove
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                placeholder="Tech Corp"
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Position <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={exp.position}
                                onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                placeholder="Software Engineer"
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Start Date
                            </label>
                            <input
                                type="text"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                placeholder="Jan 2023"
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                End Date
                            </label>
                            <input
                                type="text"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                placeholder="Present"
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                value={exp.location}
                                onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                placeholder="Remote"
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tech Stack (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={exp.techStack?.join(',') || ''}
                            onChange={(e) => updateTechStack(exp.id, e.target.value)}
                            placeholder="React, Node.js, MongoDB"
                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                                        className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                    />
                                    {exp.bulletPoints.length > 1 && (
                                        <button
                                            onClick={() => removeBulletPoint(exp.id, index)}
                                            className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => addBulletPoint(exp.id)}
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 text-sm font-medium"
                            >
                                + Add Bullet Point
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={addExperience}
                className="w-full py-3 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium transition-all"
            >
                + Add Experience
            </button>
        </div>
    );
}
