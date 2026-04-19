module.exports = {
    env: 'production',
    port: parseInt(process.env.PORT, 10) || 5000,
    cors: {
        origins: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [],
    },
    cache: {
        subscriptionTTL: 5 * 60 * 1000,   // 5 min
        usageTTL: 30 * 1000,              // 30 sec
        aiResponseTTL: 10 * 60 * 1000,    // 10 min
        pdfTTL: 60 * 60 * 1000,           // 1 hour
    },
    compile: {
        concurrency: 3,
        timeout: 120000,
    },
    requestTimeout: 60000,
    logging: {
        level: 'info',
        pretty: false,
    },
};
