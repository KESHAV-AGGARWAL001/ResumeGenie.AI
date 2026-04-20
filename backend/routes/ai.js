const express = require('express');
const router = express.Router();
const { evaluateResume, roastResume } = require('../services/aiService');

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
        const analysis = await evaluateResume(resumeText.trim().slice(0, 50000), (jobDescription || '').slice(0, 10000));
        res.json(analysis);
    } catch (error) {
        console.error('AI Analysis Route Error:', error);
        res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Failed to analyze resume' : error.message });
    }
});

router.post('/roast', async (req, res) => {
    const { resumeText } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
        return res.status(400).json({ error: 'resumeText is required and must be a non-empty string.' });
    }

    try {
        const result = await roastResume(resumeText.trim().slice(0, 50000));
        res.json(result);
    } catch (error) {
        console.error('Resume roast error:', error);
        res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Failed to roast resume' : error.message });
    }
});

module.exports = router;
