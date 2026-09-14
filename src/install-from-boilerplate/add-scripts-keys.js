const fs = require('node:fs');
const path = require('node:path');
const Logger = require('../utils/logger');

/**
 * Adds scripts to the package.json file.
 *
 * @param {Object} scriptKeys - An object containing the scripts to add.
 * @param {Object} [overwriteKeys={}] - An object specifying which scripts to overwrite if they already exist.
 */
function addScriptsKeys(scriptKeys, overwriteKeys = {}) {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        Logger.error('Error reading package.json: file not found');
        return;
    }

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }

        for (const [key, value] of Object.entries(scriptKeys)) {
            if (!packageJson.scripts[key] || overwriteKeys[key]) {
                packageJson.scripts[key] = value;
            }
        }

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
        Logger.success('Scripts added to package.json successfully!');
    } catch (error) {
        Logger.error('Error updating package.json:', error);
    }
}

module.exports = addScriptsKeys;

/*

// Example usage:
const configScriptsKeys = {  ...  };
const overwriteConfig = { "edit": true }; // Overwrite only "edit" script

addScriptsKeys(configScriptsKeys); // Do not overwrite any existing scripts

addScriptsKeys(configScriptsKeys, overwriteConfig);  // Overwrite specified existing scripts

*/
