const { randomUUID } = require('node:crypto');

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function formatLog(level, message, meta = {}) {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        ...meta,
        message,
    });
}

const logger = {
    debug(msg, meta) { console.log(formatLog('debug', msg, meta)); },
    info(msg, meta)  { console.log(formatLog('info', msg, meta)); },
    warn(msg, meta)  { console.warn(formatLog('warn', msg, meta)); },
    error(msg, meta) { console.error(formatLog('error', msg, meta)); },
};

function createRequestLogger(req) {
    const ctx = {
        requestId: req.id,
        method: req.method,
        path: req.originalUrl || req.url,
        userId: req.user?.uid || null,
    };
    return {
        debug(msg, extra) { logger.debug(msg, { ...ctx, ...extra }); },
        info(msg, extra)  { logger.info(msg, { ...ctx, ...extra }); },
        warn(msg, extra)  { logger.warn(msg, { ...ctx, ...extra }); },
        error(msg, extra) { logger.error(msg, { ...ctx, ...extra }); },
    };
}

function requestIdMiddleware(req, _res, next) {
    req.id = req.headers['x-request-id'] || randomUUID();
    next();
}

module.exports = { logger, createRequestLogger, requestIdMiddleware };
