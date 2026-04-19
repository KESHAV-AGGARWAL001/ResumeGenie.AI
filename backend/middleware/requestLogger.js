const { logger } = require('../lib/logger');

function requestLoggerMiddleware(req, res, next) {
    const start = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
        const duration = Date.now() - start;
        const meta = {
            requestId: req.id,
            method,
            path: originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.uid || null,
        };

        if (res.statusCode >= 500) {
            logger.error('Request failed', meta);
        } else if (res.statusCode >= 400) {
            logger.warn('Client error', meta);
        } else {
            logger.info('Request completed', meta);
        }
    });

    next();
}

module.exports = { requestLoggerMiddleware };
