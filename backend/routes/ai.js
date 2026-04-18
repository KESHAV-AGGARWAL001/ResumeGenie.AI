const express = require('express');
const router = express.Router();
const { evaluateResume } = require('../services/aiService');

/**
 * @route   POST /ai/analyze
 * @desc    Analyze resume plain text against an optional job description
 * @body    { resumeText: string, jobDescription?: string }
 * @access  Public
 */
router.post('/analyze', async (req, res) => {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
        return res.status(400).json({ error: 'resumeText is required and must be a non-empty string.' });
    }

    try {
        const analysis = await evaluateResume(resumeText.trim(), jobDescription || '');
        res.json(analysis);
    } catch (error) {
        console.error('AI Analysis Route Error:', error);
        res.status(500).json({ error: error.message || 'Failed to analyze resume' });
    }
});

module.exports = router;
