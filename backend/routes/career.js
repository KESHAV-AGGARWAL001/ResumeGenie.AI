const express = require('express');
const router = express.Router();
const {
    detectCareerGaps,
    optimizeForJobDescription,
    scanATSKeywords,
    tailorResume,
    generateCoverLetter,
    draftNetworkingEmail,
    rewriteBulletPoint,
    quickATSScore,
    generateInterviewQuestions,
    parseLinkedInProfile,
    estimateSalary,
} = require('../services/careerService');

const MAX_JD_LENGTH = 10000;
const MAX_TEXT_LENGTH = 50000;

function isValidResumeData(data) {
    return data && typeof data === 'object' && !Array.isArray(data);
}

function sanitizeString(str, maxLen = MAX_JD_LENGTH) {
    if (typeof str !== 'string') return '';
    return str.slice(0, maxLen).trim();
}

function safeError(error) {
    if (process.env.NODE_ENV === 'production') {
        return 'An internal error occurred. Please try again.';
    }
    return error.message || 'Unknown error';
}

router.post('/gap-analysis', async (req, res) => {
    const { resumeData, targetRole } = req.body;
    if (!isValidResumeData(resumeData) || !targetRole || typeof targetRole !== 'string') {
        return res.status(400).json({ error: 'Both resumeData (object) and targetRole (string) are required.' });
    }
    try {
        const analysis = await detectCareerGaps(resumeData, sanitizeString(targetRole, 200));
        res.json(analysis);
    } catch (error) {
        console.error('Career gap analysis error:', error.message);
        res.status(500).json({ error: safeError(error) });
    }
});

router.post('/optimize', async (req, res) => {
    const { resumeData, jobDescription } = req.body;
    if (!isValidResumeData(resumeData) || !jobDescription || typeof jobDescription !== 'string') {
        return res.status(400).json({ error: 'Both resumeData (object) and jobDescription (string) are required.' });
    }
    try {
        const optimization = await optimizeForJobDescription(resumeData, sanitizeString(jobDescription));
        res.json(optimization);
    } catch (error) {
        console.error('Resume optimization error:', error.message);
        res.status(500).json({ error: safeError(error) });
    }
});

router.post('/ats-scan', async (req, res) => {
    const { resumeData, jobDescription } = req.body;
    if (!isValidResumeData(resumeData) || !jobDescription || typeof jobDescription !== 'string') {
        return res.status(400).json({ error: 'Both resumeData (object) and jobDescription (string) are required.' });
    }
    try {
        const result = await scanATSKeywords(resumeData, sanitizeString(jobDescription));
        res.json(result);
    } catch (error) {
        console.error('ATS scan error:', error.message);
        res.status(500).json({ error: safeError(error) });
    }
});

router.post('/tailor', async (req, res) => {
    const { resumeData, jobDescription } = req.body;
    if (!isValidResumeData(resumeData) || !jobDescription || typeof jobDescription !== 'string') {
        return res.status(400).json({ error: 'Both resumeData (object) and jobDescription (string) are required.' });
    }
    try {
        const result = await tailorResume(resumeData, sanitizeString(jobDescription));
        res.json(result);
    } catch (error) {
        console.error('Resume tailor error:', error.message);
        res.status(500).json({ error: safeError(error) });
    }
});

router.post('/cover-letter', async (req, res) => {
    const { resumeData, jobDescription, companyName } = req.body;
    if (!isValidResumeData(resumeData) || !jobDescription || typeof jobDescription !== 'string' || !companyName || typeof companyName !== 'string') {
        return res.status(400).json({ error: 'resumeData (object), jobDescription (string), and companyName (string) are required.' });
    }
    try {
        const result = await generateCoverLetter(resumeData, sanitizeString(jobDescription), sanitizeString(companyName, 200));
        res.json(result);
    } catch (error) {
        console.error('Cover letter error:', error.message);
        res.status(500).json({ error: safeError(error) });
    }
});

