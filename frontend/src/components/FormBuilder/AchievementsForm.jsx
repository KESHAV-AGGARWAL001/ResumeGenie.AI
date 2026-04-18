import React from 'react';

export default function AchievementsForm({ data, onChange }) {
    const achievements = data.achievements || [];

    const addAchievement = () => {
        onChange([...achievements, '']);
    };

    const removeAchievement = (index) => {
        onChange(achievements.filter((_, i) => i !== index));
    };

    const updateAchievement = (index, value) => {
        onChange(achievements.map((ach, i) => i === index ? value : ach));
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                List your achievements, awards, publications, or notable accomplishments.
            </p>

            {achievements.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No achievements added yet. Click "Add Achievement" to get started.
                </p>
            )}

            <div className="space-y-3">
                {achievements.map((achievement, index) => (
                    <div key={index} className="flex gap-2">
                        <input
                            type="text"
                            value={achievement}
                            onChange={(e) => updateAchievement(index, e.target.value)}
                            placeholder="Won Best Hack Award at TechCrunch Disrupt 2023"
                            className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                        />
                        <button
                            onClick={() => removeAchievement(index)}
                            className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addAchievement}
                className="w-full py-3 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium transition-all"
            >
                + Add Achievement
            </button>
        </div>
    );
}
