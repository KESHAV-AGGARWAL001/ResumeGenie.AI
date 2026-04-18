import React from 'react';

export default function PersonalInfoForm({ data, onChange }) {
    const personalInfo = data.personalInfo || { name: '', email: '', phone: '', location: '' };

    const handleChange = (field, value) => {
        onChange({
            ...personalInfo,
            [field]: value
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="john.doe@example.com"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                </label>
                <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1-555-123-4567"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                </label>
                <input
                    type="text"
                    value={personalInfo.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="San Francisco, CA"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
            </div>
        </div>
    );
}
