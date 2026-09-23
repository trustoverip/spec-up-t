const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {
    systemFiles,
    systemFilesNoOverwrite,
    systemFilesToRemove,
} = require('./config-system-files');
const { configScriptsKeys, configOverwriteScriptsKeys } = require('./config-scripts-keys');
const { gitIgnoreEntries } = require('./config-gitignore-entries');
const { loadCanonicalDependencies } = require('./update-dependencies');

const WORKFLOWS_PREFIX = '.github/workflows/';

/**
 * @param {string} value
 * @returns {string}
 */
function displayValue(value) {
    if (value === undefined || value === null || value === '') {
        return '(not set)';
    }
    return String(value);
}

/**
 * @param {string} destRoot
 * @returns {object|null}
 */
function readPackageJson(destRoot) {
    const packageJsonPath = path.join(destRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        return null;
    }
    try {
        return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch (error) {
        throw new Error(`Cannot read package.json: ${error.message}`);
    }
}

/**
 * @param {object} packageJson
 * @returns {{ key: string, from: string, to: string }[]}
 */
function planScripts(packageJson) {
    const currentScripts = packageJson.scripts && typeof packageJson.scripts === 'object'
        ? packageJson.scripts
        : {};
    const changes = [];

    for (const [key, value] of Object.entries(configScriptsKeys)) {
        const current = currentScripts[key];
        const missing = current === undefined || current === null || current === '';
        const willWrite = missing || Boolean(configOverwriteScriptsKeys[key]);
        if (willWrite && current !== value) {
            changes.push({
                key,
                from: displayValue(current),
                to: value,
            });
        }
    }

    return changes;
}

/**
 * @param {object} packageJson
 * @returns {{ name: string, from: string, to: string }[]}
 */
function planDependencies(packageJson) {
    const canonical = loadCanonicalDependencies();
    const currentDeps = packageJson.dependencies && typeof packageJson.dependencies === 'object'
        ? packageJson.dependencies
        : {};
    const changes = [];

    for (const [name, version] of Object.entries(canonical)) {
        if (currentDeps[name] !== version) {
            changes.push({
                name,
                from: displayValue(currentDeps[name]),
                to: version,
            });
        }
    }

    return changes;
}

/**
 * @param {string} sourceDir
 * @param {string} destRoot
 * @param {string} item
 * @returns {'add'|'replace'|'same'}
 */
function classifyOverwrite(sourceDir, destRoot, item) {
    const srcPath = path.join(sourceDir, item);
    const destPath = path.join(destRoot, item);

    if (!fs.existsSync(srcPath)) {
        throw new Error(`Boilerplate file not found: ${item}`);
    }
    if (!fs.existsSync(destPath)) {
        return 'add';
    }

    const sourceBytes = fs.readFileSync(srcPath);
    const destBytes = fs.readFileSync(destPath);
    return sourceBytes.equals(destBytes) ? 'same' : 'replace';
}

/**
 * @param {string} destRoot
 * @returns {string[]}
 */
function planExtraWorkflows(destRoot) {
    const workflowsDir = path.join(destRoot, '.github', 'workflows');
    if (!fs.existsSync(workflowsDir)) {
        return [];
    }

    const managed = new Set(
        [...systemFiles, ...systemFilesToRemove]
            .filter((item) => item.startsWith(WORKFLOWS_PREFIX))
            .map((item) => path.basename(item))
    );

    const left = [];
    for (const entry of fs.readdirSync(workflowsDir, { withFileTypes: true })) {
        if (entry.isFile() && managed.has(entry.name)) {
            continue;
        }
        left.push(`${WORKFLOWS_PREFIX}${entry.name}`);
    }
    left.sort();
    return left;
}

/**
 * Patterns updateGitignore would append. Comparison matches that function:
 * trim the line, drop the inline comment, then compare the pattern.
 *
 * @param {string} destRoot
 * @returns {string[]}
 */
function planGitignore(destRoot) {
    const gitignorePath = path.join(destRoot, '.gitignore');
    const content = fs.existsSync(gitignorePath)
        ? fs.readFileSync(gitignorePath, 'utf8')
        : '';
    const lines = content.split('\n').filter((line) => line.trim() !== '');
    const add = [];

    for (const file of gitIgnoreEntries.filesToAdd) {
        const pattern = file.trim();
        const alreadyPresent = lines.some((line) => {
            const linePattern = line.trim().split('#')[0].trim();
            return linePattern === pattern;
        });
        if (!alreadyPresent) {
            add.push(pattern);
        }
    }

    return add;
}

/**
 * @param {string} destRoot
 * @param {string} dirName
 * @returns {boolean}
 */
function outputIsGitTracked(destRoot, dirName) {
    try {
        const output = execSync(`git ls-files -- "${dirName}"`, {
            cwd: destRoot,
            encoding: 'utf8',
            timeout: 10000,
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        return output.trim().length > 0;
    } catch {
        return false;
    }
}

/**
 * Version directories migrateVersionsToSnapshots would copy into snapshots/.
 *
 * @param {string} destRoot
 * @param {string} outputPath
 * @returns {string[]}
 */
function versionDirsToCopy(destRoot, outputPath) {
    const src = path.join(destRoot, outputPath, 'versions');
    if (!fs.existsSync(src)) {
        return [];
    }

    const copies = [];
    for (const entry of fs.readdirSync(src)) {
        const srcDir = path.join(src, entry);
        if (!fs.statSync(srcDir).isDirectory()) {
            continue;
        }
        if (!fs.existsSync(path.join(destRoot, 'snapshots', entry))) {
            copies.push(entry);
        }
    }
    copies.sort();
    return copies;
}

/**
 * Per-spec migration steps: snapshot copies and a git mv of a tracked build dir.
 * Does not run git mv. A missing or empty specs.json is reported, not thrown.
 *
 * @param {string} destRoot
 * @returns {{ status: 'present'|'missing'|'empty', items: { outputPath: string, actions: string[] }[] }}
 */
function planSpecs(destRoot) {
    const specsPath = path.join(destRoot, 'specs.json');
    if (!fs.existsSync(specsPath)) {
        return { status: 'missing', items: [] };
    }

    let config;
    try {
        config = JSON.parse(fs.readFileSync(specsPath, 'utf8'));
    } catch (error) {
        throw new Error(`Cannot read specs.json: ${error.message}`);
    }

    const specs = config && Array.isArray(config.specs) ? config.specs : [];
    if (specs.length === 0) {
        return { status: 'empty', items: [] };
    }

    const items = [];
    for (const spec of specs) {
        if (!spec || !spec.output_path) {
            items.push({
                outputPath: '(missing output_path)',
                actions: ['missing output_path'],
            });
            continue;
        }

        const actions = [];
        const outputPath = String(spec.output_path).replace(/\\/g, '/');
        const dirName = outputPath.replace(/^\.\//, '');
        for (const dir of versionDirsToCopy(destRoot, spec.output_path)) {
            actions.push(`copy ${dirName}/versions/${dir} -> snapshots/${dir}`);
        }

        const legacyDirName = `${dirName}-legacy`;
        if (!fs.existsSync(path.join(destRoot, legacyDirName)) && outputIsGitTracked(destRoot, dirName)) {
            actions.push(`git mv ${dirName} ${legacyDirName}`);
        }

        if (actions.length > 0) {
            items.push({ outputPath, actions });
        }
    }

    return { status: 'present', items };
}

/**
 * Describes what custom-update would change. Does not write.
 * Includes scripts, files, dependencies, gitignore patterns to add,
 * npm install, and per-spec snapshot copies or tracked-dir renames.
 *
 * @param {string} [destRoot]
 */
function buildCustomUpdatePlan(destRoot = process.cwd()) {
    const sourceDir = path.join(__dirname, 'boilerplate');
    const packageJson = readPackageJson(destRoot);

    const write = [];
    for (const item of systemFiles) {
        const action = classifyOverwrite(sourceDir, destRoot, item);
        if (action !== 'same') {
            write.push({ action, path: item });
        }
    }

    const skip = [];
    for (const item of systemFilesNoOverwrite) {
        const destPath = path.join(destRoot, item);
        if (fs.existsSync(destPath)) {
            skip.push(item);
            continue;
        }
        const action = classifyOverwrite(sourceDir, destRoot, item);
        if (action !== 'same') {
            write.push({ action, path: item });
        }
    }

    const remove = [];
    for (const item of systemFilesToRemove) {
        if (fs.existsSync(path.join(destRoot, item))) {
            remove.push(item);
        }
    }

    return {
        packageJson: packageJson ? 'present' : 'missing',
        scripts: packageJson ? planScripts(packageJson) : [],
        files: {
            write,
            remove,
            leave: planExtraWorkflows(destRoot),
            skip,
        },
        dependencies: packageJson ? planDependencies(packageJson) : [],
        gitignore: planGitignore(destRoot),
        specs: planSpecs(destRoot),
    };
}

/**
 * @param {string} action
 * @param {string} filePath
 * @returns {string}
 */
function fileLine(action, filePath) {
    return `  ${action.padEnd(7)} ${filePath}`;
}

/**
 * @param {ReturnType<typeof buildCustomUpdatePlan>} plan
 * @returns {string}
 */
function formatCustomUpdatePlan(plan) {
    const lines = ['Custom update plan', ''];

    lines.push('Scripts:');
    if (plan.packageJson === 'missing') {
        lines.push('  (package.json not found)');
    } else if (plan.scripts.length === 0) {
        lines.push('  (no changes)');
    } else {
        for (const change of plan.scripts) {
            lines.push(`  ${change.key}`);
            lines.push(`    from: ${change.from}`);
            lines.push(`    to:   ${change.to}`);
        }
    }

    lines.push('');
    lines.push('Files:');
    const fileLines = [
        ...plan.files.write.map((item) => fileLine(item.action, item.path)),
        ...plan.files.remove.map((item) => fileLine('remove', item)),
        ...plan.files.leave.map((item) => fileLine('leave', item)),
        ...plan.files.skip.map((item) => fileLine('skip', item)),
    ];
    if (fileLines.length === 0) {
        lines.push('  (no changes)');
    } else {
        lines.push(...fileLines);
    }

    lines.push('');
    lines.push('Dependencies:');
    if (plan.packageJson === 'missing') {
        lines.push('  (package.json not found)');
    } else if (plan.dependencies.length === 0) {
        lines.push('  (no changes)');
    } else {
        for (const dep of plan.dependencies) {
            lines.push(`  ${dep.name}  ${dep.from} -> ${dep.to}`);
        }
    }

    lines.push('');
    lines.push('Gitignore:');
    if (plan.gitignore.length === 0) {
        lines.push('  (no new patterns)');
    } else {
        for (const pattern of plan.gitignore) {
            lines.push(fileLine('add', pattern));
        }
    }

    lines.push('');
    lines.push('npm install:');
    lines.push('  npm install');

    lines.push('');
    lines.push('Specs:');
    if (plan.specs.status === 'missing') {
        lines.push('  (specs.json not found)');
    } else if (plan.specs.status === 'empty') {
        lines.push('  (specs.json has no specs)');
    } else if (plan.specs.items.length === 0) {
        lines.push('  (no snapshot copies or tracked-dir renames)');
    } else {
        for (const item of plan.specs.items) {
            lines.push(`  ${item.outputPath}`);
            for (const action of item.actions) {
                lines.push(`    ${action}`);
            }
        }
    }

    lines.push('');
    return `${lines.join('\n')}\n`;
}

module.exports = { buildCustomUpdatePlan, formatCustomUpdatePlan };
