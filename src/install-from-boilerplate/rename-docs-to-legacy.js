/**
 * @file rename-docs-to-legacy.js
 * @description One-time migration step for repositories that committed their build
 * output directory (e.g. docs/) to git.
 *
 * Under the current convention the build output directory is gitignored and
 * therefore not part of the repository. Repos that were set up before this
 * convention was introduced still have the old docs/ directory tracked in git.
 *
 * This module renames that tracked directory to docs-legacy/. It does not
 * commit — menu.yml / the user commit the rename. After this step the normal
 * gitignore rules take over and any freshly generated docs/ will not be tracked.
 *
 * - Safe to run more than once: skipped when docs-legacy/ already exists.
 * - Skipped when the output directory is not tracked by git at all.
 * - Respects the output_path from specs.json instead of hardcoding "docs".
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const Logger = require('../utils/logger');

// Restrict the executable search path to well-known system locations so that a
// malicious program earlier on PATH cannot intercept the git call.
const FIXED_PATH = process.platform === 'win32'
    ? 'C:\\Windows\\system32;C:\\Windows'
    : '/usr/bin:/bin:/usr/sbin:/sbin';

/**
 * Common options passed to every execSync call in this module.
 * stdio 'pipe' keeps output out of the terminal and lets us catch errors.
 */
const EXEC_OPTS = {
    encoding: 'utf8',
    timeout: 10000,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, PATH: FIXED_PATH }
};

/**
 * Returns true when at least one file inside dirPath is tracked by git.
 * Uses `git ls-files` which outputs nothing for untracked paths.
 *
 * @param {string} dirPath - Relative path to the directory to check.
 * @returns {boolean}
 */
function isGitTracked(dirPath) {
    try {
        const output = execSync(`git ls-files -- "${dirPath}"`, EXEC_OPTS);
        return output.trim().length > 0;
    } catch {
        // git not available or not inside a repository — treat as not tracked.
        return false;
    }
}

/**
 * Renames the build output directory to <outputDir>-legacy/ when the directory
 * is currently tracked by git. Leaves the working tree dirty for the caller
 * (menu.yml or the user) to commit.
 *
 * @param {string} outputDir - The output directory path as defined in specs.json
 *   (e.g. './docs' or 'docs'). Leading './' is stripped before use.
 */
function renameBuildDirToLegacy(outputDir) {
    // Normalise './docs' → 'docs' so git commands receive a clean path.
    const dirName = outputDir.replace(/^\.\//, '');
    const legacyDirName = `${dirName}-legacy`;

    // Guard 1: already migrated — nothing to do.
    if (fs.existsSync(legacyDirName)) {
        Logger.info(`Skipping rename: ${legacyDirName} already exists`);
        return;
    }

    // Guard 2: directory is not in git — skip silently.
    if (!isGitTracked(dirName)) {
        return;
    }

    try {
        // Rename the directory inside git's index so the history is preserved.
        execSync(`git mv "${dirName}" "${legacyDirName}"`, EXEC_OPTS);

        Logger.success(`Renamed ${dirName} to ${legacyDirName} (not committed)`);
        Logger.info(`Commit the rename when you are ready, e.g. git add ${legacyDirName} && git commit`);
    } catch (error) {
        Logger.info(`Could not rename ${dirName}: ${error.message}`);
    }
}

module.exports = renameBuildDirToLegacy;
