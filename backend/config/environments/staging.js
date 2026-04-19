const production = require('./production');

module.exports = {
    ...production,
    env: 'staging',
    cache: {
        ...production.cache,
        subscriptionTTL: 2 * 60 * 1000,  // 2 min (faster cache refresh for testing)
        aiResponseTTL: 5 * 60 * 1000,    // 5 min
    },
    logging: {
        level: 'debug',
        pretty: false,
    },
};
