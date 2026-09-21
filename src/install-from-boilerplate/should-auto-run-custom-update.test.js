const shouldAutoRunCustomUpdate = require('./should-auto-run-custom-update');

describe('shouldAutoRunCustomUpdate', () => {
    const thisModule = { filename: '/pkg/custom-update.js' };

    test('runs when this file is the main module', () => {
        expect(shouldAutoRunCustomUpdate(thisModule, thisModule, {})).toBe(true);
    });

    test('runs when require.main is null (node -e require on Node 22)', () => {
        expect(shouldAutoRunCustomUpdate(null, thisModule, {})).toBe(true);
    });

    test('runs when require.main is the eval wrapper', () => {
        expect(shouldAutoRunCustomUpdate({ filename: '[eval]' }, thisModule, {})).toBe(true);
        expect(shouldAutoRunCustomUpdate({ filename: '/cwd/[eval]' }, thisModule, {})).toBe(true);
    });

    test('does not run for a real module with an empty filename', () => {
        expect(shouldAutoRunCustomUpdate({ filename: '' }, thisModule, {})).toBe(false);
    });

    test('does not run when SPEC_UP_T_SKIP_CUSTOM_UPDATE is true', () => {
        const env = { SPEC_UP_T_SKIP_CUSTOM_UPDATE: 'true' };
        expect(shouldAutoRunCustomUpdate(thisModule, thisModule, env)).toBe(false);
        expect(shouldAutoRunCustomUpdate(null, thisModule, env)).toBe(false);
    });
});
