const { processEscapedTags, restoreEscapedTags } = require('./escape-placeholder-utils');

describe('processEscapedTags', () => {
    test('replaces \\[[ with a placeholder', () => {
        const input = '\\[[def: term]]';
        const output = processEscapedTags(input);
        expect(output).toBe('__SPEC_UP_ESCAPED_TAG__def: term]]');
    });

    test('handles multiple escaped tags in one string', () => {
        const input = '\\[[def: a]] and \\[[xref: b, c]]';
        const output = processEscapedTags(input);
        expect(output).toContain('__SPEC_UP_ESCAPED_TAG__def: a]]');
        expect(output).toContain('__SPEC_UP_ESCAPED_TAG__xref: b, c]]');
        expect(output).not.toContain('\\[[');
    });

    test('leaves unescaped [[ unchanged', () => {
        const input = '[[def: term]]';
        const output = processEscapedTags(input);
        expect(output).toBe('[[def: term]]');
    });

    test('returns empty string unchanged', () => {
        expect(processEscapedTags('')).toBe('');
    });

    test('returns plain text unchanged', () => {
        const text = 'no tags here';
        expect(processEscapedTags(text)).toBe(text);
    });
});

describe('restoreEscapedTags', () => {
    test('replaces placeholder with [[', () => {
        const input = '__SPEC_UP_ESCAPED_TAG__def: term]]';
        const output = restoreEscapedTags(input);
        expect(output).toBe('[[def: term]]');
    });

    test('handles multiple placeholders', () => {
        const input = '__SPEC_UP_ESCAPED_TAG__a]] and __SPEC_UP_ESCAPED_TAG__b]]';
        const output = restoreEscapedTags(input);
        expect(output).toBe('[[a]] and [[b]]');
    });

    test('leaves text without placeholders unchanged', () => {
        const text = '[[def: term]]';
        expect(restoreEscapedTags(text)).toBe(text);
    });

    test('returns empty string unchanged', () => {
        expect(restoreEscapedTags('')).toBe('');
    });
});

describe('processEscapedTags + restoreEscapedTags roundtrip', () => {
    test('escaped tags survive a full process-then-restore cycle', () => {
        const original = 'Use \\[[def: term]] to define terms.';
        const afterProcess = processEscapedTags(original);
        const afterRestore = restoreEscapedTags(afterProcess);
        expect(afterRestore).toBe('Use [[def: term]] to define terms.');
    });
});
