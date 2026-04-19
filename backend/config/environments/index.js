const env = process.env.NODE_ENV || 'development';

let config;
try {
    config = require(`./${env}`);
} catch {
    console.warn(`[Config] No config found for NODE_ENV="${env}", falling back to development`);
    config = require('./development');
}

module.exports = config;
