const { isMarkdownFile, isNotHiddenFile, shouldProcessFile } = require('./file-filter');

describe('isMarkdownFile', () => {
    test('returns true for a .md file', () => {
        expect(isMarkdownFile('README.md')).toBe(true);
    });

    test('returns true for a file with a path segment ending in .md', () => {
        expect(isMarkdownFile('docs/intro.md')).toBe(true);
    });

    test('returns false for a .txt file', () => {
        expect(isMarkdownFile('notes.txt')).toBe(false);
    });

    test('returns false for a .js file', () => {
        expect(isMarkdownFile('index.js')).toBe(false);
    });

    test('returns false for a file with .md in the middle of its name', () => {
        expect(isMarkdownFile('readme.md.bak')).toBe(false);
    });
});

describe('isNotHiddenFile', () => {
    test('returns true for a normal filename', () => {
        expect(isNotHiddenFile('intro.md')).toBe(true);
    });

    test('returns false for a filename starting with underscore', () => {
        expect(isNotHiddenFile('_draft.md')).toBe(false);
    });

    test('returns true for a filename with an underscore elsewhere', () => {
        expect(isNotHiddenFile('my_file.md')).toBe(true);
    });
});

describe('shouldProcessFile', () => {
    test('returns true for a visible .md file', () => {
        expect(shouldProcessFile('spec.md')).toBe(true);
    });

    test('returns false for a hidden .md file (starts with _)', () => {
        expect(shouldProcessFile('_draft.md')).toBe(false);
    });

    test('returns false for a visible non-.md file', () => {
        expect(shouldProcessFile('config.json')).toBe(false);
    });

    test('returns false for a hidden non-.md file', () => {
        expect(shouldProcessFile('_config.json')).toBe(false);
    });
});
