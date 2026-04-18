const { getTemplate } = require('../templates');
const { escapeLaTeX } = require('../utils/latex');

/**
 * Main function to generate complete LaTeX resume from JSON data
 * @param {Object} resumeData - Structured resume data
 * @param {string} templateId - ID of the template to use (e.g., 'deedy', 'modern')
 * @returns {string} - Complete LaTeX document
 */
function generateLatexFromData(resumeData, templateId) {
    // Determine template ID from argument or metadata, default to 'deedy'
    const id = templateId || (resumeData.metadata && resumeData.metadata.templateId) || 'deedy';

    console.log(`[latexGenerator] Using template ID: ${id} for user: ${resumeData.personalInfo?.name || 'Unknown'}`);

    // Get the template implementation
    const template = getTemplate(id);

    // Fallback if template not found
    if (!template) {
        console.warn(`[latexGenerator] Template '${id}' not found, falling back to default.`);
        return getTemplate('deedy').generate(resumeData);
    }

    console.log(`[latexGenerator] Generating LaTeX using template: ${template.name} (${template.id})`);

    try {
        const output = template.generate(resumeData);
        console.log(`[latexGenerator] Generation successful. Length: ${output.length}`);
        return output;
    } catch (err) {
        console.error(`[latexGenerator] Error in template ${id}:`, err);
        throw err;
    }
}

module.exports = {
    generateLatexFromData,
    escapeLaTeX
};
