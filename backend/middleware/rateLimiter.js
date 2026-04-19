const rateLimit = require('express-rate-limit');

function keyGenerator(req) {
    return req.user?.uid || req.ip;
}

function rateLimitHeaders(req, res, next) {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
        if (res.statusCode === 429) {
            const retryAfter = res.getHeader('Retry-After') || 60;
            res.setHeader('Retry-After', retryAfter);
        }
        return originalJson(body);
    };
    next();
}

// Global rate limit: 100 requests per 15 minutes
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    message: {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: '15 minutes',
    },
});

// Compile endpoint: expensive (Docker + CPU)
const compileLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: (req) => {
        const tier = req.user?.tier || 'free';
        if (tier === 'enterprise') return 200;
        if (tier === 'pro') return 100;
        return 3;
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    message: {
        error: 'Compilation limit reached',
        message: 'You have reached your daily PDF compilation limit. Upgrade to Pro for unlimited compilations.',
        upgrade: true,
    },
});

// AI analysis: expensive (Gemini API cost)
const aiLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: (req) => {
        const tier = req.user?.tier || 'free';
        if (tier === 'enterprise') return 100;
        if (tier === 'pro') return 10;
        return 1;
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    message: {
        error: 'AI analysis limit reached',
        message: 'You have reached your daily AI analysis limit. Upgrade to Pro for more analyses.',
        upgrade: true,
    },
});

// Upload endpoint: moderate cost
const uploadLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: (req) => {
        const tier = req.user?.tier || 'free';
        if (tier === 'enterprise') return 100;
        if (tier === 'pro') return 30;
        return 5;
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    message: {
        error: 'Upload limit reached',
        message: 'You have reached your daily upload limit.',
    },
});

// Template/resume endpoints: lighter limits
const templateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
});

module.exports = {
    globalLimiter,
    compileLimiter,
    aiLimiter,
    uploadLimiter,
    templateLimiter,
    rateLimitHeaders,
};
