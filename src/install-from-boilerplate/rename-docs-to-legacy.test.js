jest.mock('child_process', () => ({
    execSync: jest.fn(),
}));

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execSync } = require('child_process');
const renameBuildDirToLegacy = require('./rename-docs-to-legacy');

describe('renameBuildDirToLegacy', () => {
    let destRoot;
    let originalCwd;

    beforeEach(() => {
        destRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-up-t-rename-'));
        originalCwd = process.cwd();
        process.chdir(destRoot);
        execSync.mockReset();
    });

    afterEach(() => {
        process.chdir(originalCwd);
        fs.rmSync(destRoot, { recursive: true, force: true });
    });

    test('skips when the legacy directory already exists', () => {
        fs.mkdirSync(path.join(destRoot, 'docs-legacy'));
        renameBuildDirToLegacy('./docs');
        expect(execSync).not.toHaveBeenCalled();
    });

    test('skips when the directory is not tracked', () => {
        execSync.mockReturnValue('');
        renameBuildDirToLegacy('docs');
        expect(execSync).toHaveBeenCalledTimes(1);
        expect(execSync.mock.calls[0][0]).toContain('git ls-files');
        expect(execSync.mock.calls.some((call) => String(call[0]).includes('git commit'))).toBe(false);
        expect(execSync.mock.calls.some((call) => String(call[0]).includes('git mv'))).toBe(false);
    });

    test('git mv without git commit when the directory is tracked', () => {
        execSync.mockImplementation((command) => {
            if (String(command).includes('git ls-files')) {
                return 'docs/index.html\n';
            }
            return '';
        });

        renameBuildDirToLegacy('./docs');

        const commands = execSync.mock.calls.map((call) => String(call[0]));
        expect(commands.some((command) => command.includes('git mv'))).toBe(true);
        expect(commands.some((command) => command.includes('git commit'))).toBe(false);
    });

    test('does not git commit when git mv fails', () => {
        execSync.mockImplementation((command) => {
            if (String(command).includes('git ls-files')) {
                return 'docs/index.html\n';
            }
            throw new Error('mv failed');
        });

        renameBuildDirToLegacy('docs');

        const commands = execSync.mock.calls.map((call) => String(call[0]));
        expect(commands.some((command) => command.includes('git commit'))).toBe(false);
    });
});
