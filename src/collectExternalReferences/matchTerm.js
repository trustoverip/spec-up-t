const isLineWithDefinition = require('../utils/is-line-with-definition').isLineWithDefinition;
const Logger = require('../utils/logger');

function matchTerm(text, term) {
    if (!text || typeof text !== 'string') {
        Logger.warn('Nothing to match for term:', term);
        return false;
    }

    const firstLine = text.split('\n')[0].trim();

    if (isLineWithDefinition(firstLine) === false) {
        Logger.warn('String does not start with `[[def:` or end with `]]`');
        return false;
    };

    // Find the closing bracket position instead of assuming it's at the end
    const startPos = firstLine.indexOf('[[def:') + 6;
    const endPos = firstLine.indexOf(']]');

    if (startPos === -1 || endPos === -1) return false;

    // Extract text between [[def: and ]]
    let relevantPart = firstLine.substring(startPos, endPos);

    // Split the string on `,` and trim the array elements
    let termsArray = relevantPart.split(',').map(term => term.trim());

    // Check if the term is in the array
    return termsArray.includes(term);
}

exports.matchTerm = matchTerm;