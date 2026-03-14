const fs = require('fs-extra');
const path = require('node:path');
const Logger = require('../utils/logger');

/**
 * Copies the boilerplate files to the consuming project root.
 * If a template is specified (non-default), the template's spec/ directory
 * and specs.json overwrite those from the default boilerplate.
 * The assets/ and static/ directories always come from the original boilerplate.
 *
 * @param {Object|null} template - Template object from config-templates.js, or null/undefined for default.
 */
function copyBoilerplate(template) {
    const sourceDir = path.join(__dirname, './', 'boilerplate');
    // // Use process.cwd() so the destination is always the consuming project root,
    // // regardless of whether spec-up-t is installed from npm or via `npm link`.
    // // I am not sure if this works in all cases. Needs testing.
    // const projectRoot = process.cwd();

    const projectRoot = path.join(__dirname, '../../../../');

    // Step 1: Copy everything from the default boilerplate
    const items = fs.readdirSync(sourceDir);
    for (const item of items) {
        const srcPath = path.join(sourceDir, item);
        const destPath = path.join(projectRoot, item);
        fs.cpSync(srcPath, destPath, { recursive: true });
    }

    // Rename the copied gitignore file to .gitignore
    const gitignorePath = path.join(projectRoot, 'gitignore');
    const gitignoreDestPath = path.join(projectRoot, '.gitignore');
    fs.renameSync(gitignorePath, gitignoreDestPath);

    Logger.success('Copied spec-up-t-boilerplate to current directory');

    // Step 2: If a non-default template was selected, overlay template-specific files
    if (template?.directory) {
        applyTemplate(template, projectRoot);
    }
}

/**
 * Overlays template-specific spec/ and specs.json onto the project root,
 * replacing the default boilerplate versions.
 *
 * @param {Object} template - Template object with a directory property.
 * @param {string} projectRoot - Absolute path to the consuming project root.
 */
function applyTemplate(template, projectRoot) {
    const templateDir = path.join(__dirname, 'boilerplate-templates', template.directory);

    if (!fs.existsSync(templateDir)) {
        Logger.error(`Template directory not found: ${template.directory}`);
        return;
    }

    // Replace spec/ directory with the template's version
    const destSpecDir = path.join(projectRoot, 'spec');
    const templateSpecDir = path.join(templateDir, 'spec');

    if (fs.existsSync(templateSpecDir)) {
        fs.rmSync(destSpecDir, { recursive: true, force: true });
        fs.cpSync(templateSpecDir, destSpecDir, { recursive: true });
        Logger.success(`Applied template spec/ from: ${template.name}`);
    }

    // Replace specs.json with the template's version
    const templateSpecsJson = path.join(templateDir, 'specs.json');
    if (fs.existsSync(templateSpecsJson)) {
        fs.cpSync(templateSpecsJson, path.join(projectRoot, 'specs.json'));
        Logger.success(`Applied template specs.json from: ${template.name}`);
    }
}

module.exports = copyBoilerplate;