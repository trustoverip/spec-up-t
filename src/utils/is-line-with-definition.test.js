const { isLineWithDefinition } = require('./is-line-with-definition');

describe('isLineWithDefinition', () => {
    test('returns true for a basic [[def: term]] line', () => {
        expect(isLineWithDefinition('[[def: my-term]]')).toBe(true);
    });

    test('returns true when the line has text after the closing ]]', () => {
        expect(isLineWithDefinition('[[def: term, alias]] some trailing text')).toBe(true);
    });

    test('returns false when the closing ]] is missing', () => {
        expect(isLineWithDefinition('[[def: my-term')).toBe(false);
    });

    test('returns false for a non-def line', () => {
        expect(isLineWithDefinition('~ This is a description line')).toBe(false);
    });

    test('returns false for an empty string', () => {
        expect(isLineWithDefinition('')).toBe(false);
    });

    test('returns false for null', () => {
        expect(isLineWithDefinition(null)).toBe(false);
    });

    test('returns false for a non-string value', () => {
        expect(isLineWithDefinition(42)).toBe(false);
    });

    test('returns false when [[ is not at the start of the line', () => {
        expect(isLineWithDefinition('text [[def: term]]')).toBe(false);
    });
});
