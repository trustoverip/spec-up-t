jest.mock('./copy-system-files');
jest.mock('./build-custom-update-plan', () => ({
    buildCustomUpdatePlan: jest.fn(() => ({
        packageJson: 'present',
        scripts: [],
        files: { write: [], remove: [], leave: [], skip: [] },
        dependencies: [],
    })),
    formatCustomUpdatePlan: jest.fn(() => 'Custom update plan\n'),
}));
jest.mock('./add-scripts-keys');
jest.mock('./add-gitignore-entries', () => ({
    updateGitignore: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('./update-dependencies');
jest.mock('./install-consumer-dependencies');
jest.mock('./migrate-versions-to-snapshots');
jest.mock('./rename-docs-to-legacy');
jest.mock('../utils/logger', () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
}));

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const customUpdate = require('./custom-update');
const copySystemFiles = require('./copy-system-files');
const { buildCustomUpdatePlan, formatCustomUpdatePlan } = require('./build-custom-update-plan');
const addScriptsKeys = require('./add-scripts-keys');
const { updateGitignore } = require('./add-gitignore-entries');
const updateDependencies = require('./update-dependencies');
const installConsumerDependencies = require('./install-consumer-dependencies');
const migrateVersionsToSnapshots = require('./migrate-versions-to-snapshots');
const renameBuildDirToLegacy = require('./rename-docs-to-legacy');
const { configScriptsKeys, configOverwriteScriptsKeys } = require('./config-scripts-keys');
const Logger = require('../utils/logger');

const copySystemFilesCallsAtLoad = copySystemFiles.mock.calls.length;

describe('customUpdate', () => {
    let destRoot;
    let originalCwd;
    let stdout;

    beforeEach(() => {
        destRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-up-t-custom-update-'));
        originalCwd = process.cwd();
        process.chdir(destRoot);
        jest.clearAllMocks();
        stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
        copySystemFiles.mockReturnValue(undefined);
        addScriptsKeys.mockReturnValue(undefined);
        updateDependencies.mockResolvedValue(undefined);
        installConsumerDependencies.mockReturnValue(undefined);
        migrateVersionsToSnapshots.mockReturnValue(undefined);
        renameBuildDirToLegacy.mockReturnValue(undefined);
    });

    afterEach(() => {
        stdout.mockRestore();
        process.chdir(originalCwd);
        fs.rmSync(destRoot, { recursive: true, force: true });
    });

    test('does not auto-run when required from Jest', () => {
        expect(copySystemFilesCallsAtLoad).toBe(0);
    });

    test('runs steps in order and migrates every spec', async () => {
        fs.writeFileSync(path.join(destRoot, 'specs.json'), JSON.stringify({
            specs: [
                { output_path: './docs' },
                { output_path: './site' },
            ],
        }));

        await customUpdate({ yes: true });

        expect(formatCustomUpdatePlan).toHaveBeenCalledTimes(1);
        expect(stdout).toHaveBeenCalledWith('Custom update plan\n');
        expect(buildCustomUpdatePlan.mock.invocationCallOrder[0])
            .toBeLessThan(copySystemFiles.mock.invocationCallOrder[0]);
        expect(copySystemFiles).toHaveBeenCalledTimes(1);
        expect(addScriptsKeys).toHaveBeenCalledWith(configScriptsKeys, configOverwriteScriptsKeys);
        expect(updateGitignore).toHaveBeenCalledTimes(1);
        expect(updateDependencies).toHaveBeenCalledTimes(1);
        expect(installConsumerDependencies).toHaveBeenCalledTimes(1);
        expect(migrateVersionsToSnapshots.mock.calls).toEqual([['./docs'], ['./site']]);
        expect(renameBuildDirToLegacy.mock.calls).toEqual([['./docs'], ['./site']]);
        expect(Logger.success).toHaveBeenCalledWith('Custom update done');

        const addOrder = addScriptsKeys.mock.invocationCallOrder[0];
        const depsOrder = updateDependencies.mock.invocationCallOrder[0];
        const installOrder = installConsumerDependencies.mock.invocationCallOrder[0];
        expect(addOrder).toBeLessThan(depsOrder);
        expect(depsOrder).toBeLessThan(installOrder);
    });

    test('throws when specs.json is missing', async () => {
        await expect(customUpdate({ yes: true })).rejects.toThrow();
    });

    test('throws when specs.json has no specs', async () => {
        fs.writeFileSync(path.join(destRoot, 'specs.json'), JSON.stringify({ specs: [] }));
        await expect(customUpdate({ yes: true })).rejects.toThrow('specs.json has no specs array');
    });

    test('throws when a spec is missing output_path', async () => {
        fs.writeFileSync(path.join(destRoot, 'specs.json'), JSON.stringify({
            specs: [{ title: 'no-path' }],
        }));
        await expect(customUpdate({ yes: true })).rejects.toThrow('missing output_path');
    });

    test('dry-run prints the plan and does not write', async () => {
        await customUpdate({ dryRun: true, yes: true });

        expect(stdout).toHaveBeenCalledWith('Custom update plan\n');
        expect(stdout).toHaveBeenCalledWith('Dry run: no files were written.\n');
        expect(copySystemFiles).not.toHaveBeenCalled();
        expect(addScriptsKeys).not.toHaveBeenCalled();
        expect(updateDependencies).not.toHaveBeenCalled();
        expect(installConsumerDependencies).not.toHaveBeenCalled();
        expect(Logger.success).not.toHaveBeenCalledWith('Custom update done');
    });

    test('refuses to write without --yes when there is no terminal', async () => {
        await expect(customUpdate()).rejects.toThrow('Refusing to write without --yes');
        expect(stdout).toHaveBeenCalledWith('Custom update plan\n');
        expect(copySystemFiles).not.toHaveBeenCalled();
    });

    test('does not write when the prompt is declined', async () => {
        await customUpdate({ confirm: async () => false });

        expect(stdout).toHaveBeenCalledWith('Aborted. No files were written.\n');
        expect(copySystemFiles).not.toHaveBeenCalled();
        expect(Logger.success).not.toHaveBeenCalledWith('Custom update done');
    });

    test('does not write when the plan says package.json is missing', async () => {
        buildCustomUpdatePlan.mockReturnValueOnce({
            packageJson: 'missing',
            scripts: [],
            files: { write: [], remove: [], leave: [], skip: [] },
            dependencies: [],
            gitignore: [],
            specs: { status: 'missing', items: [] },
        });

        await expect(customUpdate({ yes: true })).rejects.toThrow('package.json not found');
        expect(stdout).toHaveBeenCalledWith('Custom update plan\n');
        expect(copySystemFiles).not.toHaveBeenCalled();
        expect(installConsumerDependencies).not.toHaveBeenCalled();
    });

    test('writes when the prompt is accepted', async () => {
        fs.writeFileSync(path.join(destRoot, 'specs.json'), JSON.stringify({
            specs: [{ output_path: './docs' }],
        }));

        await customUpdate({ confirm: async () => true });

        expect(copySystemFiles).toHaveBeenCalledTimes(1);
        expect(Logger.success).toHaveBeenCalledWith('Custom update done');
    });
});
