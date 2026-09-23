/**
 * @file custom-update.js
 * @description Upgrade a consuming Spec-Up-T repository in place.
 *
 * This is not a postinstall hook. First-time install is install.js.
 * This file runs only when it is the process entry:
 *   - npm run custom-update  →  spec-up-t custom-update  (local bin)
 *   - npx spec-up-t@latest custom-update
 *   - node path/to/custom-update.js
 *
 * Requiring it does not run the update. The 1.x / 2.0.0 script
 *   node -e "require('spec-up-t/src/install-from-boilerplate/custom-update.js')"
 * is a failed no-op: it prints the repair command and sets exit code 1.
 * Repair (also the 1.x → 2.1.0 path; 2.0.0 is not required):
 *   npx spec-up-t@latest custom-update
 *
 * The CLI requires this module and calls the export. Jest does the same.
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
const isLegacyEvalRequire = require('./is-legacy-eval-require');
const Logger = require('../utils/logger');

const LEGACY_REQUIRE_MESSAGE =
    'custom-update no longer runs from node -e require(). ' +
    'Run: npx spec-up-t@latest custom-update';

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

    // Install what was just written. Lives here so every real entry point
    // (local bin and `node path/to/custom-update.js`) installs once.
    // Do not also append `&& npm install` to the npm script.
    installConsumerDependencies();

    migrateAllSpecs();

    Logger.success('Custom update done');
}

if (require.main === module) {
    customUpdate().catch((error) => {
        Logger.error('Custom update failed:', error);
        process.exitCode = 1;
    });
} else if (isLegacyEvalRequire(require.main)) {
    Logger.error(LEGACY_REQUIRE_MESSAGE);
    process.exitCode = 1;
}

module.exports = customUpdate;
