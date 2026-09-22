const fs = require('node:fs');
const path = require('node:path');
const Logger = require('../utils/logger');

/**
 * Reads the packaged consumer dependency list and pins spec-up-t to the
 * version of this running package. No network call — the file is shipped
 * inside spec-up-t so custom-update works offline.
 *
 * @returns {Object} Map of package name to version string
 */
function loadCanonicalDependencies() {
    const packagedPath = path.join(__dirname, 'package.spec-up-t.json');
    const packaged = JSON.parse(fs.readFileSync(packagedPath, 'utf8'));
    const self = require('../../package.json');

    return {
        ...(packaged.dependencies || {}),
        'spec-up-t': self.version
    };
}

/**
 * Updates dependencies in the consuming repo's package.json from the
 * packaged canonical list, pinning spec-up-t to this package's version.
 */
async function updateDependencies() {
    const consumerPackagePath = path.resolve(process.cwd(), 'package.json');

    if (!fs.existsSync(consumerPackagePath)) {
        throw new Error(`package.json not found at: ${consumerPackagePath}`);
    }

    const specUpPackageDependencies = loadCanonicalDependencies();
    const consumerPackage = JSON.parse(fs.readFileSync(consumerPackagePath, 'utf8'));

    if (!consumerPackage.dependencies) {
        consumerPackage.dependencies = {};
    }

    let updatedCount = 0;

    for (const [packageName, version] of Object.entries(specUpPackageDependencies)) {
        const currentVersion = consumerPackage.dependencies[packageName];

        if (currentVersion !== version) {
            consumerPackage.dependencies[packageName] = version;
            updatedCount++;
            Logger.info(`Updated ${packageName}: ${currentVersion || 'not installed'} -> ${version}`);
        }
    }

    if (updatedCount > 0) {
        fs.writeFileSync(consumerPackagePath, JSON.stringify(consumerPackage, null, 2) + '\n', 'utf8');
        Logger.success(`Successfully updated ${updatedCount} dependenc${updatedCount === 1 ? 'y' : 'ies'} in package.json`);
    } else {
        Logger.info('All dependencies are already up to date');
    }
}

module.exports = updateDependencies;
module.exports.loadCanonicalDependencies = loadCanonicalDependencies;
