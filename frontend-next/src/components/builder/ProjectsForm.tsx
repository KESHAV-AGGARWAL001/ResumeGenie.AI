'use client';

import { v4 as uuidv4 } from 'uuid';
import { FolderOpen, Plus, X } from 'lucide-react';
import type { ResumeData, Project } from '@/lib/types';
import BulletRewriter from '@/components/builder/BulletRewriter';

interface ProjectsFormProps {
  data: ResumeData;
  onChange: (data: Project[]) => void;
}

export default function ProjectsForm({ data, onChange }: ProjectsFormProps) {
  const projects = data.projects || [];

  const addProject = () => {
    onChange([
      ...projects,
      {
        id: uuidv4(),
        name: '',
        techStack: [],
        link: '',
        bulletPoints: [''],
      },
    ]);
  };

  const removeProject = (id: string) => {
    onChange(projects.filter((proj) => proj.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: unknown) => {
    onChange(
      projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)),
    );
  };

  const addBulletPoint = (id: string) => {
    onChange(
      projects.map((proj) =>
        proj.id === id ? { ...proj, bulletPoints: [...proj.bulletPoints, ''] } : proj,
      ),
    );
  };

  const removeBulletPoint = (id: string, index: number) => {
    onChange(
      projects.map((proj) =>
        proj.id === id
          ? { ...proj, bulletPoints: proj.bulletPoints.filter((_, i) => i !== index) }
          : proj,
      ),
    );
  };

  const updateBulletPoint = (id: string, index: number, value: string) => {
    onChange(
      projects.map((proj) =>
        proj.id === id
          ? {
              ...proj,
              bulletPoints: proj.bulletPoints.map((bp, i) => (i === index ? value : bp)),
            }
          : proj,
      ),
    );
  };

  const updateTechStack = (id: string, value: string) => {
    const techArray = value.split(',');
    updateProject(id, 'techStack', techArray);
  };

  return (
    <div className="space-y-6">
      {projects.length === 0 && (
        <div className="empty-state">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-400">No projects added yet</p>
          <p className="text-xs text-slate-300">Click &quot;Add Project&quot; to get started</p>
        </div>
      )}

      {projects.map((proj, projIndex) => (
        <div key={proj.id} className="form-card space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-purple-600">Project #{projIndex + 1}</h3>
            <button
              onClick={() => removeProject(proj.id)}
              className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              Remove
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">
              Project Name <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              value={proj.name}
              onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
              placeholder="My Awesome Project"
              className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">
              Tech Stack (comma-separated)
            </label>
            <input
              type="text"
              value={proj.techStack?.join(',') || ''}
              onChange={(e) => updateTechStack(proj.id, e.target.value)}
              placeholder="Python, TensorFlow, Docker"
              className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">
              Project Link (GitHub/Demo)
            </label>
            <input
              type="url"
              value={proj.link}
              onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
              placeholder="https://github.com/username/project"
              className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">
              Project Description &amp; Highlights
            </label>
            <div className="space-y-2">
              {proj.bulletPoints.map((bullet, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => updateBulletPoint(proj.id, index, e.target.value)}
                    placeholder="Describe what you built or achieved"
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm transition-all"
                  />
                  <BulletRewriter
                    bulletPoint={bullet}
                    context={{ role: proj.name, company: '', techStack: proj.techStack || [] }}
                    onRewrite={(text) => updateBulletPoint(proj.id, index, text)}
                  />
                  {proj.bulletPoints.length > 1 && (
                    <button
                      onClick={() => removeBulletPoint(proj.id, index)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addBulletPoint(proj.id)}
                className="text-purple-600 hover:text-purple-700 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Bullet Point
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addProject}
        className="w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Project
      </button>
    </div>
  );
}
