'use client';

import { v4 as uuidv4 } from 'uuid';
import { Award, Plus } from 'lucide-react';
import type { ResumeData, Certification } from '@/lib/types';

interface CertificationsFormProps {
  data: ResumeData;
  onChange: (data: Certification[]) => void;
}

export default function CertificationsForm({ data, onChange }: CertificationsFormProps) {
  const certifications = data.certifications || [];

  const addCertification = () => {
    onChange([
      ...certifications,
      {
        id: uuidv4(),
        name: '',
        issuer: '',
        date: '',
      },
    ]);
  };

  const removeCertification = (id: string) => {
    onChange(certifications.filter((cert) => cert.id !== id));
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    onChange(
      certifications.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500 mb-4">
        Add your professional certifications and credentials.
      </p>

      {certifications.length === 0 && (
        <div className="empty-state">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Award className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-400">No certifications added yet</p>
          <p className="text-xs text-slate-300">Click &quot;Add Certification&quot; to get started</p>
        </div>
      )}

      {certifications.map((cert, certIndex) => (
        <div key={cert.id} className="form-card space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-purple-600">Certification #{certIndex + 1}</h3>
            <button
              onClick={() => removeCertification(cert.id)}
              className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              Remove
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">
              Certification Name <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              value={cert.name}
              onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
              placeholder="AWS Certified Solutions Architect"
              className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Issuing Organization <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                value={cert.issuer}
                onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                placeholder="Amazon Web Services"
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Date Obtained <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                value={cert.date}
                onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                placeholder="2023"
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addCertification}
        className="w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Certification
      </button>
    </div>
  );
}
