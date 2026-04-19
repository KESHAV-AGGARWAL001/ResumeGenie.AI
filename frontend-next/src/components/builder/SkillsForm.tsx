'use client';

import { Code2, Layers, Wrench, Database } from 'lucide-react';
import type { ResumeData, Skills } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';

interface SkillsFormProps {
  data: ResumeData;
  onChange: (data: Skills) => void;
}

interface SkillCategory {
  key: keyof Skills;
  label: string;
  icon: LucideIcon;
  placeholder: string;
}

const categories: SkillCategory[] = [
  { key: 'languages', label: 'Programming Languages', icon: Code2, placeholder: 'JavaScript, Python, Java, C++' },
  { key: 'frameworks', label: 'Frameworks & Libraries', icon: Layers, placeholder: 'React, Node.js, Django, Spring Boot' },
  { key: 'tools', label: 'Tools & Technologies', icon: Wrench, placeholder: 'Git, Docker, AWS, Kubernetes' },
  { key: 'databases', label: 'Databases', icon: Database, placeholder: 'MongoDB, PostgreSQL, MySQL, Redis' },
];

export default function SkillsForm({ data, onChange }: SkillsFormProps) {
  const skills = data.skills || { languages: [], frameworks: [], tools: [], databases: [] };

  const handleChange = (category: keyof Skills, value: string) => {
    const skillsArray = value.split(',');
    onChange({
      ...skills,
      [category]: skillsArray,
    });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500 mb-4">
        Enter your skills separated by commas. Example: JavaScript, Python, Java
      </p>

      {categories.map(({ key, label, icon: Icon, placeholder }) => (
        <div key={key}>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
            <Icon className="w-3.5 h-3.5 text-slate-400" />
            {label}
          </label>
          <input
            type="text"
            value={skills[key]?.join(',') || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl text-sm transition-all"
          />
        </div>
      ))}
    </div>
  );
}
