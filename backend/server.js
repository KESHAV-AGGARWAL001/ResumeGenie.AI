require('dotenv').config();

// Validate environment before anything else
const { validateEnv } = require('./lib/envValidator');
validateEnv();

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
    rateLimitHeaders,
} = require('./middleware/rateLimiter');
const { requestIdMiddleware } = require('./lib/logger');
const { requestLoggerMiddleware } = require('./middleware/requestLogger');

// Import service stats for health endpoint
const { getCacheStats } = require('./services/subscriptionService');
const { getAiServiceStats } = require('./services/aiService');
const { getCareerServiceStats } = require('./services/careerService');

// Import cleanup scheduler
const { scheduleCleanup } = require('./utils/cleanup');

const app = express();

// ─── Trust Proxy (required behind Nginx/load balancer for correct IP) ──
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// ─── Security Headers ──────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for PDF iframe rendering
    crossOriginEmbedderPolicy: false,
}));
app.use(hpp());

// ─── Request ID + Structured Logging ────────────────────────────────
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(rateLimitHeaders);

// ─── CORS Configuration ─────────────────────────────────────────────
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        if (origin && origin.endsWith('.vercel.app')) {
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

// ─── Request Timeout (60s for most routes, 120s for compile) ───────
app.use((req, res, next) => {
    const timeout = req.path.startsWith('/compile') ? 120000 : 60000;
    req.setTimeout(timeout);
    res.setTimeout(timeout, () => {
        if (!res.headersSent) {
            res.status(408).json({ error: 'Request timeout' });
        }
    });
    next();
});

// ─── Body Parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ─── Health Check (public, no auth) ─────────────────────────────────
app.get('/health', (req, res) => {
    const compileStats = compileRoute.getCompileStats ? compileRoute.getCompileStats() : null;
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            subscription: getCacheStats(),
            ai: getAiServiceStats(),
            career: getCareerServiceStats(),
            compile: compileStats,
        },
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

// ─── 404 Handler (unknown routes) ──────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// ─── Global Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
    if (err.message && err.message.includes('not allowed by CORS')) {
        return res.status(403).json({ error: err.message });
    }

    const { logger } = require('./lib/logger');
    logger.error('Unhandled error', { requestId: req.id, error: err.message, stack: err.stack });
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    });
});

// ─── File Cleanup Scheduler (runs hourly) ───────────────────────────
scheduleCleanup();

// ─── Start Server ───────────────────────────────────────────────────
const { logger } = require('./lib/logger');
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    logger.info('Server started', {
        port: PORT,
        cors: allowedOrigins,
        features: ['rate-limiting', 'circuit-breaker', 'caching', 'job-queue', 'structured-logging'],
    });
});

// ─── Graceful Shutdown ─────────────────────────────────────────────
function gracefulShutdown(signal) {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
    setTimeout(() => {
        logger.error('Forced shutdown — timeout exceeded');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
