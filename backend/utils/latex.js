/**
 * Escape special LaTeX characters in user input
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text safe for LaTeX
 */
function escapeLaTeX(text) {
    if (!text) return '';
    if (typeof text !== 'string') return String(text);

    return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Format date string (e.g. "2023-01-01" -> "Jan 2023")
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    // Basic implementation, can be enhanced
    return escapeLaTeX(dateStr);
}

module.exports = {
    escapeLaTeX,
    formatDate
};
