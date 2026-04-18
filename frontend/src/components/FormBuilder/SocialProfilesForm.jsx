import React from 'react';

const SOCIAL_PLATFORMS = [
    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
    { key: 'leetcode', label: 'LeetCode', placeholder: 'https://leetcode.com/username' },
    { key: 'codeforces', label: 'Codeforces', placeholder: 'https://codeforces.com/profile/username' },
    { key: 'codechef', label: 'CodeChef', placeholder: 'https://codechef.com/users/username' },
    { key: 'gfg', label: 'GeeksforGeeks', placeholder: 'https://auth.geeksforgeeks.org/user/username' },
    { key: 'portfolio', label: 'Portfolio Website', placeholder: 'https://yourwebsite.com' },
];

export default function SocialProfilesForm({ data, onChange }) {
    const socialProfiles = data.socialProfiles || {};

    const handleChange = (platform, value) => {
        onChange({
            ...socialProfiles,
            [platform]: value
        });
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Add links to your professional profiles and portfolio. All fields are optional.
            </p>

            {SOCIAL_PLATFORMS.map(platform => (
                <div key={platform.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {platform.label}
                    </label>
                    <input
                        type="url"
                        value={socialProfiles[platform.key] || ''}
                        onChange={(e) => handleChange(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                </div>
            ))}
        </div>
    );
}
