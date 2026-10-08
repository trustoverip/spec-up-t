const fs = require('fs-extra');
const path = require('node:path');
const { buildCustomUpdatePlan } = require('./build-custom-update-plan');
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
 * Copies the files the custom-update plan said it would write, and removes
 * the stale files the plan said it would remove. Pass `plan` from the printed
 * plan so the write matches that text. Without a plan, one is built for
 * `destRoot`.
 *
 * Workflow files that differ from the boilerplate are not in `plan.files.write`
 * unless the plan was built with `forceWorkflows`.
 *
 * @param {string} [destRoot]
 * @param {{ plan?: object, forceWorkflows?: boolean }} [options]
 */
function copySystemFiles(destRoot = process.cwd(), options = {}) {
    const plan = options.plan || buildCustomUpdatePlan(destRoot, {
        forceWorkflows: options.forceWorkflows === true,
    });
    const sourceDir = path.join(__dirname, './', 'boilerplate');

    for (const item of plan.files.write) {
        try {
            copySingleFile(sourceDir, destRoot, item.path);
        } catch (error) {
            Logger.error(`Failed to copy ${item.path}:`, error);
        }
    }

    for (const item of plan.files.keep || []) {
        Logger.info(`Kept ${item} (differs from boilerplate)`);
    }

    removeStaleFiles(destRoot, plan.files.remove);

    Logger.success('Copied system files to current directory');
}

module.exports = copySystemFiles;
