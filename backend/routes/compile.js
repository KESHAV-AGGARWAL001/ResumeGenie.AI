const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const runXeLaTeX = require('../utils/dockerRunner');
const { generateLatexFromData } = require('../services/latexGenerator');
const { validateResumeData } = require('../models/resumeSchema');
const { JobQueue } = require('../lib/jobQueue');
const { TieredCache } = require('../lib/cache');
const { hashContent } = require('../lib/hashUtil');

const router = express.Router();

const MAX_LATEX_SIZE = 200 * 1024; // 200KB

const compileQueue = new JobQueue('compile', { concurrency: 3 });
const pdfCache = new TieredCache({ maxSize: 50, defaultTTL: 60 * 60 * 1000 });

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

    const latexHash = hashContent(latex);
    const cachedPdf = pdfCache.get(latexHash);
    if (cachedPdf) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('X-Cache', 'HIT');
        return res.send(cachedPdf);
    }

    const jobId = uuidv4();
    const workDir = path.join(__dirname, '..', 'tmp', jobId);
    const texFile = path.join(workDir, 'resume.tex');
    const outDir = path.join(workDir, 'out');

    try {
        const pdfBuffer = await compileQueue.enqueue(async () => {
            fs.mkdirSync(workDir, { recursive: true });
            fs.mkdirSync(outDir, { recursive: true });
            fs.writeFileSync(texFile, latex);

            const pdfPath = await runXeLaTeX(texFile, outDir);

            if (!pdfPath || !fs.existsSync(pdfPath)) {
                throw new Error('PDF compilation failed');
            }

            return fs.readFileSync(pdfPath);
        });

        pdfCache.set(latexHash, pdfBuffer);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('X-Cache', 'MISS');
        res.send(pdfBuffer);
    } catch (err) {
        console.error('Compilation error:', err.message);
        res.status(500).json({
            error: err.message,
            jobId: jobId
        });
    } finally {
        setTimeout(() => {
            try {
                fs.rmSync(workDir, { recursive: true, force: true });
            } catch (cleanupErr) {
                console.error('Error cleaning up files:', cleanupErr.message);
            }
        }, 5000);
    }
});

router.getCompileStats = () => ({
    queue: compileQueue.stats(),
    cache: pdfCache.stats(),
});

module.exports = router;
