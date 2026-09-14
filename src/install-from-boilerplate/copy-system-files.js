const fs = require('fs-extra');
const path = require('node:path');
const {
    systemFiles,
    systemDirsReplace,
    systemFilesNoOverwrite,
    systemFilesToRemove,
} = require('./config-system-files.js');
const Logger = require('../utils/logger');

/**
 * Copies a single boilerplate file to the consuming project.
 */
function copySingleFile(sourceDir, destRoot, item) {
    const srcPath = path.join(sourceDir, item);
    const destPath = path.join(destRoot, item);
    fs.cpSync(srcPath, destPath, { recursive: true });
    Logger.success(`Copied ${item} to ${destPath}`);
}

/**
 * Replaces a directory in the consuming project with the boilerplate version.
 * Extra files that are not in the boilerplate are removed.
 */
function replaceDir(sourceDir, destRoot, item) {
    const srcPath = path.join(sourceDir, item);
    const destPath = path.join(destRoot, item);

    if (!fs.existsSync(srcPath)) {
        Logger.error(`Boilerplate directory not found: ${item}`);
        return;
    }

    fs.rmSync(destPath, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.cpSync(srcPath, destPath, { recursive: true });
    Logger.success(`Replaced ${item} with boilerplate copy`);
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
 * Files in `systemFiles` are copied recursively and can be safely overwritten.
 * Directories in `systemDirsReplace` are replaced 1:1 (extras are removed).
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

    for (const item of systemDirsReplace) {
        try {
            replaceDir(sourceDir, destRoot, item);
        } catch (error) {
            Logger.error(`Failed to replace ${item}:`, error);
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
