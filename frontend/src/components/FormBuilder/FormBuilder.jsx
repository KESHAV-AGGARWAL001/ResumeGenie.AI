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

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Progress Stepper */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    {STEPS.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center group cursor-pointer transition-all" onClick={() => setCurrentStep(step.id)}>
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${currentStep === step.id
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 ring-4 ring-purple-50 scale-110'
                                        : currentStep > step.id
                                            ? 'bg-purple-100 text-purple-600'
                                            : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                                        }`}
                                >
                                    {currentStep > step.id ? '✓' : step.id}
                                </div>
                                <span className={`text-[10px] mt-2 font-medium transition-colors ${currentStep === step.id
                                    ? 'text-purple-600'
                                    : 'text-gray-400 group-hover:text-gray-500'
                                    }`}>
                                    {step.name}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${currentStep > step.id
                                    ? 'bg-purple-200'
                                    : 'bg-gray-100'
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                <div className="max-w-3xl mx-auto animate-fade-in-up">
                    <div className="mb-8">
                        <span className="text-xs font-bold tracking-wider text-purple-600 uppercase mb-2 block">Step {currentStep} of {STEPS.length}</span>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {STEPS[currentStep - 1].name}
                        </h2>
                    </div>

                    <CurrentFormComponent
                        data={formData}
                        onChange={(data) => updateFormSection(currentStepKey, data)}
                    />
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="px-8 py-5 border-t border-gray-100 flex justify-between items-center bg-white sticky bottom-0 z-10">
                <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                    Back
                </button>

                <div className="flex gap-3">
                    {currentStep === STEPS.length && (
                        <button
                            onClick={onGenerateResume}
                            className="px-8 py-2.5 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all transform hover:-translate-y-0.5"
                        >
                            ✨ Generate Resume
                        </button>
                    )}

                    {currentStep < STEPS.length && (
                        <button
                            onClick={handleNext}
                            className="px-8 py-2.5 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:-translate-y-0.5"
                        >
                            Next Step &rarr;
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
