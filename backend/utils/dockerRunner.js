const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Use our custom Docker image with fonts and class files
const DOCKER_IMAGE = process.env.DOCKER_IMAGE || 'latex-editor-custom';

module.exports = async function runXeLaTeX(texFilePath, outputDir) {
    const texFileName = path.basename(texFilePath);
    const workDir = path.dirname(texFilePath);
    const outDir = outputDir;
    const pdfFile = path.join(outDir, texFileName.replace(/\.tex$/, '.pdf'));
    const logFile = path.join(outDir, texFileName.replace(/\.tex$/, '.log'));

    try {
        // Run XeLaTeX in Docker with better error handling
        // Use -halt-on-error to stop on first error
        // Use -file-line-error to get file and line information for errors
        // Mount the templates directory to make class file available
        const templatesDir = path.join(__dirname, '..', 'templates');
        const fontsDir = path.join(templatesDir, 'fonts');
        const command = `docker run --rm \
            -v "${workDir.replace(/\\/g, '/')}":/data \
            -v "${templatesDir.replace(/\\/g, '/')}":/templates \
            -v "${fontsDir.replace(/\\/g, '/')}":/data/fonts \
            -e TEXINPUTS=".:/templates:" \
            -w /data ${DOCKER_IMAGE} \
            xelatex -interaction=nonstopmode -halt-on-error -file-line-error \
            -output-directory=out ${texFileName}`;

        try {
            execSync(command, { stdio: ['ignore', 'pipe', 'pipe'] });
        } catch (execError) {
            // If compilation fails, capture the error output
            console.error('LaTeX compilation error:', execError.message);

            // Check if log file was generated despite the error
            if (fs.existsSync(logFile)) {
                // Log file exists, we'll let the calling function handle it
                return null;
            } else {
                // No log file, throw with Docker error message
                throw new Error(`LaTeX compilation failed: ${execError.message}`);
            }
        }

        // Check if PDF was generated
        if (fs.existsSync(pdfFile)) {
            return pdfFile;
        }

        // PDF not found but no error was thrown - check log file
        if (fs.existsSync(logFile)) {
            return null; // Return null to indicate failure but log file exists
        }

        throw new Error('PDF not generated and no log file found');
    } catch (err) {
        throw new Error('LaTeX compilation failed: ' + err.message);
    }
};