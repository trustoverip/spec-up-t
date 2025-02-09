const fs = require('fs');
const path = require('path');

// Function to add scripts to package.json
function addScriptsKeys(scriptKeys) {
    // Path to the package.json of the project where this script is run
    const packageJsonPath = path.resolve(__dirname, '../../../../', 'package.json');

    // Read the package.json file
    fs.readFile(packageJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading package.json:', err);
            return;
        }

        try {
            // Parse the package.json content
            const packageJson = JSON.parse(data);

            // Initialize the scripts section if it doesn't exist
            if (!packageJson.scripts) {
                packageJson.scripts = {};
            }

            // Add new scripts without overwriting existing ones
            for (const [key, value] of Object.entries(scriptKeys)) {
                if (!packageJson.scripts[key]) {
                    packageJson.scripts[key] = value;
                }
            }

            // Write the updated package.json back to disk
            fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing package.json:', err);
                } else {
                    console.log('Scripts added to package.json successfully!');
                }
            });
        } catch (parseError) {
            console.error('Error parsing package.json:', parseError);
        }
    });
}

// Export the function
module.exports = addScriptsKeys;