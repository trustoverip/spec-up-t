const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const updateDependencies = require('./update-dependencies');
const { loadCanonicalDependencies } = require('./update-dependencies');

describe('updateDependencies', () => {
    let destRoot;
    let originalCwd;

    beforeEach(() => {
        destRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-up-t-deps-'));
        originalCwd = process.cwd();
        process.chdir(destRoot);
    });

    afterEach(() => {
        process.chdir(originalCwd);
        fs.rmSync(destRoot, { recursive: true, force: true });
    });

    test('pins spec-up-t to this package version and writes dotenv', async () => {
        const self = require('../../package.json');
        fs.writeFileSync(path.join(destRoot, 'package.json'), JSON.stringify({
            name: 'consumer',
            dependencies: {
                'spec-up-t': '1.9.0',
            },
        }, null, 2));

        await updateDependencies();

        const consumer = JSON.parse(fs.readFileSync(path.join(destRoot, 'package.json'), 'utf8'));
        expect(consumer.dependencies['spec-up-t']).toBe(self.version);
        expect(consumer.dependencies.dotenv).toBe(loadCanonicalDependencies().dotenv);
    });

    test('creates a dependencies object when it is missing', async () => {
        fs.writeFileSync(path.join(destRoot, 'package.json'), JSON.stringify({
            name: 'consumer',
        }, null, 2));

        await updateDependencies();

        const consumer = JSON.parse(fs.readFileSync(path.join(destRoot, 'package.json'), 'utf8'));
        expect(consumer.dependencies['spec-up-t']).toBe(require('../../package.json').version);
        expect(consumer.dependencies.dotenv).toBeDefined();
    });

    test('throws when package.json is missing', async () => {
        await expect(updateDependencies()).rejects.toThrow('package.json not found');
    });

    test('is a no-op write when versions already match', async () => {
        const canonical = loadCanonicalDependencies();
        fs.writeFileSync(path.join(destRoot, 'package.json'), JSON.stringify({
            name: 'consumer',
            dependencies: canonical,
        }, null, 2) + '\n');

        await updateDependencies();

        expect(fs.readFileSync(path.join(destRoot, 'package.json'), 'utf8')).toBe(
            JSON.stringify({ name: 'consumer', dependencies: canonical }, null, 2) + '\n'
        );
    });
});
