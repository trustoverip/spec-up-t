jest.mock('node:child_process', () => ({
    spawnSync: jest.fn(),
}));

const { spawnSync } = require('node:child_process');
const installConsumerDependencies = require('./install-consumer-dependencies');

describe('installConsumerDependencies', () => {
    beforeEach(() => {
        spawnSync.mockReset();
    });

    test('runs npm install in the given cwd', () => {
        spawnSync.mockReturnValue({ status: 0 });
        installConsumerDependencies('/tmp/consumer');
        expect(spawnSync).toHaveBeenCalledWith('npm', ['install'], expect.objectContaining({
            cwd: '/tmp/consumer',
            stdio: 'inherit',
        }));
    });

    test('throws when npm install fails', () => {
        spawnSync.mockReturnValue({ status: 1 });
        expect(() => installConsumerDependencies()).toThrow('npm install failed with exit code 1');
    });

    test('throws when spawn fails to start', () => {
        spawnSync.mockReturnValue({ error: new Error('ENOENT') });
        expect(() => installConsumerDependencies()).toThrow('ENOENT');
    });
});
