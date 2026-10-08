const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { diffGitignore, updateGitignore } = require('./add-gitignore-entries');
const { gitIgnoreEntries } = require('./config-gitignore-entries');

describe('diffGitignore', () => {
    test('replaces a bare .env* with rules that keep .env.example', () => {
        const diff = diffGitignore('.env*\n', gitIgnoreEntries);

        expect(diff.remove).toEqual(['.env*']);
        expect(diff.add).toEqual(expect.arrayContaining(['.env', '.env.*', '!.env.example']));
        expect(diff.content).not.toMatch(/^\.env\*$/m);

        const envBlock = diff.content.split('\n').filter((line) => (
            line === '.env' || line === '.env.*' || line === '!.env.example'
        ));
        expect(envBlock).toEqual(['.env', '.env.*', '!.env.example']);
    });

    test('does not re-add env rules that are already in the right order', () => {
        const content = '.env\n.env.*\n!.env.example\n';
        const diff = diffGitignore(content, {
            filesToAdd: ['.env', '.env.*', '!.env.example'],
            filesToRemove: ['.env*'],
        });

        expect(diff.add).toEqual([]);
        expect(diff.remove).toEqual([]);
        expect(diff.move).toEqual([]);
        expect(diff.content).toBe(content);
    });
});

describe('updateGitignore', () => {
    let destRoot;

    beforeEach(() => {
        destRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-up-t-gitignore-'));
    });

    afterEach(() => {
        fs.rmSync(destRoot, { recursive: true, force: true });
    });

    test('writes the repaired env rules', async () => {
        const gitignorePath = path.join(destRoot, '.gitignore');
        fs.writeFileSync(gitignorePath, '.env\n.env.*\n!.env.example\n.env*\n');

        await updateGitignore(
            gitignorePath,
            ['.env', '.env.*', '!.env.example'],
            ['.env*'],
        );

        expect(fs.readFileSync(gitignorePath, 'utf8')).toBe('.env\n.env.*\n!.env.example\n');
    });
});
