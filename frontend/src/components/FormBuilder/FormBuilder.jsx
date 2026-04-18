import React, { useState, useEffect } from 'react';
import PersonalInfoForm from './PersonalInfoForm';
import SocialProfilesForm from './SocialProfilesForm';
import ExperienceForm from './ExperienceForm';
import ProjectsForm from './ProjectsForm';
import SkillsForm from './SkillsForm';
import AchievementsForm from './AchievementsForm';
import CertificationsForm from './CertificationsForm';
import EducationForm from './EducationForm';

const STEPS = [
    { id: 1, name: 'Personal Info', component: PersonalInfoForm, key: 'personalInfo' },
    { id: 2, name: 'Social Profiles', component: SocialProfilesForm, key: 'socialProfiles' },
    { id: 3, name: 'Experience', component: ExperienceForm, key: 'experience' },
    { id: 4, name: 'Projects', component: ProjectsForm, key: 'projects' },
    { id: 5, name: 'Skills', component: SkillsForm, key: 'skills' },
    { id: 6, name: 'Education', component: EducationForm, key: 'education' },
    { id: 7, name: 'Achievements', component: AchievementsForm, key: 'achievements' },
    { id: 8, name: 'Certifications', component: CertificationsForm, key: 'certifications' },
];

export default function FormBuilder({ resumeData, onDataChange, onGenerateResume }) {
    const [currentStep, setCurrentStep] = useState(1);

    // Use data from props, fallback to empty object if somehow null (shouldn't be with App fix)
    const formData = resumeData || {};

    const updateFormSection = (section, data) => {
        onDataChange({
            ...formData,
            [section]: data
        });
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const CurrentFormComponent = STEPS[currentStep - 1].component;
    const currentStepKey = STEPS[currentStep - 1].key;

    const progress = (currentStep / STEPS.length) * 100;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Progress Bar + Stepper */}
            <div className="border-b border-slate-100 bg-white sticky top-0 z-10">
                {/* Thin progress bar */}
                <div className="h-1 bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500 ease-out rounded-r-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Step pills */}
                <div className="px-4 py-3 flex items-center gap-1 overflow-x-auto custom-scrollbar">
                    {STEPS.map((step) => (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(step.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all duration-200 ${
                                currentStep === step.id
                                    ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'
                                    : currentStep > step.id
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                            }`}
                        >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                                currentStep === step.id
                                    ? 'bg-purple-600 text-white'
                                    : currentStep > step.id
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-200 text-slate-400'
                            }`}>
                                {currentStep > step.id ? (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : step.id}
                            </span>
                            {step.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                <div className="max-w-3xl mx-auto animate-fade-in-up" key={currentStep}>
                    <div className="mb-8">
                        <span className="text-[10px] font-black tracking-widest text-purple-500 uppercase mb-2 block">
                            Step {currentStep} of {STEPS.length}
                        </span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {STEPS[currentStep - 1].name}
                        </h2>
                    </div>

                    <CurrentFormComponent
                        data={formData}
                        onChange={(data) => updateFormSection(currentStepKey, data)}
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky bottom-0 z-10">
                <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-20 disabled:cursor-not-allowed text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    Back
                </button>

                <div className="flex gap-2">
                    {currentStep === STEPS.length && (
                        <button
                            onClick={onGenerateResume}
                            className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-300/30 transition-all hover:-translate-y-0.5"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            Generate Resume
                        </button>
                    )}

                    {currentStep < STEPS.length && (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-1.5 px-7 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200/50 hover:-translate-y-0.5"
                        >
                            Next
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
