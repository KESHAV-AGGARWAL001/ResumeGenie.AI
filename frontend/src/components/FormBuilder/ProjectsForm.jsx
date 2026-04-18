import React from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function ProjectsForm({ data, onChange }) {
    const projects = data.projects || [];

    const addProject = () => {
        onChange([
            ...projects,
            {
                id: uuidv4(),
                name: '',
                techStack: [],
                link: '',
                bulletPoints: ['']
            }
        ]);
    };

    const removeProject = (id) => {
        onChange(projects.filter(proj => proj.id !== id));
    };

    const updateProject = (id, field, value) => {
        onChange(projects.map(proj =>
            proj.id === id ? { ...proj, [field]: value } : proj
        ));
    };

    const addBulletPoint = (id) => {
        onChange(projects.map(proj =>
            proj.id === id ? { ...proj, bulletPoints: [...proj.bulletPoints, ''] } : proj
        ));
    };

    const removeBulletPoint = (id, index) => {
        onChange(projects.map(proj =>
            proj.id === id ? { ...proj, bulletPoints: proj.bulletPoints.filter((_, i) => i !== index) } : proj
        ));
    };

    const updateBulletPoint = (id, index, value) => {
        onChange(projects.map(proj =>
            proj.id === id ? {
                ...proj,
                bulletPoints: proj.bulletPoints.map((bp, i) => i === index ? value : bp)
            } : proj
        ));
    };

    const updateTechStack = (id, value) => {
        // Allow free typing of comma separated values
        const techArray = value.split(',');
        updateProject(id, 'techStack', techArray);
    };

    return (
        <div className="space-y-8">
            {projects.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No projects added yet. Click "Add Project" to get started.
                </p>
            )}

            {projects.map((proj, projIndex) => (
                <div key={proj.id} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                            Project #{projIndex + 1}
                        </h3>
                        <button
                            onClick={() => removeProject(proj.id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                        >
                            Remove
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Project Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={proj.name}
                            onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                            placeholder="My Awesome Project"
                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tech Stack (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={proj.techStack?.join(',') || ''}
                            onChange={(e) => updateTechStack(proj.id, e.target.value)}
                            placeholder="Python, TensorFlow, Docker"
                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Project Link (GitHub/Demo)
                        </label>
                        <input
                            type="url"
                            value={proj.link}
                            onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                            placeholder="https://github.com/username/project"
                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Project Description & Highlights
                        </label>
                        <div className="space-y-2">
                            {proj.bulletPoints.map((bullet, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={bullet}
                                        onChange={(e) => updateBulletPoint(proj.id, index, e.target.value)}
                                        placeholder="Describe what you built or achieved"
                                        className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                    />
                                    {proj.bulletPoints.length > 1 && (
                                        <button
                                            onClick={() => removeBulletPoint(proj.id, index)}
                                            className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => addBulletPoint(proj.id)}
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 text-sm font-medium"
                            >
                                + Add Bullet Point
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={addProject}
                className="w-full py-3 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium transition-all"
            >
                + Add Project
            </button>
        </div>
    );
}
