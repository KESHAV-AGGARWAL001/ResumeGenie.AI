require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const path = require('path');

// Initialize Firebase Admin SDK (must be before middleware imports)
require('./config/firebaseAdmin');

// Import routes
const compileRoute = require('./routes/compile');
const templateRoute = require('./routes/template');
const resumeRoute = require('./routes/resume');
const aiRoute = require('./routes/ai');
const uploadRoute = require('./routes/upload');
const paymentsRoute = require('./routes/payments');
const careerRoute = require('./routes/career');

// Import middleware
const { requireAuth, optionalAuth } = require('./middleware/authMiddleware');
const { requireUsage, attachTier } = require('./middleware/usageMiddleware');
const {
    globalLimiter,
    compileLimiter,
    aiLimiter,
    uploadLimiter,
    templateLimiter,
} = require('./middleware/rateLimiter');

// Import cleanup scheduler
const { scheduleCleanup } = require('./utils/cleanup');

const app = express();

// ─── Security Headers ──────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for PDF iframe rendering
    crossOriginEmbedderPolicy: false,
}));
app.use(hpp());

// ─── CORS Configuration ─────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: function (origin, callback) {
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

// ─── Global Rate Limit ─────────────────────────────────────────────
app.use(globalLimiter);

// ─── Stripe Webhook (raw body — MUST be before express.json) ───────
// Stripe needs the raw body to verify webhook signatures
app.use('/payments/webhook', express.raw({ type: 'application/json' }));

// ─── Body Parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ─── Health Check (public, no auth) ─────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ─── Route Registration ─────────────────────────────────────────────
app.use('/compile', requireAuth, attachTier(), compileLimiter, requireUsage('compilationsToday'), compileRoute);
app.use('/ai', requireAuth, attachTier(), aiLimiter, requireUsage('aiAnalysesToday'), aiRoute);
app.use('/upload', requireAuth, uploadLimiter, uploadRoute);
app.use('/resume', requireAuth, templateLimiter, resumeRoute);
app.use('/template', optionalAuth, templateLimiter, templateRoute);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/payments', paymentsRoute);
app.use('/career', requireAuth, attachTier(), aiLimiter, requireUsage('aiAnalysesToday'), careerRoute);

// ─── Global Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
    if (err.message && err.message.includes('not allowed by CORS')) {
        return res.status(403).json({ error: err.message });
    }

    console.error('[Server Error]', err.message);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    });
});

// ─── File Cleanup Scheduler (runs hourly) ───────────────────────────
scheduleCleanup();

// ─── Start Server ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`Rate limiting: active on all endpoints`);
    console.log(`Security: helmet + hpp enabled`);
});
