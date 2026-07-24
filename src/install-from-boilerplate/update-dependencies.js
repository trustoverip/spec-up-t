const fs = require('node:fs');
const path = require('node:path');
const https = require('https');
const Logger = require('../utils/logger');

/**
 * URL to the canonical package.spec-up-t.json in the starter-pack repository.
 * This defines the recommended dependency versions for consuming repos.
 */
const STARTER_PACK_PACKAGE_URL = 'https://raw.githubusercontent.com/trustoverip/spec-up-t-starter-pack/main/package.spec-up-t.json';

/**
 * Fetches package.spec-up-t.json from the remote starter-pack repository.
 * 
 * @returns {Promise<Object>} The parsed package.spec-up-t.json content
 * @throws {Error} If the fetch fails or the response is invalid
 */
function fetchStarterPackageConfig() {
    return new Promise((resolve, reject) => {
        https.get(STARTER_PACK_PACKAGE_URL, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to fetch package.spec-up-t.json: HTTP ${response.statusCode}`));
                return;
            }

            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const config = JSON.parse(data);
                    resolve(config);
                } catch (error) {
                    reject(new Error(`Failed to parse package.spec-up-t.json: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Network error fetching package.spec-up-t.json: ${error.message}`));
        });
    });
}

/**
 * Updates dependencies in the consuming repo's package.json based on the
 * canonical package.spec-up-t.json from the starter-pack repository.
 * This ensures that the consuming repo always has the correct dependency versions
 * as specified by the spec-up-t-starter-pack.
 */
async function updateDependencies() {
    // Path to the consuming repo's package.json
    const consumerPackagePath = path.resolve(process.cwd(), 'package.json');

    try {
        // Fetch the canonical package.spec-up-t.json from the starter-pack repo
        Logger.info('Fetching latest dependency configuration...');
        const specUpPackage = await fetchStarterPackageConfig();

        // Read consuming repo's package.json
        if (!fs.existsSync(consumerPackagePath)) {
            Logger.error('package.json not found at:', consumerPackagePath);
            return;
        }

        const consumerPackageData = fs.readFileSync(consumerPackagePath, 'utf8');
        const consumerPackage = JSON.parse(consumerPackageData);

        // Initialize dependencies section if it doesn't exist
        if (!consumerPackage.dependencies) {
            consumerPackage.dependencies = {};
        }

        // Check if there are dependencies to update
        if (!specUpPackage.dependencies) {
            Logger.info('No dependencies found in package.spec-up-t.json');
            return;
        }

        let updatedCount = 0;

        // Update each dependency from package.spec-up-t.json
        for (const [packageName, version] of Object.entries(specUpPackage.dependencies)) {
            const currentVersion = consumerPackage.dependencies[packageName];

            if (currentVersion !== version) {
                consumerPackage.dependencies[packageName] = version;
                updatedCount++;
                Logger.info(`Updated ${packageName}: ${currentVersion || 'not installed'} -> ${version}`);
            }
        }

        if (updatedCount > 0) {
            // Write the updated package.json back to disk
            fs.writeFileSync(consumerPackagePath, JSON.stringify(consumerPackage, null, 2) + '\n', 'utf8');
            Logger.success(`Successfully updated ${updatedCount} dependenc${updatedCount === 1 ? 'y' : 'ies'} in package.json`);
        } else {
            Logger.info('All dependencies are already up to date');
        }
    } catch (error) {
        Logger.error('Error updating dependencies:', error.message);
    }
}

module.exports = updateDependencies;
