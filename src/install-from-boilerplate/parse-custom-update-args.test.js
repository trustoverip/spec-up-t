const { parseCustomUpdateArgs } = require('./parse-custom-update-args');

describe('parseCustomUpdateArgs', () => {
    test('defaults to a prompt with no flags', () => {
        expect(parseCustomUpdateArgs([])).toEqual({ yes: false, dryRun: false });
    });

    test('accepts --yes, -y, and --dry-run', () => {
        expect(parseCustomUpdateArgs(['--yes'])).toEqual({ yes: true, dryRun: false });
        expect(parseCustomUpdateArgs(['-y', '--dry-run'])).toEqual({ yes: true, dryRun: true });
    });

    test('rejects an unknown option', () => {
        expect(() => parseCustomUpdateArgs(['--apply'])).toThrow('Unknown option: --apply');
    });
});
