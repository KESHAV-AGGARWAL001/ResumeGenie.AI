const express = require('express');
const { validateResumeData } = require('../models/resumeSchema');
const { generateLatexFromData } = require('../services/latexGenerator');

const router = express.Router();

/**
 * POST /resume/generate-latex
 * Generate LaTeX code from structured resume data without compiling
 */
router.post('/generate-latex', (req, res) => {
    try {
        const resumeData = req.body;

        // Validate resume data
        const { error, value } = validateResumeData(resumeData);

        if (error) {
            return res.status(400).json({
                error: 'Invalid resume data',
                details: error.details.map(d => ({
                    field: d.path.join('.'),
                    message: d.message
                }))
            });
        }

        // Generate LaTeX from validated data
        const latexCode = generateLatexFromData(value);

        res.json({
            success: true,
            latex: latexCode
        });

    } catch (err) {
        console.error('Error generating LaTeX:', err);
        res.status(500).json({
            error: 'Failed to generate LaTeX',
            message: err.message
        });
    }
});

/**
 * POST /resume/validate
 * Validate resume data structure without generating LaTeX
 */
router.post('/validate', (req, res) => {
    try {
        const resumeData = req.body;

        const { error, value } = validateResumeData(resumeData);

        if (error) {
            return res.status(400).json({
                valid: false,
                errors: error.details.map(d => ({
                    field: d.path.join('.'),
                    message: d.message
                }))
            });
        }

        res.json({
            valid: true,
            message: 'Resume data is valid'
        });

    } catch (err) {
        console.error('Error validating resume data:', err);
        res.status(500).json({
            error: 'Validation failed',
            message: err.message
        });
    }
});

module.exports = router;
