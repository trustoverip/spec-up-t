const {
    processDefLines,
    prependTildeToLines,
    normalizeParagraphSpacing,
    ensureTrailingNewline
} = require('./normalize-terminology-markdown');

describe('processDefLines', () => {
    test('inserts a blank line after [[def: ...]] when the next line is non-empty', () => {
        const lines = ['[[def: term]]', 'Description here'];
        const { lines: result, modified } = processDefLines(lines);
        expect(result[1]).toBe('');
        expect(result[2]).toBe('Description here');
        expect(modified).toBe(true);
    });

    test('inserts a blank line after [[tref: ...]] when the next line is non-empty', () => {
        const lines = ['[[tref: ext, term]]', 'Description here'];
        const { lines: result, modified } = processDefLines(lines);
        expect(result[1]).toBe('');
        expect(modified).toBe(true);
    });

    test('does not insert a blank line when one already exists', () => {
        const lines = ['[[def: term]]', '', 'Description'];
        const { lines: result, modified } = processDefLines(lines);
        expect(result).toEqual(lines);
        expect(modified).toBe(false);
    });

    test('handles a [[def: ...]] as the last line without inserting', () => {
        const lines = ['[[def: term]]'];
        const { lines: result, modified } = processDefLines(lines);
        expect(result).toEqual(['[[def: term]]']);
        expect(modified).toBe(false);
    });

    test('does not modify lines that are not def/tref', () => {
        const lines = ['~ Some description', 'Another line'];
        const { lines: result, modified } = processDefLines(lines);
        expect(result).toEqual(lines);
        expect(modified).toBe(false);
    });
});

describe('prependTildeToLines', () => {
    test('prepends "~ " to a plain non-empty line', () => {
        const lines = ['Some description text'];
        const { lines: result, modified } = prependTildeToLines(lines);
        expect(result[0]).toBe('~ Some description text');
        expect(modified).toBe(true);
    });

    test('does not prepend to a [[def: ...]] line', () => {
        const lines = ['[[def: term]]'];
        const { lines: result, modified } = prependTildeToLines(lines);
        expect(result[0]).toBe('[[def: term]]');
        expect(modified).toBe(false);
    });

    test('does not prepend to a [[tref: ...]] line', () => {
        const lines = ['[[tref: ext, term]]'];
        const { lines: result, modified } = prependTildeToLines(lines);
        expect(result[0]).toBe('[[tref: ext, term]]');
        expect(modified).toBe(false);
    });

    test('does not prepend to a blank line', () => {
        const lines = [''];
        const { lines: result, modified } = prependTildeToLines(lines);
        expect(result[0]).toBe('');
        expect(modified).toBe(false);
    });

    test('does not prepend to a line already starting with "~ "', () => {
        const lines = ['~ Already prefixed'];
        const { lines: result, modified } = prependTildeToLines(lines);
        expect(result[0]).toBe('~ Already prefixed');
        expect(modified).toBe(false);
    });

    test('does not prepend to an HTML comment line', () => {
        const lines = ['<!-- comment -->'];
        const { lines: result, modified } = prependTildeToLines(lines);
        expect(result[0]).toBe('<!-- comment -->');
        expect(modified).toBe(false);
    });

    test('handles a mix of lines correctly', () => {
        const lines = ['[[def: term]]', '', 'description'];
        const { lines: result } = prependTildeToLines(lines);
        expect(result[0]).toBe('[[def: term]]');
        expect(result[1]).toBe('');
        expect(result[2]).toBe('~ description');
    });
});

describe('normalizeParagraphSpacing', () => {
    test('collapses consecutive blank lines into one', () => {
        const lines = ['Line A', '', '', 'Line B'];
        const { lines: result, modified } = normalizeParagraphSpacing(lines);
        expect(result).toEqual(['Line A', '', 'Line B']);
        expect(modified).toBe(true);
    });

    test('leaves a single blank line between paragraphs unchanged', () => {
        const lines = ['Line A', '', 'Line B'];
        const { lines: result, modified } = normalizeParagraphSpacing(lines);
        expect(result).toEqual(lines);
        expect(modified).toBe(false);
    });

    test('leaves content with no blank lines unchanged', () => {
        const lines = ['Line A', 'Line B', 'Line C'];
        const { lines: result, modified } = normalizeParagraphSpacing(lines);
        expect(result).toEqual(lines);
        expect(modified).toBe(false);
    });

    test('handles an all-blank-lines array', () => {
        const lines = ['', '', '', ''];
        const { lines: result, modified } = normalizeParagraphSpacing(lines);
        expect(result).toEqual(['']);
        expect(modified).toBe(true);
    });

    test('handles an empty array', () => {
        const { lines: result } = normalizeParagraphSpacing([]);
        expect(result).toEqual([]);
    });
});

describe('ensureTrailingNewline', () => {
    test('appends a blank line when the last line is non-empty', () => {
        const lines = ['Last line'];
        const { lines: result, modified } = ensureTrailingNewline(lines);
        expect(result[result.length - 1]).toBe('');
        expect(modified).toBe(true);
    });

    test('does not append when the last line is already blank', () => {
        const lines = ['Last line', ''];
        const { lines: result, modified } = ensureTrailingNewline(lines);
        expect(result).toEqual(lines);
        expect(modified).toBe(false);
    });

    test('handles a single blank line', () => {
        const lines = [''];
        const { lines: result, modified } = ensureTrailingNewline(lines);
        expect(result).toEqual(['']);
        expect(modified).toBe(false);
    });
});
