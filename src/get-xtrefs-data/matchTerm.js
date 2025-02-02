function matchTerm(text, term) {
    if (!text || typeof text !== 'string') {
        // console.error('Invalid text:', text);
        console.log('Nothing to match');
        return false;
    }

    const firstLine = text.split('\n')[0].trim();

    // Check if the string starts with `[[def:` and ends with `]]`
    if (!firstLine.startsWith('[[def:') || !firstLine.endsWith(']]')) {
        console.log('String does not start with `[[def:` or end with `]]`');
        return false;
    }

    // Remove `[[def:` from the beginning and `]]` from the end
    let relevantPart = firstLine.slice(7, -2);

    // Split the string on `,` and trim the array elements
    let termsArray = relevantPart.split(',').map(term => term.trim());

    // Check if the term is in the array
    return termsArray.includes(term);
}

exports.matchTerm = matchTerm;