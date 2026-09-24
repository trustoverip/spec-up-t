/**
 * Git information utility
 * 
 * Provides functions to extract Git repository information including
 * the current branch name and repository details from the working directory.
 * 
 * @author Spec-Up-T Team
 * @since 2025-08-31
 */

const { execSync } = require('child_process');
const Logger = require('./logger');

// Fixed PATH for security: only system directories, not user-writable
const FIXED_PATH = process.platform === 'win32'
    ? 'C:\\Windows\\system32;C:\\Windows'
    : '/usr/bin:/bin:/usr/sbin:/sbin';

/**
 * Branch name published by GitHub Actions.
 * actions/checkout leaves a detached HEAD, so git cannot see the branch.
 * Pull requests expose the source branch as GITHUB_HEAD_REF.
 * Pushes expose it as GITHUB_REF_NAME when GITHUB_REF is refs/heads/ or refs/tags/.
 * GITHUB_REF_NAME on a pull request is the PR number, which is not a branch.
 *
 * @param {NodeJS.ProcessEnv} env
 * @returns {string|null}
 */
function branchFromActionsEnv(env) {
    const headRef = env && env.GITHUB_HEAD_REF && String(env.GITHUB_HEAD_REF).trim();
    if (headRef) {
        return headRef;
    }

    const ref = env && env.GITHUB_REF ? String(env.GITHUB_REF) : '';
    const refName = env && env.GITHUB_REF_NAME && String(env.GITHUB_REF_NAME).trim();
    if (refName && (ref.startsWith('refs/heads/') || ref.startsWith('refs/tags/'))) {
        return refName;
    }

    return null;
}

/**
 * Picks the branch a build should publish.
 * An attached git branch wins. A detached checkout then uses GitHub Actions,
 * then 'main'.
 *
 * @param {{ gitBranch?: string, gitHead?: string, env?: NodeJS.ProcessEnv }} input
 * @returns {string}
 */
function resolveBuildBranch({ gitBranch = '', gitHead = '', env = {} } = {}) {
    const branch = String(gitBranch || '').trim();
    if (branch) {
        return branch;
    }

    const head = String(gitHead || '').trim();
    if (head && head !== 'HEAD') {
        return head;
    }

    return branchFromActionsEnv(env) || 'main';
}

function readGitRef(command) {
    return execSync(command, {
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PATH: FIXED_PATH }
    }).trim();
}

/**
 * Gets the current Git branch name
 * 
 * @returns {string} The current branch name, or 'main' as fallback
 */
function getCurrentBranch() {
    let gitBranch = '';
    let gitHead = '';

    try {
        gitBranch = readGitRef('git branch --show-current');
        if (!gitBranch) {
            gitHead = readGitRef('git rev-parse --abbrev-ref HEAD');
        }
    } catch (error) {
        Logger.warn(`Could not get git branch (${error.message})`);
    }

    if (!gitBranch && gitHead && gitHead !== 'HEAD') {
        Logger.info(`Current git branch (from HEAD): ${gitHead}`);
    }

    const branch = resolveBuildBranch({ gitBranch, gitHead, env: process.env });
    const resolvedFromGit = Boolean(gitBranch) || (gitHead && gitHead !== 'HEAD');
    if (!resolvedFromGit) {
        if (branchFromActionsEnv(process.env)) {
            Logger.info(`Current git branch (from GitHub Actions): ${branch}`);
        } else {
            Logger.warn('Could not determine git branch, using fallback: main');
        }
    }

    return branch;
}

/**
 * Creates GitHub repository information meta tag content
 * 
 * @param {Object} spec - The spec configuration object
 * @returns {string} Meta tag content in format "username,repo,branch"
 */
function getGithubRepoInfo(spec) {
    try {
        const source = spec.source || {};
        const account = source.account || 'unknown';
        const repo = source.repo || 'unknown';
        const branch = getCurrentBranch();
        const content = `${account},${repo},${branch}`;
        Logger.info(`GitHub repo info: ${content}`);
        return content;
    } catch (error) {
        Logger.warn(`Error generating GitHub repo info: ${error.message}`);
        return 'unknown,unknown,main';
    }
}

module.exports = {
    getCurrentBranch,
    getGithubRepoInfo,
    resolveBuildBranch
};
