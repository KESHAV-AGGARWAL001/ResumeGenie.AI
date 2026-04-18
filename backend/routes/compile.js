const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const runXeLaTeX = require('../utils/dockerRunner');
const { generateLatexFromData } = require('../services/latexGenerator');
const { validateResumeData } = require('../models/resumeSchema');

const router = express.Router();

// POST /compile
router.post('/', async (req, res) => {
    let latex = req.body.latex;
    const resumeData = req.body.resumeData;
    const templateId = req.body.templateId;

    // If resumeData is provided, generate LaTeX from it
    if (resumeData) {
        try {
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

            // Generate LaTeX from validated data with selected template
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

    const jobId = uuidv4();
    const workDir = path.join(__dirname, '..', 'tmp', jobId);
    const texFile = path.join(workDir, 'resume.tex');
    const outDir = path.join(workDir, 'out');
    const logFile = path.join(outDir, 'resume.log');

    try {
        // Create directories
        fs.mkdirSync(workDir, { recursive: true });
        fs.mkdirSync(outDir, { recursive: true });

        // Write LaTeX content to file
        fs.writeFileSync(texFile, latex);

        // Run XeLaTeX compilation
        const pdfPath = await runXeLaTeX(texFile, outDir);

        if (!pdfPath || !fs.existsSync(pdfPath)) {
            // Check for log file to provide better error information
            let errorMessage = 'PDF compilation failed';
            if (fs.existsSync(logFile)) {
                const logContent = fs.readFileSync(logFile, 'utf8');
                // Extract relevant error information from log
                const errorLines = logContent.split('\n')
                    .filter(line => line.includes('Error') || line.includes('!') || line.includes('Fatal'))
                    .slice(0, 5) // Limit to first 5 error lines
                    .join('\n');

                errorMessage = errorLines || errorMessage;
            }
            throw new Error(errorMessage);
        }

        // Send PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.send(fs.readFileSync(pdfPath));
    } catch (err) {
        console.error('Compilation error:', err.message);
        res.status(500).json({
            error: err.message,
            jobId: jobId // Include jobId for debugging purposes
        });
    } finally {
        // Clean up files after sending (uncomment when ready for production)
        // setTimeout(() => {
        //     try {
        //         fs.rmSync(workDir, { recursive: true, force: true });
        //     } catch (cleanupErr) {
        //         console.error('Error cleaning up files:', cleanupErr);
        //     }
        // }, 5000); // Delay cleanup to ensure response is sent
    }
});

module.exports = router;