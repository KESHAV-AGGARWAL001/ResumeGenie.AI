import React from 'react';
import { Github, Linkedin, Globe, Code2, Trophy } from 'lucide-react';

const SOCIAL_PLATFORMS = [
    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username', icon: Github },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username', icon: Linkedin },
    { key: 'leetcode', label: 'LeetCode', placeholder: 'https://leetcode.com/username', icon: Code2 },
    { key: 'codeforces', label: 'Codeforces', placeholder: 'https://codeforces.com/profile/username', icon: Trophy },
    { key: 'codechef', label: 'CodeChef', placeholder: 'https://codechef.com/users/username', icon: Code2 },
    { key: 'gfg', label: 'GeeksforGeeks', placeholder: 'https://auth.geeksforgeeks.org/user/username', icon: Code2 },
    { key: 'portfolio', label: 'Portfolio Website', placeholder: 'https://yourwebsite.com', icon: Globe },
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
        <div className="space-y-5">
            <p className="text-sm text-slate-500 mb-4">
                Add links to your professional profiles and portfolio. All fields are optional.
            </p>

            {SOCIAL_PLATFORMS.map(({ key, label, placeholder, icon: Icon }) => (
                <div key={key}>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        {label}
                    </label>
                    <input
                        type="url"
                        value={socialProfiles[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                    />
                </div>
            ))}
        </div>
    );
}
