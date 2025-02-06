const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const outputDir = path.join(process.cwd(), 'output');
const initFlagPath = path.join(outputDir, 'init.flag');
let config = fs.readJsonSync(path.join(process.cwd(), 'specs.json'));

const collectExternalReferences = require('./collectExternalReferences.js').collectExternalReferences;
const { prepareTref } = require('./prepare-tref');

async function initialize() {
    try {
        // Check if the init script has already run
        if (await fs.pathExists(initFlagPath)) {
            return;
        }

        // Place the init script here
        
        collectExternalReferences(process.env.GITHUB_API_TOKEN, false);
        // prepareTref(path.join(config.specs[0].spec_directory, config.specs[0].spec_terms_directory));

        // End of the init script

        // Create the init flag file
        await fs.writeFile(initFlagPath, 'Initialization completed.');

        console.log('Initialization complete.');
    } catch (error) {
        console.error(`Initialization failed: ${error.message}`);
    }
}

module.exports = { initialize };