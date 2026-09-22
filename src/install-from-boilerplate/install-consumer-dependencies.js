const { spawnSync } = require('node:child_process');
const Logger = require('../utils/logger');

/**
 * Installs the consuming repo's dependencies after package.json was rewritten.
 * Uses the caller's PATH so nvm / fnm / Windows npm.cmd keep working.
 *
 * @param {string} [cwd=process.cwd()] - Consuming project root.
 */
function installConsumerDependencies(cwd = process.cwd()) {
    Logger.info('Installing updated dependencies...');

    const result = spawnSync('npm', ['install'], {
        cwd,
        stdio: 'inherit',
        env: process.env,
        shell: process.platform === 'win32'
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(`npm install failed with exit code ${result.status}`);
    }

    Logger.success('Dependencies installed');
}

module.exports = installConsumerDependencies;
