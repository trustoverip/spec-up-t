/**
 * @file custom-update.js
 * @description Upgrade a consuming Spec-Up-T repository in place.
 *
 * This is not a postinstall hook. First-time install is install.js.
 * This file runs only when it is the process entry:
 *   - npm run custom-update  →  spec-up-t custom-update  (local bin)
 *   - npx spec-up-t@latest custom-update
 *   - node path/to/custom-update.js
 *
 * Requiring it does not run the update. The 1.x / 2.0.0 script
 *   node -e "require('spec-up-t/src/install-from-boilerplate/custom-update.js')"
 * is a failed no-op: it prints the repair command and sets exit code 1.
 * Repair (also the 1.x → 2.1.0 path; 2.0.0 is not required):
 *   npx spec-up-t@latest custom-update
 *
 * The CLI requires this module and calls the export. Jest does the same.
 *
 * Before writing, this prints a plan: files, scripts, gitignore, dependencies,
 * npm install, and per-spec migration. On a terminal it then asks. `--yes`
 * applies without asking (menu.yml passes this in GitHub Actions). `--dry-run`
 * prints the plan and does not write. With no terminal and no `--yes`, it
 * exits 1 after the plan. A missing package.json exits 1 before any write.
 */

const fs = require('fs-extra');
const readline = require('node:readline');
const { configScriptsKeys, configOverwriteScriptsKeys } = require('./config-scripts-keys');
const addScriptsKeys = require('./add-scripts-keys');
const copySystemFiles = require('./copy-system-files');
const { gitIgnoreEntries } = require('./config-gitignore-entries');
const { updateGitignore } = require('./add-gitignore-entries');
const updateDependencies = require('./update-dependencies');
const installConsumerDependencies = require('./install-consumer-dependencies');
const migrateVersionsToSnapshots = require('./migrate-versions-to-snapshots');
const renameBuildDirToLegacy = require('./rename-docs-to-legacy');
const isLegacyEvalRequire = require('./is-legacy-eval-require');
const { buildCustomUpdatePlan, formatCustomUpdatePlan } = require('./build-custom-update-plan');
const { parseCustomUpdateArgs } = require('./parse-custom-update-args');
const Logger = require('../utils/logger');

const LEGACY_REQUIRE_MESSAGE =
    'custom-update no longer runs from node -e require(). ' +
    'Run: npx spec-up-t@latest custom-update';

const REFUSE_WITHOUT_YES =
    'Refusing to write without --yes (no interactive terminal). ' +
    'Re-run with --yes to apply the plan, or --dry-run to print it only.';

const MISSING_PACKAGE_JSON =
    'package.json not found. custom-update did not write any files.';

/**
 * Asks on a terminal whether to apply the printed plan.
 * @returns {Promise<boolean>}
 */
function confirmApply() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Apply this plan? [y/N] ', (answer) => {
            rl.close();
            const normalized = String(answer || '').trim().toLowerCase();
            resolve(normalized === 'y' || normalized === 'yes');
        });
    });
}

/**
 * @param {{ yes?: boolean, confirm?: () => Promise<boolean>|boolean }} options
 * @returns {Promise<boolean>}
 */
async function resolveApply(options) {
    if (options.yes === true) {
        return true;
    }
    if (typeof options.confirm === 'function') {
        return Boolean(await options.confirm());
    }
    if (!process.stdin.isTTY) {
        throw new Error(REFUSE_WITHOUT_YES);
    }
    return confirmApply();
}

/**
 * Migrates snapshots and tracked build dirs for every spec in specs.json.
 * @throws {Error} When specs.json is missing, unreadable, or has no specs.
 */
function migrateAllSpecs() {
    const config = fs.readJsonSync('specs.json');
    const specs = config && Array.isArray(config.specs) ? config.specs : [];

    if (specs.length === 0) {
        throw new Error('specs.json has no specs array');
    }

    for (const spec of specs) {
        if (!spec || !spec.output_path) {
            throw new Error('A spec in specs.json is missing output_path');
        }
        migrateVersionsToSnapshots(spec.output_path);
        renameBuildDirToLegacy(spec.output_path);
    }
}

/**
 * Runs the in-place upgrade of the consuming repository (process.cwd()).
 * @param {{ yes?: boolean, dryRun?: boolean, confirm?: () => Promise<boolean>|boolean }} [options]
 */
async function customUpdate(options = {}) {
    const plan = buildCustomUpdatePlan();
    process.stdout.write(formatCustomUpdatePlan(plan));

    if (options.dryRun) {
        process.stdout.write('Dry run: no files were written.\n');
        return;
    }

    const apply = await resolveApply(options);
    if (!apply) {
        process.stdout.write('Aborted. No files were written.\n');
        return;
    }

    if (plan.packageJson === 'missing') {
        throw new Error(MISSING_PACKAGE_JSON);
    }

    // Copy known boilerplate files (including menu.yml) and remove stale
    // files. Extra workflows are not deleted.
    copySystemFiles();

    // Must complete before updateDependencies — both write package.json.
    addScriptsKeys(configScriptsKeys, configOverwriteScriptsKeys);

    await updateGitignore(gitIgnoreEntries.gitignorePath, gitIgnoreEntries.filesToAdd);

    await updateDependencies();

    // Install what was just written. Lives here so every real entry point
    // (local bin and `node path/to/custom-update.js`) installs once.
    // Do not also append `&& npm install` to the npm script.
    installConsumerDependencies();

    migrateAllSpecs();

    Logger.success('Custom update done');
}

if (require.main === module) {
    let options;
    try {
        options = parseCustomUpdateArgs(process.argv.slice(2));
    } catch (error) {
        Logger.error(error.message);
        process.exitCode = 1;
    }
    if (options) {
        customUpdate(options).catch((error) => {
            Logger.error('Custom update failed:', error);
            process.exitCode = 1;
        });
    }
} else if (isLegacyEvalRequire(require.main)) {
    Logger.error(LEGACY_REQUIRE_MESSAGE);
    process.exitCode = 1;
}

module.exports = customUpdate;
