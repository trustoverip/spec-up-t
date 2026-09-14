const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const addScriptsKeys = require('./add-scripts-keys');
const { configScriptsKeys, configOverwriteScriptsKeys } = require('./config-scripts-keys');

describe('addScriptsKeys', () => {
    let destRoot;
    let originalCwd;

    beforeEach(() => {
        destRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-up-t-scripts-'));
        originalCwd = process.cwd();
        fs.writeFileSync(path.join(destRoot, 'package.json'), JSON.stringify({
            name: 'consumer',
            scripts: {
                menu: 'bash ./menu-wrapper.sh',
                help: 'cat ./node_modules/spec-up-t/src/install-from-boilerplate/help.txt',
                render: 'node --no-warnings -e "require(\'spec-up-t/index.js\')({ nowatch: true })"',
            },
        }, null, 2));
        process.chdir(destRoot);
    });

    afterEach(() => {
        process.chdir(originalCwd);
        fs.rmSync(destRoot, { recursive: true, force: true });
    });

    test('overwrites menu and help to node commands', () => {
        addScriptsKeys(configScriptsKeys, configOverwriteScriptsKeys);

        const packageJson = JSON.parse(fs.readFileSync(path.join(destRoot, 'package.json'), 'utf8'));
        expect(packageJson.scripts.menu).toBe('node ./menu-wrapper.js');
        expect(packageJson.scripts.help).toMatch(/^node /);
        expect(packageJson.scripts.help).not.toMatch(/^cat /);
    });
});
