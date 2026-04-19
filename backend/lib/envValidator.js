const REQUIRED = [
    'GOOGLE_GENAI_API_KEY',
    'FIREBASE_PROJECT_ID',
];

const RECOMMENDED = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'FRONTEND_URL',
    'DOCKER_IMAGE',
];

function validateEnv() {
    const missing = REQUIRED.filter((key) => !process.env[key]);
    const warnings = RECOMMENDED.filter((key) => !process.env[key]);

    if (warnings.length > 0) {
        console.warn(`[ENV] Missing recommended vars (features will be limited): ${warnings.join(', ')}`);
    }

    if (missing.length > 0) {
        console.error(`[ENV] FATAL — Missing required environment variables: ${missing.join(', ')}`);
        console.error('[ENV] Copy backend/.env.example to backend/.env and fill in the values.');
        process.exit(1);
    }

    if (process.env.NODE_ENV === 'production') {
        if (!process.env.FRONTEND_URL) {
            console.warn('[ENV] FRONTEND_URL not set in production — CORS will only allow localhost origins');
        }
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.warn('[ENV] STRIPE_WEBHOOK_SECRET not set — payment webhooks will fail');
        }
    }
}

module.exports = { validateEnv };