router.post('/networking-email', async (req, res) => {
    const { resumeData, targetCompany, targetRole, recruiterName, tone } = req.body;
    if (!isValidResumeData(resumeData) || !targetCompany || typeof targetCompany !== 'string' || !targetRole || typeof targetRole !== 'string') {
        return res.status(400).json({ error: 'resumeData (object), targetCompany (string), and targetRole (string) are required.' });
    }
    const safeTone = ['formal', 'conversational', 'brief'].includes(tone) ? tone : 'formal';
    try {
        const result = await draftNetworkingEmail(resumeData, sanitizeString(targetCompany, 200), sanitizeString(targetRole, 200), sanitizeString(recruiterName || '', 200), safeTone);
        res.json(result);
    } catch (error) {
        console.error('Networking email error:', error.message);
        res.status(500).json({ error: safeError(error) });
    }
});

router.post('/rewrite-bullet', async (req, res) => {
    const { bulletPoint, context } = req.body;
    if (!bulletPoint || typeof bulletPoint !== 'string' || !bulletPoint.trim()) {
        return res.status(400).json({ error: 'bulletPoint is required and must be a non-empty string.' });
    }
    try {
        const result = await rewriteBulletPoint(sanitizeString(bulletPoint, 1000), context && typeof context === 'object' ? context : {});
        res.json(result);
    } catch (error) {
        console.error('Bullet rewrite error:', error.message);
        res.status(500).json({ error: safeError(error) });
    }
});

router.post('/quick-ats', async (req, res) => {
    const { resumeData, jobDescription } = req.body;
    if (!isValidResumeData(resumeData) || !jobDescription || typeof jobDescription !== 'string') {
        return res.status(400).json({ error: 'Both resumeData (object) and jobDescription (string) are required.' });
    }
    try {
        const result = await quickATSScore(resumeData, sanitizeString(jobDescription));
        res.json(result);
    } catch (error) {
        console.error('Quick ATS score error:', error.message);
        res.status(500).json({ error: safeError(error) });
    }
});

router.post('/interview-prep', async (req, res) => {
    const { resumeData, jobDescription, type } = req.body;
    if (!isValidResumeData(resumeData) || !jobDescription || typeof jobDescription !== 'string') {
        return res.status(400).json({ error: 'Both resumeData (object) and jobDescription (string) are required.' });
    }
    const safeType = ['behavioral', 'technical', 'situational'].includes(type) ? type : 'behavioral';
    try {
        const result = await generateInterviewQuestions(resumeData, sanitizeString(jobDescription), safeType);
        res.json(result);
    } catch (error) {
        console.error('Interview prep error:', error.message);
        res.status(500).json({ error: safeError(error) });
    }
});

router.post('/parse-linkedin', async (req, res) => {
    const { linkedInText } = req.body;
    if (!linkedInText || typeof linkedInText !== 'string' || !linkedInText.trim()) {
        return res.status(400).json({ error: 'linkedInText is required and must be a non-empty string.' });
    }
    try {
        const result = await parseLinkedInProfile(sanitizeString(linkedInText, MAX_TEXT_LENGTH));
        res.json(result);
    } catch (error) {
        console.error('LinkedIn parse error:', error.message);
        res.status(500).json({ error: safeError(error) });
    }
});

router.post('/salary-estimate', async (req, res) => {
    const { resumeData, targetRole, targetLocation } = req.body;
    if (!isValidResumeData(resumeData) || !targetRole || typeof targetRole !== 'string' || !targetLocation || typeof targetLocation !== 'string') {
        return res.status(400).json({ error: 'resumeData (object), targetRole (string), and targetLocation (string) are required.' });
    }
    try {
        const result = await estimateSalary(resumeData, sanitizeString(targetRole, 200), sanitizeString(targetLocation, 200));
        res.json(result);
    } catch (error) {
        console.error('Salary estimate error:', error.message);
        res.status(500).json({ error: safeError(error) });
    }
});

module.exports = router;
