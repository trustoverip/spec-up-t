const fs = require('fs-extra');
const path = require('node:path');
const { systemFiles, systemFilesNoOverwrite } = require('./config-system-files.js');
const Logger = require('../utils/logger');

/**
 * Copies a single boilerplate file to the consuming project.
 */
function copySingleFile(sourceDir, item) {
    const srcPath = path.join(sourceDir, item);
    const destPath = path.join(process.cwd(), item);
    fs.cpSync(srcPath, destPath, { recursive: true });
    Logger.success(`Copied ${item} to ${destPath}`);
}

/**
 * Copies system files from the boilerplate directory to the root of the project.
 * System files are defined in the `config-system-files.js` file.
 * Files in `systemFiles` are copied recursively and can be safely overwritten.
 * Files in `systemFilesNoOverwrite` are only copied when they do not already
 * exist, so user customisations are preserved across updates.
 */
function copySystemFiles() {
    const sourceDir = path.join(__dirname, './', 'boilerplate');

    for (const item of systemFiles) {
        try {
            copySingleFile(sourceDir, item);
        } catch (error) {
            Logger.error(`Failed to copy ${item}:`, error);
        }
    }

    for (const item of systemFilesNoOverwrite) {
        const destPath = path.join(process.cwd(), item);
        if (fs.existsSync(destPath)) {
            Logger.info(`Skipped ${item} (already exists)`);
            continue;
        }
        try {
            copySingleFile(sourceDir, item);
        } catch (error) {
            Logger.error(`Failed to copy ${item}:`, error);
        }
    }

    Logger.success('Copied system files to current directory');
}

module.exports = copySystemFiles;