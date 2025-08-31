/**
 * GitHub Repository Information Utility
 * 
 * This client-side utility provides easy access to the GitHub repository
 * information embedded in the HTML meta tag by Spec-Up-T.
 * 
 * Usage:
 *   const repoInfo = getGithubRepoInfo();
 *   if (repoInfo) {
 *     console.log(`Repository: ${repoInfo.username}/${repoInfo.repo} on ${repoInfo.branch}`);
 *   }
 */

/**
 * Extracts GitHub repository information from the meta tag
 * @returns {Object|null} Repository information object or null if not found
 * @returns {string} returns.username - GitHub username/account
 * @returns {string} returns.repo - Repository name
 * @returns {string} returns.branch - Git branch name
 */
function getGithubRepoInfo() {
    try {
        const metaTag = document.querySelector('meta[property="spec-up-t:github-repo-info"]');
        if (!metaTag) {
            console.warn('GitHub repository meta tag not found');
            return null;
        }
        
        const content = metaTag.getAttribute('content');
        if (!content) {
            console.warn('GitHub repository meta tag has no content');
            return null;
        }
        
        const [username, repo, branch] = content.split(',');
        if (!username || !repo || !branch) {
            console.warn('Invalid GitHub repository meta tag format');
            return null;
        }
        
        return {
            username: username.trim(),
            repo: repo.trim(),
            branch: branch.trim()
        };
    } catch (error) {
        console.error('Error extracting GitHub repository information:', error);
        return null;
    }
}

/**
 * Creates a GitHub URL from the repository information
 * @param {string} path - Optional path within the repository (e.g., 'issues', 'blob/main/README.md')
 * @returns {string|null} GitHub URL or null if repository info not available
 */
function getGithubUrl(path = '') {
    const repoInfo = getGithubRepoInfo();
    if (!repoInfo) {
        return null;
    }
    
    const baseUrl = `https://github.com/${repoInfo.username}/${repoInfo.repo}`;
    if (path) {
        return `${baseUrl}/${path}`;
    }
    return baseUrl;
}

/**
 * Gets the GitHub URL for the current branch
 * @returns {string|null} GitHub branch URL or null if repository info not available
 */
function getCurrentBranchUrl() {
    const repoInfo = getGithubRepoInfo();
    if (!repoInfo) {
        return null;
    }
    
    return `https://github.com/${repoInfo.username}/${repoInfo.repo}/tree/${repoInfo.branch}`;
}

// Make functions available globally if not using modules
if (typeof window !== 'undefined') {
    window.getGithubRepoInfo = getGithubRepoInfo;
    window.getGithubUrl = getGithubUrl;
    window.getCurrentBranchUrl = getCurrentBranchUrl;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getGithubRepoInfo,
        getGithubUrl,
        getCurrentBranchUrl
    };
}
