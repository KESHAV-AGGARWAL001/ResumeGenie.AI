import React from 'react';
import { Trophy, Plus, X } from 'lucide-react';

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
        <div className="space-y-5">
            <p className="text-sm text-slate-500 mb-4">
                List your achievements, awards, publications, or notable accomplishments.
            </p>

            {achievements.length === 0 && (
                <div className="empty-state">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">No achievements added yet</p>
                    <p className="text-xs text-slate-300">Click "Add Achievement" to get started</p>
                </div>
            )}

            <div className="space-y-3">
                {achievements.map((achievement, index) => (
                    <div key={index} className="flex gap-2">
                        <input
                            type="text"
                            value={achievement}
                            onChange={(e) => updateAchievement(index, e.target.value)}
                            placeholder="Won Best Hack Award at TechCrunch Disrupt 2023"
                            className="flex-1 px-4 py-3 rounded-xl text-sm transition-all"
                        />
                        <button
                            onClick={() => removeAchievement(index)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addAchievement}
                className="w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add Achievement
            </button>
        </div>
    );
}
