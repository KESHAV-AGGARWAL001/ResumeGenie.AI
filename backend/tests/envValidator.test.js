const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

describe('envValidator', () => {
    let originalEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        process.env = originalEnv;
        delete require.cache[require.resolve('../lib/envValidator')];
    });

    it('does not throw when required vars are present', () => {
        process.env.GOOGLE_GENAI_API_KEY = 'test-key';
        process.env.FIREBASE_PROJECT_ID = 'test-project';

        const { validateEnv } = require('../lib/envValidator');
        assert.doesNotThrow(() => {
            const origExit = process.exit;
            process.exit = (code) => { if (code === 1) throw new Error('exit'); };
            try { validateEnv(); } finally { process.exit = origExit; }
        });
    });

    it('calls process.exit(1) when required vars are missing', () => {
        delete process.env.GOOGLE_GENAI_API_KEY;
        delete process.env.FIREBASE_PROJECT_ID;

        const { validateEnv } = require('../lib/envValidator');
        let exitCalled = false;
        const origExit = process.exit;
        process.exit = (code) => { if (code === 1) exitCalled = true; };
        try {
            validateEnv();
            assert.ok(exitCalled, 'process.exit(1) should have been called');
        } finally {
            process.exit = origExit;
        }
    });
});
