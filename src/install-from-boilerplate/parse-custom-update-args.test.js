const { parseCustomUpdateArgs } = require('./parse-custom-update-args');

describe('parseCustomUpdateArgs', () => {
    test('defaults to a prompt with no flags', () => {
        expect(parseCustomUpdateArgs([])).toEqual({
            yes: false,
            dryRun: false,
            forceWorkflows: false,
        });
    });

    test('accepts --yes, -y, --dry-run, and --force-workflows', () => {
        expect(parseCustomUpdateArgs(['--yes'])).toEqual({
            yes: true,
            dryRun: false,
            forceWorkflows: false,
        });
        expect(parseCustomUpdateArgs(['-y', '--dry-run', '--force-workflows'])).toEqual({
            yes: true,
            dryRun: true,
            forceWorkflows: true,
        });
    });

    test('rejects an unknown option', () => {
        expect(() => parseCustomUpdateArgs(['--apply'])).toThrow('Unknown option: --apply');
    });
});
