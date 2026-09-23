const fs = require('fs-extra');
const path = require('node:path');
const {
    systemFiles,
    systemFilesNoOverwrite,
    systemFilesToRemove,
} = require('./config-system-files.js');
const Logger = require('../utils/logger');

/**
 * Copies a single boilerplate file to the consuming project.
 * Parent directories are created when the destination tree is missing.
 */
function copySingleFile(sourceDir, destRoot, item) {
    const srcPath = path.join(sourceDir, item);
    const destPath = path.join(destRoot, item);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.cpSync(srcPath, destPath, { recursive: true });
    Logger.success(`Copied ${item} to ${destPath}`);
}

/**
 * Removes stale files left over from previous boilerplate versions.
 */
function removeStaleFiles(destRoot, files) {
    for (const item of files) {
        const destPath = path.join(destRoot, item);
        if (!fs.existsSync(destPath)) {
            continue;
        }
        fs.rmSync(destPath, { force: true });
        Logger.success(`Removed stale file ${item}`);
    }
}

/**
 * Copies system files from the boilerplate directory to the root of the project.
 * System files are defined in the `config-system-files.js` file.
 * Files in `systemFiles` are copied and can be safely overwritten. Workflow
 * files are individual entries, so extra workflows in the consuming repo stay.
 * Files in `systemFilesNoOverwrite` are only copied when they do not already
 * exist, so user customisations are preserved across updates.
 * Files in `systemFilesToRemove` are deleted from the consuming project.
 */
function copySystemFiles(destRoot = process.cwd()) {
    const sourceDir = path.join(__dirname, './', 'boilerplate');

    for (const item of systemFiles) {
        try {
            copySingleFile(sourceDir, destRoot, item);
        } catch (error) {
            Logger.error(`Failed to copy ${item}:`, error);
        }
    }

    for (const item of systemFilesNoOverwrite) {
        const destPath = path.join(destRoot, item);
        if (fs.existsSync(destPath)) {
            Logger.info(`Skipped ${item} (already exists)`);
            continue;
        }
        try {
            copySingleFile(sourceDir, destRoot, item);
        } catch (error) {
            Logger.error(`Failed to copy ${item}:`, error);
        }
    }

    removeStaleFiles(destRoot, systemFilesToRemove);

    Logger.success('Copied system files to current directory');
}

module.exports = copySystemFiles;
