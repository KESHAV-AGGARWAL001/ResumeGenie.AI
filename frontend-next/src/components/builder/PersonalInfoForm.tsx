'use client';

import { User, Mail, Phone, MapPin } from 'lucide-react';
import type { ResumeData, PersonalInfo } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';

interface PersonalInfoFormProps {
  data: ResumeData;
  onChange: (data: PersonalInfo) => void;
}

interface FieldDef {
  key: keyof PersonalInfo;
  label: string;
  type: string;
  icon: LucideIcon;
  placeholder: string;
  required?: boolean;
}

const fields: FieldDef[] = [
  { key: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe', required: true },
  { key: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'john.doe@example.com', required: true },
  { key: 'phone', label: 'Phone Number', type: 'tel', icon: Phone, placeholder: '+1-555-123-4567' },
  { key: 'location', label: 'Location', type: 'text', icon: MapPin, placeholder: 'San Francisco, CA' },
];

export default function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const personalInfo = data.personalInfo || { name: '', email: '', phone: '', location: '' };

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...personalInfo,
      [field]: value,
    });
  };

  return (
    <div className="space-y-5">
      {fields.map(({ key, label, type, icon: Icon, placeholder, required }) => (
        <div key={key}>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
            <Icon className="w-3.5 h-3.5 text-slate-400" />
            {label}
            {required && <span className="text-pink-500">*</span>}
          </label>
          <input
            type={type}
            value={personalInfo[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl text-sm transition-all"
            required={required}
          />
        </div>
      ))}
    </div>
  );
}
