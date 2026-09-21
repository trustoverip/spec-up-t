/**
 * @file custom-update.js
 * @description Upgrade a consuming Spec-Up-T repository in place.
 *
 * This is not a postinstall hook. First-time install is install.js.
 * This file is invoked later by:
 *   - existing scripts: node -e "require('spec-up-t/src/install-from-boilerplate/custom-update.js')"
 *   - npm run custom-update (after 2.0.0 rewrites the script)
 *   - npx spec-up-t@2 custom-update
 *   - node path/to/custom-update.js
 *
 * 2.0.0 still auto-runs on require() from `node -e` so GitHubUi / old
 * package.json scripts keep working. The CLI requires this module without
 * auto-running, then calls the exported function.
 */

const fs = require('fs-extra');
const { configScriptsKeys, configOverwriteScriptsKeys } = require('./config-scripts-keys');
const addScriptsKeys = require('./add-scripts-keys');
const copySystemFiles = require('./copy-system-files');
const { gitIgnoreEntries } = require('./config-gitignore-entries');
const { updateGitignore } = require('./add-gitignore-entries');
const updateDependencies = require('./update-dependencies');
const installConsumerDependencies = require('./install-consumer-dependencies');
const migrateVersionsToSnapshots = require('./migrate-versions-to-snapshots');
const renameBuildDirToLegacy = require('./rename-docs-to-legacy');
const shouldAutoRunCustomUpdate = require('./should-auto-run-custom-update');
const Logger = require('../utils/logger');

/**
 * Migrates snapshots and tracked build dirs for every spec in specs.json.
 * @throws {Error} When specs.json is missing, unreadable, or has no specs.
 */
function migrateAllSpecs() {
    const config = fs.readJsonSync('specs.json');
    const specs = config && Array.isArray(config.specs) ? config.specs : [];

    if (specs.length === 0) {
        throw new Error('specs.json has no specs array');
    }

    for (const spec of specs) {
        if (!spec || !spec.output_path) {
            throw new Error('A spec in specs.json is missing output_path');
        }
        migrateVersionsToSnapshots(spec.output_path);
        renameBuildDirToLegacy(spec.output_path);
    }
}

/**
 * Runs the in-place upgrade of the consuming repository (process.cwd()).
 */
async function customUpdate() {
    // Copy/replace boilerplate system files, replace workflows 1:1, and
    // remove stale files (e.g. menu-wrapper.sh) before touching package.json.
    copySystemFiles();

    // Must complete before updateDependencies — both write package.json.
    addScriptsKeys(configScriptsKeys, configOverwriteScriptsKeys);

    await updateGitignore(gitIgnoreEntries.gitignorePath, gitIgnoreEntries.filesToAdd);

    await updateDependencies();

    // Install what was just written. Must live in this function (not only in
    // the npm-script string) so the first 2.0.0 run via node -e require()
    // still installs.
    installConsumerDependencies();

    migrateAllSpecs();

    Logger.success('Custom update done');
}

if (shouldAutoRunCustomUpdate(require.main, module, process.env)) {
    customUpdate().catch((error) => {
        Logger.error('Custom update failed:', error);
        process.exitCode = 1;
    });
}

module.exports = customUpdate;
