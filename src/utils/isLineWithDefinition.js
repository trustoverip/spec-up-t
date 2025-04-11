async function isLineWithDefinition(line) {
    if (!line || typeof line !== 'string') return false;

    // Check if the line starts with [[def: and contains ]]
    // instead of checking if it ends with ]]
    return line.startsWith('[[def:') && line.includes(']]');
}

exports.isLineWithDefinition = isLineWithDefinition;