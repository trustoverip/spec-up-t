const { matchTerm } = require('./matchTerm');

describe('matchTerm', () => {
    test('returns true when the term is found in a correctly formatted definition', () => {
        const text = '[[def: term1, term2]]\nSome additional text';
        expect(matchTerm(text, 'term1')).toBe(true);
        expect(matchTerm(text, 'term2')).toBe(true);
    });

    test('returns false when the term is not found in the definition', () => {
        const text = '[[def: term1, term2]]\nSome additional text';
        expect(matchTerm(text, 'term3')).toBe(false);
    });

    test('returns false when the text is null or not a string', () => {
        expect(matchTerm(null, 'term1')).toBe(false);
        expect(matchTerm(123, 'term1')).toBe(false);
    });

    test('returns false when the first line is not a valid definition', () => {
        const text = 'Invalid definition line\n[[def: term1, term2]]';
        expect(matchTerm(text, 'term1')).toBe(false);
    });

    test('handles extra spaces correctly', () => {
        const text = '[[def:   term1  ,   term2   ]]';
        expect(matchTerm(text, 'term1')).toBe(true);
        expect(matchTerm(text, 'term2')).toBe(true);
    });
});