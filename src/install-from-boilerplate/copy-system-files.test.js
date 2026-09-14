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
        fs.writeFileSync(path.join(destRoot, '.github', 'workflows', 'menu.yml'), 'stale-menu\n');
        fs.writeFileSync(path.join(destRoot, 'menu-wrapper.sh'), '#!/bin/bash\n');
        fs.writeFileSync(path.join(destRoot, 'assets', 'custom.css'), 'user-custom { color: red; }\n');
    });

    afterEach(() => {
        fs.rmSync(destRoot, { recursive: true, force: true });
    });

    test('replaces GitHub workflows 1:1 with the boilerplate and removes stale files', () => {
        copySystemFiles(destRoot);

        const workflowsDir = path.join(destRoot, '.github', 'workflows');
        const workflowFiles = fs.readdirSync(workflowsDir).sort();

        expect(workflowFiles).toEqual([
            'menu.yml',
            'render-and-deploy.yml',
            'set-gh-pages.yml',
            'zenodo-update.yml',
        ]);
        expect(fs.existsSync(path.join(workflowsDir, 'render-specs.yml'))).toBe(false);
        expect(fs.readFileSync(path.join(workflowsDir, 'menu.yml'), 'utf8')).not.toBe('stale-menu\n');

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
});
