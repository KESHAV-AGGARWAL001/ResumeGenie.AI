const deedy = require('./deedy');
const modern = require('./modern');
const jakes = require('./jakes'); // Fixed path
const moderncv = require('./moderncv');
const moderndeedy = require('./moderndeedy');

const templates = {
    [deedy.id]: deedy,
    [modern.id]: modern,
    [jakes.id]: jakes,
    [moderncv.id]: moderncv,
    [moderndeedy.id]: moderndeedy
};

/**
 * Get a template by ID, falling back to default
 */
function getTemplate(id) {
    return templates[id] || deedy; // Default to Deedy
}

module.exports = {
    getTemplate,
    templates,
    // Export individual templates too if needed
    deedy,
    modern,
    jakes,
    moderncv,
    moderndeedy
};
