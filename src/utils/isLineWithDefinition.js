async function isLineWithDefinition(line) {
    // Check if the string starts with `[[def:` and ends with `]]`
    if (line.startsWith('[[def:') && line.endsWith(']]')) {
        // console.log('String starts with `[[def:` and ends with `]]`');
        return true;
    } else {
        // console.log('String does not start with `[[def:` or end with `]]`');
        return false;
    }
}

exports.isLineWithDefinition = isLineWithDefinition;