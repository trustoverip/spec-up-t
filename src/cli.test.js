jest.mock('./install-from-boilerplate/custom-update', () => jest.fn().mockResolvedValue(undefined));

const { main, HELP } = require('./cli');
const customUpdate = require('./install-from-boilerplate/custom-update');

describe('spec-up-t CLI', () => {
    let stdout;
    let stderr;

    beforeEach(() => {
        stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
        stderr = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
        jest.clearAllMocks();
        customUpdate.mockResolvedValue(undefined);
        process.exitCode = 0;
    });

    afterEach(() => {
        stdout.mockRestore();
        stderr.mockRestore();
        process.exitCode = 0;
    });

    test('runs custom-update', async () => {
        await main(['node', 'spec-up-t', 'custom-update']);
        expect(customUpdate).toHaveBeenCalledTimes(1);
        expect(process.exitCode).toBe(0);
    });

    test('prints help for -h and --help', async () => {
        await main(['node', 'spec-up-t', '--help']);
        expect(stdout).toHaveBeenCalledWith(HELP);
        expect(customUpdate).not.toHaveBeenCalled();

        await main(['node', 'spec-up-t', '-h']);
        expect(stdout).toHaveBeenCalledTimes(2);
    });

    test('exits 1 with help when no command is given', async () => {
        await main(['node', 'spec-up-t']);
        expect(stderr).toHaveBeenCalledWith(HELP);
        expect(process.exitCode).toBe(1);
        expect(customUpdate).not.toHaveBeenCalled();
    });

    test('exits 1 for an unknown command', async () => {
        await main(['node', 'spec-up-t', 'render']);
        expect(stderr.mock.calls[0][0]).toContain('Unknown command: render');
        expect(stderr.mock.calls[0][0]).toContain(HELP);
        expect(process.exitCode).toBe(1);
        expect(customUpdate).not.toHaveBeenCalled();
    });
});
