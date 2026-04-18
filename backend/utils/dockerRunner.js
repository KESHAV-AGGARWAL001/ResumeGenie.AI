const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const DOCKER_IMAGE = process.env.DOCKER_IMAGE || 'latex-editor-custom';
const COMPILE_TIMEOUT_MS = 30000;

module.exports = async function runXeLaTeX(texFilePath, outputDir) {
    const texFileName = path.basename(texFilePath);
    const workDir = path.dirname(texFilePath);
    const pdfFile = path.join(outputDir, texFileName.replace(/\.tex$/, '.pdf'));

    const templatesDir = path.join(__dirname, '..', 'templates');
    const fontsDir = path.join(templatesDir, 'fonts');

    const args = [
        'run', '--rm',
        // Resource limits
        '--memory=512m',
        '--cpus=1',
        // Security: no network access (prevents data exfiltration from \write18)
        '--network=none',
        // Security: read-only root filesystem (writable dirs mounted explicitly)
        '--read-only',
        // Security: drop all capabilities
        '--cap-drop=ALL',
        // Security: no new privileges
        '--security-opt=no-new-privileges',
        // Volume mounts
        '-v', `${workDir.replace(/\\/g, '/')}:/data`,
        '-v', `${templatesDir.replace(/\\/g, '/')}:/templates:ro`,
        '-v', `${fontsDir.replace(/\\/g, '/')}:/data/fonts:ro`,
        // Tmpfs for writable temp dirs XeLaTeX needs
        '--tmpfs', '/tmp:size=64m',
        // Environment
        '-e', 'TEXINPUTS=.:/templates:',
        '-w', '/data',
        DOCKER_IMAGE,
        'xelatex',
        '-no-shell-escape',
        '-interaction=nonstopmode',
        '-halt-on-error',
        '-file-line-error',
        '-output-directory=out',
        texFileName
    ];

    return new Promise((resolve, reject) => {
        const child = execFile('docker', args, {
            timeout: COMPILE_TIMEOUT_MS,
            maxBuffer: 2 * 1024 * 1024,
        }, (error, stdout, stderr) => {
            if (error) {
                if (error.killed) {
                    return reject(new Error('LaTeX compilation timed out (30s limit)'));
                }

                const logFile = path.join(outputDir, texFileName.replace(/\.tex$/, '.log'));
                if (fs.existsSync(logFile)) {
                    const logContent = fs.readFileSync(logFile, 'utf8');
                    const errorLines = logContent.split('\n')
                        .filter(line => line.includes('Error') || line.startsWith('!') || line.includes('Fatal'))
                        .slice(0, 5)
                        .join('\n');
                    return reject(new Error(errorLines || 'LaTeX compilation failed'));
                }
                return reject(new Error('LaTeX compilation failed: ' + error.message));
            }

            if (fs.existsSync(pdfFile)) {
                return resolve(pdfFile);
            }

            reject(new Error('PDF not generated — check LaTeX source for errors'));
        });
    });
};
