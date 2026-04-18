const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { generateLatexFromData } = require('../services/latexGenerator');

router.get('/', (req, res) => {
    const templatePath = path.join(__dirname, '..', 'templates', 'Deedy_reversed_resume.tex');
    if (fs.existsSync(templatePath)) {
        res.type('text/plain').send(fs.readFileSync(templatePath, 'utf8'));
    } else {
        res.status(404).json({ error: 'Template not found' });
    }
});

// POST /template/generate - Returns raw LaTeX code for a template and data
router.post('/generate', (req, res) => {
    const { resumeData, templateId } = req.body;
    console.log(`[POST /template/generate] templateId: ${templateId}`);
    console.log(`[POST /template/generate] Received resumeData (length: ${JSON.stringify(resumeData || {}).length})`);

    if (!resumeData) {
        console.error('[POST /template/generate] Error: resumeData is missing');
        return res.status(400).json({ error: 'resumeData is required' });
    }

    try {
        console.log(`[POST /template/generate] Generating for user: ${resumeData.personalInfo?.name || 'Unknown'}`);
        const latex = generateLatexFromData(resumeData, templateId);
        res.type('text/plain').send(latex);
    } catch (err) {
        console.error('Error generating raw LaTeX:', err);
        res.status(500).json({
            error: 'Failed to generate LaTeX',
            message: err.message
        });
    }
});

module.exports = router;