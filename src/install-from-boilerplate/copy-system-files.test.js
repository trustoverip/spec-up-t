const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const copySystemFiles = require('./copy-system-files');

describe('copySystemFiles', () => {
    let destRoot;

    beforeEach(() => {
        destRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-up-t-copy-system-'));
        fs.mkdirSync(path.join(destRoot, '.github', 'workflows'), { recursive: true });
        fs.mkdirSync(path.join(destRoot, 'assets'), { recursive: true });
        fs.writeFileSync(path.join(destRoot, '.github', 'workflows', 'render-specs.yml'), 'old-workflow\n');
        fs.writeFileSync(path.join(destRoot, '.github', 'workflows', 'repo-specific.yml'), 'keep-me\n');
        fs.writeFileSync(path.join(destRoot, '.github', 'workflows', 'set-gh-pages.yml'), 'stale-pages\n');
        fs.writeFileSync(path.join(destRoot, '.github', 'workflows', 'menu.yml'), 'stale-menu\n');
        fs.writeFileSync(path.join(destRoot, 'menu-wrapper.sh'), '#!/bin/bash\n');
        fs.writeFileSync(path.join(destRoot, 'assets', 'custom.css'), 'user-custom { color: red; }\n');
    });

    afterEach(() => {
        fs.rmSync(destRoot, { recursive: true, force: true });
    });

    test('replaces known workflow files, removes stale ones, and leaves extra workflows', () => {
        copySystemFiles(destRoot);

        const workflowsDir = path.join(destRoot, '.github', 'workflows');
        const workflowFiles = fs.readdirSync(workflowsDir).sort();

        expect(workflowFiles).toEqual([
            'menu.yml',
            'render-and-deploy.yml',
            'render-specs.yml',
            'repo-specific.yml',
            'zenodo-update.yml',
        ]);
        expect(fs.readFileSync(path.join(workflowsDir, 'render-specs.yml'), 'utf8')).toBe('old-workflow\n');
        expect(fs.readFileSync(path.join(workflowsDir, 'repo-specific.yml'), 'utf8')).toBe('keep-me\n');
        expect(fs.existsSync(path.join(workflowsDir, 'set-gh-pages.yml'))).toBe(false);
        const menu = fs.readFileSync(path.join(workflowsDir, 'menu.yml'), 'utf8');
        expect(menu).not.toBe('stale-menu\n');
        expect(menu).toContain("node-version: '24'");
        expect(menu).toContain('- custom-update');
        expect(menu).toContain('npm run custom-update -- --yes');
        expect(fs.readFileSync(path.join(workflowsDir, 'render-and-deploy.yml'), 'utf8')).toContain('actions/checkout@v6');

        expect(fs.existsSync(path.join(destRoot, 'menu-wrapper.sh'))).toBe(false);
        expect(fs.existsSync(path.join(destRoot, 'menu-wrapper.js'))).toBe(true);
        expect(fs.existsSync(path.join(destRoot, 'README.md'))).toBe(true);
        expect(fs.readFileSync(path.join(destRoot, 'assets', 'custom.css'), 'utf8')).toBe('user-custom { color: red; }\n');
    });

    test('does not overwrite an existing README.md', () => {
        fs.writeFileSync(path.join(destRoot, 'README.md'), '# Spec README\n');

        copySystemFiles(destRoot);

        expect(fs.readFileSync(path.join(destRoot, 'README.md'), 'utf8')).toBe('# Spec README\n');
    });

    test('creates .github/workflows when the directory is missing', () => {
        fs.rmSync(path.join(destRoot, '.github'), { recursive: true, force: true });

        copySystemFiles(destRoot);

        const menuPath = path.join(destRoot, '.github', 'workflows', 'menu.yml');
        expect(fs.existsSync(menuPath)).toBe(true);
        expect(fs.readFileSync(menuPath, 'utf8')).toContain('npm run custom-update -- --yes');
    });
});
