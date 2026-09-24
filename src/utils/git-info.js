/**
 * Git information utility
 * 
 * Provides functions to extract Git repository information including
 * the current branch name and repository details from the working directory.
 * 
 * @author Spec-Up-T Team
 * @since 2025-08-31
 */

const { execSync, execFileSync } = require('child_process');
const fs = require('node:fs');
const Logger = require('./logger');

// Fixed PATH for security: only system directories, not user-writable
const FIXED_PATH = process.platform === 'win32'
    ? 'C:\\Windows\\system32;C:\\Windows'
    : '/usr/bin:/bin:/usr/sbin:/sbin';

/**
 * True unless the event payload shows the pull request head lives in the
 * same repository as its base. An unreadable payload counts as a fork,
 * because the commit SHA works in both cases and a fork's branch does not.
 *
 * @param {Object|null} event - Parsed GITHUB_EVENT_PATH payload
 * @returns {boolean}
 */
function isForkPullRequest(event) {
    const pr = event && event.pull_request;
    const head = pr && pr.head && pr.head.repo && pr.head.repo.full_name;
    const base = pr && pr.base && pr.base.repo && pr.base.repo.full_name;
    if (!head || !base) {
        return true;
    }
    return String(head).toLowerCase() !== String(base).toLowerCase();
}

/**
 * Branch name published by GitHub Actions.
 * actions/checkout leaves a detached HEAD, so git cannot see the branch.
 * Pull requests expose the source branch as GITHUB_HEAD_REF, but a fork's
 * branch does not exist in the base repository, so fork builds use GITHUB_SHA.
 * Pushes expose it as GITHUB_REF_NAME when GITHUB_REF is refs/heads/ or refs/tags/.
 * GITHUB_REF_NAME on a pull request is the PR number, which is not a branch.
 *
 * @param {NodeJS.ProcessEnv} env
 * @param {Object|null} [event] - Parsed GITHUB_EVENT_PATH payload
 * @returns {string|null}
 */
function branchFromActionsEnv(env, event = null) {
    const headRef = env && env.GITHUB_HEAD_REF && String(env.GITHUB_HEAD_REF).trim();
    if (headRef) {
        const sha = env.GITHUB_SHA && String(env.GITHUB_SHA).trim();
        if (sha && isForkPullRequest(event)) {
            return sha;
        }
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
 * @param {{ gitBranch?: string, gitHead?: string, env?: NodeJS.ProcessEnv, event?: Object|null }} input
 * @returns {string}
 */
function resolveBuildBranch({ gitBranch = '', gitHead = '', env = {}, event = null } = {}) {
    const branch = String(gitBranch || '').trim();
    if (branch) {
        return branch;
    }

    const head = String(gitHead || '').trim();
    if (head && head !== 'HEAD') {
        return head;
    }

    return branchFromActionsEnv(env, event) || 'main';
}

function readActionsEvent(env) {
    if (!env.GITHUB_HEAD_REF || !env.GITHUB_EVENT_PATH) {
        return null;
    }
    try {
        return JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
    } catch (error) {
        Logger.warn(`Could not read GitHub Actions event payload (${error.message})`);
        return null;
    }
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

    const resolvedFromGit = Boolean(gitBranch) || (gitHead && gitHead !== 'HEAD');
    const event = resolvedFromGit ? null : readActionsEvent(process.env);
    const branch = resolveBuildBranch({ gitBranch, gitHead, env: process.env, event });
    if (!resolvedFromGit) {
        if (branchFromActionsEnv(process.env, event)) {
            Logger.info(`Current git branch (from GitHub Actions): ${branch}`);
        } else {
            Logger.warn('Could not determine git branch, using fallback: main');
        }
    }

    return branch;
}

function runGit(args, cwd) {
    return execFileSync('git', args, {
        cwd,
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PATH: FIXED_PATH }
    });
}

/**
 * @returns {string} The top of the git working tree, or the working directory outside git
 */
function getRepoRoot() {
    try {
        return runGit(['rev-parse', '--show-toplevel'], process.cwd()).trim() || process.cwd();
    } catch {
        return process.cwd();
    }
}

/**
 * Finds files that do not exist yet on the GitHub copy of the branch, as
 * last seen by `git fetch`. Only checks a local build on an attached branch
 * that matches the build branch; CI checkouts are always published.
 *
 * @param {string[]} files - Repository-relative paths
 * @param {string} branch - Branch the build publishes
 * @param {string} repoRoot
 * @returns {string[]} The files that are not on the remote branch
 */
function getUnpublishedFiles(files, branch, repoRoot) {
    if (!files || files.length === 0) {
        return [];
    }

    let current;
    try {
        current = runGit(['branch', '--show-current'], repoRoot).trim();
    } catch {
        return [];
    }
    if (!current || current !== branch) {
        return [];
    }

    const remoteRef = findRemoteRef(branch, repoRoot);
    if (!remoteRef) {
        // The branch has never been pushed, so none of its files are on GitHub.
        return [...files];
    }

    try {
        const listed = runGit(['--literal-pathspecs', 'ls-tree', '-r', '-z', '--name-only', remoteRef, '--', ...files], repoRoot);
        const published = new Set(listed.split('\0').filter(Boolean));
        return files.filter(file => !published.has(file));
    } catch (error) {
        Logger.warn(`Could not compare images with ${remoteRef} (${error.message})`);
        return [];
    }
}

/**
 * @returns {string|null} The upstream of the branch, else origin/<branch>, else null
 */
function findRemoteRef(branch, repoRoot) {
    try {
        return runGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], repoRoot).trim();
    } catch {
        // No upstream configured.
    }
    const fallback = `refs/remotes/origin/${branch}`;
    try {
        runGit(['rev-parse', '--verify', '--quiet', fallback], repoRoot);
        return fallback;
    } catch {
        return null;
    }
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
    getRepoRoot,
    getUnpublishedFiles,
    resolveBuildBranch
};
