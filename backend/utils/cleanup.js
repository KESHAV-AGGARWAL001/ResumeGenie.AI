const fs = require('fs');
const path = require('path');

const TMP_DIR = path.join(__dirname, '..', 'tmp');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

function cleanDirectory(dirPath, maxAgeMs) {
    if (!fs.existsSync(dirPath)) return 0;

    let cleaned = 0;
    const now = Date.now();

    for (const entry of fs.readdirSync(dirPath)) {
        const fullPath = path.join(dirPath, entry);
        try {
            const stat = fs.statSync(fullPath);
            if (now - stat.mtimeMs > maxAgeMs) {
                if (stat.isDirectory()) {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(fullPath);
                }
                cleaned++;
            }
        } catch (err) {
            console.error(`[Cleanup] Failed to remove ${fullPath}:`, err.message);
        }
    }
    return cleaned;
}

function runCleanup() {
    const tmpCleaned = cleanDirectory(TMP_DIR, MAX_AGE_MS);
    const uploadsCleaned = cleanDirectory(UPLOADS_DIR, MAX_AGE_MS);

    if (tmpCleaned > 0 || uploadsCleaned > 0) {
        console.log(`[Cleanup] Removed ${tmpCleaned} tmp dirs, ${uploadsCleaned} uploaded files`);
    }
}

function scheduleCleanup(intervalMs = 60 * 60 * 1000) {
    runCleanup();
    setInterval(runCleanup, intervalMs);
}

module.exports = { runCleanup, scheduleCleanup };
