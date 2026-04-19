const { createHash } = require('node:crypto');

function hashContent(data) {
    const serialized = typeof data === 'string' ? data : JSON.stringify(data);
    return createHash('sha256').update(serialized).digest('hex');
}

module.exports = { hashContent };
