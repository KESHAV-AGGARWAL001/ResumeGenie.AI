const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads directory exists (just in case)
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'));
    },
});

// POST /upload
router.post('/', upload.single('resume'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ filename: req.file.filename, url: `/uploads/${req.file.filename}` });
});

// GET /upload/extract?filename=...
router.get('/extract', async (req, res) => {
    const { filename } = req.query;
    if (!filename) return res.status(400).json({ error: 'Filename required' });
    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        await parser.destroy();
        res.json({ text: result.text });
    } catch (err) {
        console.error('PDF Parse Error:', err);
        res.status(500).json({ error: 'Failed to extract PDF text' });
    }
});

module.exports = router;
