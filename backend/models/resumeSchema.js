const Joi = require('joi');

/**
 * Resume Data Schema Validation
 * Defines the structure for resume data stored in Firestore
 */

const resumeSchema = Joi.object({
    userId: Joi.string().required(),

    personalInfo: Joi.object({
        name: Joi.string().required().trim(),
        email: Joi.string().email().required(),
        phone: Joi.string().allow('').optional(),
        location: Joi.string().allow('').optional()
    }).required(),

    socialProfiles: Joi.object({
        github: Joi.string().allow('').optional(),
        linkedin: Joi.string().allow('').optional(),
        leetcode: Joi.string().allow('').optional(),
        codeforces: Joi.string().allow('').optional(),
        codechef: Joi.string().allow('').optional(),
        gfg: Joi.string().allow('').optional(),
        portfolio: Joi.string().allow('').optional(),
        other: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                url: Joi.string().required()
            })
        ).optional()
    }).optional(),

    experience: Joi.array().items(
        Joi.object({
            id: Joi.string().required(),
            company: Joi.string().required().trim(),
            position: Joi.string().required().trim(),
            location: Joi.string().allow('').optional(),
            startDate: Joi.string().required(),
            endDate: Joi.string().required(), // Can be "Present"
            techStack: Joi.array().items(Joi.string()).optional(),
            bulletPoints: Joi.array().items(Joi.string()).min(1).required()
        })
    ).optional(),

    projects: Joi.array().items(
        Joi.object({
            id: Joi.string().required(),
            name: Joi.string().required().trim(),
            techStack: Joi.array().items(Joi.string()).optional(),
            link: Joi.string().allow('').optional(), // Relaxed URI validation
            bulletPoints: Joi.array().items(Joi.string()).min(1).required()
        })
    ).optional(),

    skills: Joi.object({
        languages: Joi.array().items(Joi.string()).optional(),
        frameworks: Joi.array().items(Joi.string()).optional(),
        tools: Joi.array().items(Joi.string()).optional(),
        databases: Joi.array().items(Joi.string()).optional()
    }).optional(),

    achievements: Joi.array().items(Joi.string()).optional(),

    certifications: Joi.array().items(
        Joi.object({
            id: Joi.string().optional(),
            name: Joi.string().required().trim(),
            issuer: Joi.string().required().trim(),
            date: Joi.string().required()
        })
    ).optional(),

    education: Joi.array().items(
        Joi.object({
            id: Joi.string().optional(),
            institution: Joi.string().required().trim(),
            degree: Joi.string().required().trim(),
            location: Joi.string().allow('').optional(),
            startDate: Joi.string().required(),
            endDate: Joi.string().required(),
            gpa: Joi.string().allow('').optional(),
            honors: Joi.array().items(Joi.string()).optional()
        })
    ).optional(),

    metadata: Joi.object({
        createdAt: Joi.date().iso().optional(),
        updatedAt: Joi.date().iso().optional(),
        templateVersion: Joi.string().default('deedy-reversed-v1')
    }).optional()
});

/**
 * Validate resume data against schema
 * @param {Object} data - Resume data to validate
 * @returns {Object} - { error, value }
 */
function validateResumeData(data) {
    return resumeSchema.validate(data, { abortEarly: false });
}

module.exports = {
    resumeSchema,
    validateResumeData
};
