const fs = require('fs-extra');
const path = require('path');
const Logger = require('./utils/logger');
const outputDir = path.join(process.cwd(), '.cache');
const initFlagPath = path.join(outputDir, 'init.flag');

async function initialize() {
    try {
        // Ensure the .cache directory exists
        await fs.ensureDir(outputDir);

        // Check if the init script has already run
        if (await fs.pathExists(initFlagPath)) {
            return;
        }

        // Place the init script here

        // End of the init script

        // Create the init flag file
        await fs.writeFile(initFlagPath, 'Initialization completed.');

        Logger.success('Initialization complete.');
    } catch (error) {
        Logger.error('Initialization failed', {
            context: 'Failed to set up spec-up-t boilerplate files',
            hint: 'Ensure you have write permissions in the current directory. Try running with appropriate permissions or in a different directory',
            details: error.message
        });
    }
}

module.exports = { initialize };