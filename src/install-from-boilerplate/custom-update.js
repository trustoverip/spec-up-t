const fs = require('fs-extra');
const { configScriptsKeys, configOverwriteScriptsKeys } = require('./config-scripts-keys');
const addScriptsKeys = require('./add-scripts-keys');
const copySystemFiles = require('./copy-system-files');
const { gitIgnoreEntries } = require('./config-gitignore-entries');
const { updateGitignore } = require('./add-gitignore-entries');
const updateDependencies = require('./update-dependencies');
const migrateVersionsToSnapshots = require('./migrate-versions-to-snapshots');
const renameBuildDirToLegacy = require('./rename-docs-to-legacy');
const Logger = require('../utils/logger');


// We can use this file to do any custom updates during post-install.
const customUpdate = async () => {
    // Copy/replace boilerplate system files, replace workflows 1:1, and
    // remove stale files (e.g. menu-wrapper.sh) before touching package.json.
    copySystemFiles();

    // Must complete before updateDependencies — both write package.json.
    addScriptsKeys(configScriptsKeys, configOverwriteScriptsKeys);

    await updateGitignore(gitIgnoreEntries.gitignorePath, gitIgnoreEntries.filesToAdd);

    // Update dependencies based on package.spec-up-t.json
    await updateDependencies();

    // One-time migration: repos that stored snapshots in docs/versions/ (the old
    // "commit docs/" regime) need their snapshots moved to snapshots/ so they
    // survive after docs/ is removed from git tracking. Safe to run on every
    // custom-update — already-migrated versions are not overwritten.
    try {
        const config = fs.readJsonSync('specs.json');
        const outputPath = config.specs[0].output_path;
        migrateVersionsToSnapshots(outputPath);
        renameBuildDirToLegacy(outputPath);
    } catch (error) {
        // specs.json missing or malformed — skip migration silently.
        Logger.info('Skipping versions migration: could not read specs.json');
    }
}

customUpdate()
    .then(() => Logger.success("Custom update done"))
    .catch((error) => Logger.error('Custom update failed:', error));
