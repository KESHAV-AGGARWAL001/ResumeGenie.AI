import React from 'react';

export default function SkillsForm({ data, onChange }) {
    const skills = data.skills || { languages: [], frameworks: [], tools: [], databases: [] };

    const handleChange = (category, value) => {
        // Allow the user to type freely. We split by comma but preserve spaces.
        // We will trim effectively only during generation or validation if needed.
        const skillsArray = value.split(',');
        onChange({
            ...skills,
            [category]: skillsArray
        });
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter your skills separated by commas. Example: JavaScript, Python, Java
            </p>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Programming Languages
                </label>
                <input
                    type="text"
                    value={skills.languages?.join(',') || ''}
                    onChange={(e) => handleChange('languages', e.target.value)}
                    placeholder="JavaScript, Python, Java, C++"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frameworks & Libraries
                </label>
                <input
                    type="text"
                    value={skills.frameworks?.join(',') || ''}
                    onChange={(e) => handleChange('frameworks', e.target.value)}
                    placeholder="React, Node.js, Django, Spring Boot"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tools & Technologies
                </label>
                <input
                    type="text"
                    value={skills.tools?.join(',') || ''}
                    onChange={(e) => handleChange('tools', e.target.value)}
                    placeholder="Git, Docker, AWS, Kubernetes"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Databases
                </label>
                <input
                    type="text"
                    value={skills.databases?.join(',') || ''}
                    onChange={(e) => handleChange('databases', e.target.value)}
                    placeholder="MongoDB, PostgreSQL, MySQL, Redis"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
            </div>
        </div>
    );
}
