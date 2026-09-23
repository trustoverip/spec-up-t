const isLegacyEvalRequire = require('./is-legacy-eval-require');

describe('isLegacyEvalRequire', () => {
    test('is true when require.main is null (node -e require on Node 22)', () => {
        expect(isLegacyEvalRequire(null)).toBe(true);
        expect(isLegacyEvalRequire(undefined)).toBe(true);
    });

    test('is true when require.main is the eval wrapper', () => {
        expect(isLegacyEvalRequire({ filename: '[eval]' })).toBe(true);
        expect(isLegacyEvalRequire({ filename: '/cwd/[eval]' })).toBe(true);
        expect(isLegacyEvalRequire({ filename: 'C:\\cwd\\[eval]' })).toBe(true);
    });

    test('is false when this file is the main module', () => {
        const thisModule = { filename: '/pkg/custom-update.js' };
        expect(isLegacyEvalRequire(thisModule)).toBe(false);
    });

    test('is false when a real module required this file', () => {
        expect(isLegacyEvalRequire({ filename: '/pkg/cli.js' })).toBe(false);
        expect(isLegacyEvalRequire({ filename: '' })).toBe(false);
    });
});
