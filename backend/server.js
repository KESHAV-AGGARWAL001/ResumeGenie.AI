require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Firebase Admin SDK (must be before middleware imports)
require('./config/firebaseAdmin');

// Import routes
const compileRoute = require('./routes/compile');
const templateRoute = require('./routes/template');
const resumeRoute = require('./routes/resume');
const aiRoute = require('./routes/ai');
const uploadRoute = require('./routes/upload');

// Import auth middleware
const { requireAuth, optionalAuth } = require('./middleware/authMiddleware');

const app = express();

// ─── CORS Configuration ─────────────────────────────────────────────
// Restrict to known origins (add your production domain here)
const allowedOrigins = [
    'http://localhost:5173',    // Vite dev server
    'http://localhost:3000',    // Alternative dev port
    'http://127.0.0.1:5173',
];

// Add production origin from env if set
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ─── Health Check (public, no auth) ─────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ─── Route Registration ─────────────────────────────────────────────
// 
// Auth policy per route:
//   /compile    → requireAuth  (expensive: Docker + CPU)
//   /ai         → requireAuth  (expensive: Gemini API calls cost money)
//   /upload     → requireAuth  (file uploads must be tied to a user)
//   /resume     → requireAuth  (user-specific resume operations)
//   /template   → optionalAuth (browsing templates is OK for anonymous users)
//   /uploads    → static files (served as-is, no auth needed)
//   /health     → public       (no auth)

app.use('/compile', requireAuth, compileRoute);
app.use('/ai', requireAuth, aiRoute);
app.use('/upload', requireAuth, uploadRoute);
app.use('/resume', requireAuth, resumeRoute);
app.use('/template', optionalAuth, templateRoute);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Global Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
    // Handle CORS errors
    if (err.message && err.message.includes('not allowed by CORS')) {
        return res.status(403).json({ error: err.message });
    }

    console.error('[Server Error]', err.message);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    });
});

// ─── Start Server ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`Auth middleware active: requireAuth on /compile, /ai, /upload, /resume`);
}); 