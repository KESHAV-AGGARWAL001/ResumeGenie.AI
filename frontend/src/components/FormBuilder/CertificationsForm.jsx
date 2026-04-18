import React from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function CertificationsForm({ data, onChange }) {
    const certifications = data.certifications || [];

    const addCertification = () => {
        onChange([
            ...certifications,
            {
                id: uuidv4(),
                name: '',
                issuer: '',
                date: ''
            }
        ]);
    };

    const removeCertification = (id) => {
        onChange(certifications.filter(cert => cert.id !== id));
    };

    const updateCertification = (id, field, value) => {
        onChange(certifications.map(cert =>
            cert.id === id ? { ...cert, [field]: value } : cert
        ));
    };

    return (
        <div className="space-y-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Add your professional certifications and credentials.
            </p>

            {certifications.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No certifications added yet. Click "Add Certification" to get started.
                </p>
            )}

            {certifications.map((cert, certIndex) => (
                <div key={cert.id} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                            Certification #{certIndex + 1}
                        </h3>
                        <button
                            onClick={() => removeCertification(cert.id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                        >
                            Remove
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Certification Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                            placeholder="AWS Certified Solutions Architect"
                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Issuing Organization <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={cert.issuer}
                                onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                                placeholder="Amazon Web Services"
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Date Obtained <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={cert.date}
                                onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                                placeholder="2023"
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={addCertification}
                className="w-full py-3 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium transition-all"
            >
                + Add Certification
            </button>
        </div>
    );
}
