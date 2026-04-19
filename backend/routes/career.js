const express = require('express');
const router = express.Router();
const {
    detectCareerGaps,
    optimizeForJobDescription,
    scanATSKeywords,
    tailorResume,
    generateCoverLetter,
    draftNetworkingEmail,
} = require('../services/careerService');

router.post('/gap-analysis', async (req, res) => {
    const { resumeData, targetRole } = req.body;
    if (!resumeData || !targetRole) {
        return res.status(400).json({ error: 'Both resumeData and targetRole are required.' });
    }
    try {
        const analysis = await detectCareerGaps(resumeData, targetRole);
        res.json(analysis);
    } catch (error) {
        console.error('Career gap analysis error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to analyze career gaps' });
    }
});

router.post('/optimize', async (req, res) => {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData || !jobDescription) {
        return res.status(400).json({ error: 'Both resumeData and jobDescription are required.' });
    }
    try {
        const optimization = await optimizeForJobDescription(resumeData, jobDescription);
        res.json(optimization);
    } catch (error) {
        console.error('Resume optimization error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to optimize resume' });
    }
});

router.post('/ats-scan', async (req, res) => {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData || !jobDescription) {
        return res.status(400).json({ error: 'Both resumeData and jobDescription are required.' });
    }
    try {
        const result = await scanATSKeywords(resumeData, jobDescription);
        res.json(result);
    } catch (error) {
        console.error('ATS scan error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to scan ATS keywords' });
    }
});

router.post('/tailor', async (req, res) => {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData || !jobDescription) {
        return res.status(400).json({ error: 'Both resumeData and jobDescription are required.' });
    }
    try {
        const result = await tailorResume(resumeData, jobDescription);
        res.json(result);
    } catch (error) {
        console.error('Resume tailor error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to tailor resume' });
    }
});

router.post('/cover-letter', async (req, res) => {
    const { resumeData, jobDescription, companyName } = req.body;
    if (!resumeData || !jobDescription || !companyName) {
        return res.status(400).json({ error: 'resumeData, jobDescription, and companyName are required.' });
    }
    try {
        const result = await generateCoverLetter(resumeData, jobDescription, companyName);
        res.json(result);
    } catch (error) {
        console.error('Cover letter error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to generate cover letter' });
    }
});

router.post('/networking-email', async (req, res) => {
    const { resumeData, targetCompany, targetRole, recruiterName, tone } = req.body;
    if (!resumeData || !targetCompany || !targetRole) {
        return res.status(400).json({ error: 'resumeData, targetCompany, and targetRole are required.' });
    }
    const safeTone = ['formal', 'conversational', 'brief'].includes(tone) ? tone : 'formal';
    try {
        const result = await draftNetworkingEmail(resumeData, targetCompany, targetRole, recruiterName || '', safeTone);
        res.json(result);
    } catch (error) {
        console.error('Networking email error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to draft networking email' });
    }
});

module.exports = router;
