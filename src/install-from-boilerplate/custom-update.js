const fs = require('fs-extra');
const { configScriptsKeys } = require('./config-scripts-keys');
const { configOverwriteScriptsKeys } = require('./config-scripts-keys');
const addScriptsKeys = require('./add-scripts-keys');
const copySystemFiles = require('./copy-system-files');
const { gitIgnoreEntries } = require('./config-gitignore-entries');
const { updateGitignore } = require('./add-gitignore-entries');
const updateDependencies = require('./update-dependencies');
const migrateVersionsToSpecVersions = require('./migrate-versions-to-spec-versions');
const Logger = require('../utils/logger');


addScriptsKeys(configScriptsKeys, configOverwriteScriptsKeys);
copySystemFiles();
updateGitignore(gitIgnoreEntries.gitignorePath, gitIgnoreEntries.filesToAdd);

// We can use this file to do any custom updates during post-install.
const customUpdate = () => {
    // Update dependencies based on package.spec-up-t.json
    updateDependencies();

    // One-time migration: repos that stored snapshots in docs/versions/ (the old
    // "commit docs/" regime) need their snapshots moved to spec-versions/ so they
    // survive after docs/ is removed from git tracking. Safe to run on every
    // custom-update — already-migrated versions are not overwritten.
    try {
        const config = fs.readJsonSync('specs.json');
        const outputPath = config.specs[0].output_path;
        migrateVersionsToSpecVersions(outputPath);
    } catch (error) {
        // specs.json missing or malformed — skip migration silently.
        Logger.info('Skipping versions migration: could not read specs.json');
    }
}

// Call custom update
customUpdate();

Logger.success("Custom update done");