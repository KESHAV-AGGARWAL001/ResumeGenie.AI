module.exports = {
    env: 'development',
    port: 5000,
    cors: {
        origins: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    },
    cache: {
        subscriptionTTL: 60 * 1000,      // 1 min (shorter for dev)
        usageTTL: 15 * 1000,             // 15 sec
        aiResponseTTL: 5 * 60 * 1000,    // 5 min
        pdfTTL: 30 * 60 * 1000,          // 30 min
    },
    compile: {
        concurrency: 2,
        timeout: 120000,
    },
    requestTimeout: 60000,
    logging: {
        level: 'debug',
        pretty: true,
    },
};
