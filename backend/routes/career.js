const express = require('express');
const router = express.Router();
const { detectCareerGaps, optimizeForJobDescription } = require('../services/careerService');

// POST /career/gap-analysis
router.post('/gap-analysis', async (req, res) => {
    const { resumeData, targetRole } = req.body;

    if (!resumeData || !targetRole) {
        return res.status(400).json({
            error: 'Both resumeData and targetRole are required.',
        });
    }

    try {
        const analysis = await detectCareerGaps(resumeData, targetRole);
        res.json(analysis);
    } catch (error) {
        console.error('Career gap analysis error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to analyze career gaps' });
    }
});

// POST /career/optimize
router.post('/optimize', async (req, res) => {
    const { resumeData, jobDescription } = req.body;

    if (!resumeData || !jobDescription) {
        return res.status(400).json({
            error: 'Both resumeData and jobDescription are required.',
        });
    }

    try {
        const optimization = await optimizeForJobDescription(resumeData, jobDescription);
        res.json(optimization);
    } catch (error) {
        console.error('Resume optimization error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to optimize resume' });
    }
});

module.exports = router;
