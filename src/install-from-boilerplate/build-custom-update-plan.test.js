const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildCustomUpdatePlan, formatCustomUpdatePlan } = require('./build-custom-update-plan');
const customUpdate = require('./custom-update');
const { configScriptsKeys } = require('./config-scripts-keys');

describe('buildCustomUpdatePlan', () => {
    let destRoot;

    beforeEach(() => {
        destRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-up-t-plan-'));
        fs.mkdirSync(path.join(destRoot, '.github', 'workflows'), { recursive: true });
        fs.mkdirSync(path.join(destRoot, 'assets'), { recursive: true });
        fs.writeFileSync(path.join(destRoot, '.github', 'workflows', 'menu.yml'), 'stale-menu\n');
        fs.writeFileSync(path.join(destRoot, '.github', 'workflows', 'repo-specific.yml'), 'keep-me\n');
        fs.mkdirSync(path.join(destRoot, '.github', 'workflows', 'helpers'));
        fs.writeFileSync(path.join(destRoot, '.github', 'workflows', 'set-gh-pages.yml'), 'stale-pages\n');
        fs.writeFileSync(path.join(destRoot, 'menu-wrapper.sh'), '#!/bin/bash\n');
        fs.writeFileSync(path.join(destRoot, 'README.md'), '# Spec README\n');
        fs.writeFileSync(path.join(destRoot, 'assets', 'custom.css'), 'user-custom { color: red; }\n');
        fs.writeFileSync(path.join(destRoot, 'package.json'), JSON.stringify({
            name: 'consumer',
            scripts: {
                render: configScriptsKeys.render,
                'custom-update': 'npm update && node -e "require(\'spec-up-t/src/install-from-boilerplate/custom-update.js\')"',
            },
            dependencies: {
                'spec-up-t': '1.9.0',
            },
        }, null, 2));
    });

    afterEach(() => {
        fs.rmSync(destRoot, { recursive: true, force: true });
    });

    test('plans script, file, and dependency changes and leaves extra workflows', () => {
        const self = require('../../package.json');
        const plan = buildCustomUpdatePlan(destRoot);

        expect(plan.scripts).toEqual(expect.arrayContaining([
            expect.objectContaining({
                key: 'custom-update',
                from: 'npm update && node -e "require(\'spec-up-t/src/install-from-boilerplate/custom-update.js\')"',
                to: 'spec-up-t custom-update',
            }),
        ]));
        expect(plan.scripts.map((change) => change.key)).not.toContain('render');

        expect(plan.files.write).toEqual(expect.arrayContaining([
            { action: 'add', path: '.github/workflows/render-and-deploy.yml' },
            { action: 'add', path: '.github/workflows/zenodo-update.yml' },
        ]));
        expect(plan.files.write.map((item) => item.path)).not.toContain('.github/workflows/menu.yml');
        expect(plan.files.keep).toEqual(['.github/workflows/menu.yml']);
        expect(plan.files.remove).toEqual(expect.arrayContaining([
            'menu-wrapper.sh',
            '.github/workflows/set-gh-pages.yml',
        ]));
        expect(plan.files.leave).toEqual([
            '.github/workflows/helpers',
            '.github/workflows/repo-specific.yml',
        ]);
        expect(plan.files.skip).toEqual(['README.md', 'assets/custom.css']);

        expect(plan.dependencies).toEqual(expect.arrayContaining([
            { name: 'spec-up-t', from: '1.9.0', to: self.version },
            expect.objectContaining({ name: 'dotenv', from: '(not set)' }),
        ]));

        const text = formatCustomUpdatePlan(plan);
        expect(text).toContain('Custom update plan');
        expect(text).toContain('Scripts:');
        expect(text).toContain('custom-update');
        expect(text).toContain('Files:');
        expect(text).toContain('keep    .github/workflows/menu.yml');
        expect(text).toContain('Re-run with --force-workflows to replace them.');
        expect(text).toContain('leave   .github/workflows/repo-specific.yml');
        expect(text).toContain('remove  .github/workflows/set-gh-pages.yml');
        expect(text).toContain('Dependencies:');
        expect(text).toContain(`spec-up-t  1.9.0 -> ${self.version}`);
        expect(plan.gitignore.add).toEqual(expect.arrayContaining(['docs/', 'node_modules/', '.env', '.env.*', '!.env.example']));
        expect(plan.gitignore.add).not.toContain('.env*');
        expect(plan.specs).toEqual({ status: 'missing', items: [] });
        expect(text).toContain('Gitignore:');
        expect(text).toContain('add     docs/');
        expect(text).toContain('npm install:\n  npm install');
        expect(text).toContain('Specs:\n  (specs.json not found)');
    });

    test('lists new gitignore patterns and snapshot copies, and skips ones already present', () => {
        fs.writeFileSync(path.join(destRoot, '.gitignore'), 'node_modules/  # installed\n');
        fs.mkdirSync(path.join(destRoot, 'docs', 'versions', 'v1'), { recursive: true });
        fs.mkdirSync(path.join(destRoot, 'docs', 'versions', 'v2'), { recursive: true });
        fs.mkdirSync(path.join(destRoot, 'snapshots', 'v2'), { recursive: true });
        fs.writeFileSync(path.join(destRoot, 'specs.json'), JSON.stringify({
            specs: [{ output_path: './docs' }],
        }));

        const plan = buildCustomUpdatePlan(destRoot);
        const text = formatCustomUpdatePlan(plan);

        expect(plan.gitignore.add).toContain('docs/');
        expect(plan.gitignore.add).not.toContain('node_modules/');
        expect(plan.gitignore.remove).toEqual([]);
        expect(plan.specs).toEqual({
            status: 'present',
            items: [{
                outputPath: './docs',
                actions: ['copy docs/versions/v1 -> snapshots/v1'],
            }],
        });
        expect(text).toContain('copy docs/versions/v1 -> snapshots/v1');
        expect(text).not.toContain('snapshots/v2');
    });

    test('drops a trailing .env* so it cannot override !.env.example', () => {
        fs.writeFileSync(path.join(destRoot, '.gitignore'), [
            '.env',
            '.env.*',
            '!.env.example',
            'docs/',
            'node_modules/',
            '.env*  # old custom-update entry',
            '',
        ].join('\n'));

        const plan = buildCustomUpdatePlan(destRoot);
        const text = formatCustomUpdatePlan(plan);

        expect(plan.gitignore.remove).toEqual(['.env*']);
        expect(plan.gitignore.move).toEqual([]);
        expect(plan.gitignore.add).not.toContain('.env');
        expect(plan.gitignore.add).not.toContain('.env.*');
        expect(plan.gitignore.add).not.toContain('!.env.example');
        expect(text).toContain('remove  .env*');
        expect(text).not.toContain('add     .env*');
    });

    test('moves !.env.example below a later .env.*', () => {
        fs.writeFileSync(path.join(destRoot, '.gitignore'), '!.env.example\n.env.*\n');

        const plan = buildCustomUpdatePlan(destRoot);
        const text = formatCustomUpdatePlan(plan);

        expect(plan.gitignore.move).toEqual(['!.env.example']);
        expect(plan.gitignore.add).not.toContain('!.env.example');
        expect(text).toContain('move    !.env.example');
    });

    test('does not write when package.json is missing', async () => {
        fs.rmSync(path.join(destRoot, 'package.json'));
        const originalCwd = process.cwd();
        process.chdir(destRoot);
        try {
            await expect(customUpdate({ yes: true })).rejects.toThrow(
                'package.json not found. custom-update did not write any files.'
            );
        } finally {
            process.chdir(originalCwd);
        }

        expect(fs.existsSync(path.join(destRoot, 'menu-wrapper.js'))).toBe(false);
        expect(fs.existsSync(path.join(destRoot, '.github', 'workflows', 'set-gh-pages.yml'))).toBe(true);
    });

    test('omits a workflow file whose bytes already match the boilerplate', () => {
        const boilerplateMenu = path.join(__dirname, 'boilerplate', '.github', 'workflows', 'menu.yml');
        fs.copyFileSync(boilerplateMenu, path.join(destRoot, '.github', 'workflows', 'menu.yml'));

        const plan = buildCustomUpdatePlan(destRoot);

        expect(plan.files.write.map((item) => item.path)).not.toContain('.github/workflows/menu.yml');
        expect(plan.files.keep).not.toContain('.github/workflows/menu.yml');
    });

    test('replaces a differing workflow when forceWorkflows is set', () => {
        const plan = buildCustomUpdatePlan(destRoot, { forceWorkflows: true });
        const text = formatCustomUpdatePlan(plan);

        expect(plan.files.keep).toEqual([]);
        expect(plan.files.write).toEqual(expect.arrayContaining([
            { action: 'replace', path: '.github/workflows/menu.yml' },
        ]));
        expect(text).toContain('replace .github/workflows/menu.yml');
        expect(text).not.toContain('--force-workflows');
    });

    test('reports a missing package.json without throwing', () => {
        fs.rmSync(path.join(destRoot, 'package.json'));

        const plan = buildCustomUpdatePlan(destRoot);
        const text = formatCustomUpdatePlan(plan);

        expect(plan.packageJson).toBe('missing');
        expect(plan.scripts).toEqual([]);
        expect(plan.dependencies).toEqual([]);
        expect(text).toContain('Scripts:\n  (package.json not found)');
        expect(text).toContain('Dependencies:\n  (package.json not found)');
    });

    test('throws when package.json is not valid JSON', () => {
        fs.writeFileSync(path.join(destRoot, 'package.json'), '{');
        expect(() => buildCustomUpdatePlan(destRoot)).toThrow('Cannot read package.json');
    });

    test('dry-run prints the plan and leaves the repo unchanged', async () => {
        const originalCwd = process.cwd();
        const packagePath = path.join(destRoot, 'package.json');
        const menuPath = path.join(destRoot, '.github', 'workflows', 'menu.yml');
        const stalePath = path.join(destRoot, '.github', 'workflows', 'set-gh-pages.yml');
        const packageBefore = fs.readFileSync(packagePath);
        const menuBefore = fs.readFileSync(menuPath);

        process.chdir(destRoot);
        try {
            await customUpdate({ dryRun: true });
        } finally {
            process.chdir(originalCwd);
        }

        expect(fs.readFileSync(packagePath)).toEqual(packageBefore);
        expect(fs.readFileSync(menuPath)).toEqual(menuBefore);
        expect(fs.existsSync(stalePath)).toBe(true);
        expect(fs.existsSync(path.join(destRoot, 'menu-wrapper.sh'))).toBe(true);
    });
});
