const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const runXeLaTeX = require('../utils/dockerRunner');
const { generateLatexFromData } = require('../services/latexGenerator');
const { validateResumeData } = require('../models/resumeSchema');

const router = express.Router();

const MAX_LATEX_SIZE = 200 * 1024; // 200KB

// POST /compile
router.post('/', async (req, res) => {
    let latex = req.body.latex;
    const resumeData = req.body.resumeData;
    const templateId = req.body.templateId;

    if (resumeData) {
        try {
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

            latex = generateLatexFromData(value, templateId);
        } catch (err) {
            console.error('Error generating LaTeX from resume data:', err);
            return res.status(500).json({
                error: 'Failed to generate LaTeX from resume data',
                message: err.message
            });
        }
    }

    if (!latex) return res.status(400).json({ error: 'No LaTeX code or resume data provided' });

    if (Buffer.byteLength(latex, 'utf8') > MAX_LATEX_SIZE) {
        return res.status(400).json({ error: 'LaTeX source too large (max 200KB)' });
    }

    const jobId = uuidv4();
    const workDir = path.join(__dirname, '..', 'tmp', jobId);
    const texFile = path.join(workDir, 'resume.tex');
    const outDir = path.join(workDir, 'out');

    try {
        fs.mkdirSync(workDir, { recursive: true });
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(texFile, latex);

        const pdfPath = await runXeLaTeX(texFile, outDir);

        if (!pdfPath || !fs.existsSync(pdfPath)) {
            throw new Error('PDF compilation failed');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.send(fs.readFileSync(pdfPath));
    } catch (err) {
        console.error('Compilation error:', err.message);
        res.status(500).json({
            error: err.message,
            jobId: jobId
        });
    } finally {
        // Clean up compilation artifacts after response is sent
        setTimeout(() => {
            try {
                fs.rmSync(workDir, { recursive: true, force: true });
            } catch (cleanupErr) {
                console.error('Error cleaning up files:', cleanupErr.message);
            }
        }, 5000);
    }
});

module.exports = router;
