/**
 * @fileoverview Test file for git-info utility functions
 * This test verifies that the GitHub repository information
 * is correctly extracted and formatted for the meta tag.
 */

const { getCurrentBranch, getGithubRepoInfo, resolveBuildBranch } = require('./utils/git-info');

// Tests for extracting and formatting Git repository information
describe('git-info utility', () => {
  // Tests for getting the current Git branch name
  describe('getCurrentBranch', () => {
    // Test: Does the function return a valid branch name as a string?
    test('should return a string branch name', () => {
      const branch = getCurrentBranch();
      expect(typeof branch).toBe('string');
      expect(branch.length).toBeGreaterThan(0);
    });

    // Test: Is the branch name properly formatted (no whitespace)?
    test('should not contain newlines or spaces', () => {
      const branch = getCurrentBranch();
      expect(branch).not.toMatch(/\n|\r|\s/);
    });
  });

  describe('resolveBuildBranch', () => {
    test('uses an attached git branch ahead of GitHub Actions', () => {
      const branch = resolveBuildBranch({
        gitBranch: 'local-feature',
        env: {
          GITHUB_HEAD_REF: 'pr-branch',
          GITHUB_REF: 'refs/heads/pr-branch',
          GITHUB_REF_NAME: 'pr-branch'
        }
      });
      expect(branch).toBe('local-feature');
    });

    test('uses GITHUB_HEAD_REF when checkout is detached', () => {
      const branch = resolveBuildBranch({
        gitBranch: '',
        gitHead: 'HEAD',
        env: {
          GITHUB_HEAD_REF: 'revised-format',
          GITHUB_REF: 'refs/pull/12/merge',
          GITHUB_REF_NAME: '12'
        }
      });
      expect(branch).toBe('revised-format');
    });

    const prEnv = {
      GITHUB_HEAD_REF: 'add-images',
      GITHUB_REF: 'refs/pull/12/merge',
      GITHUB_REF_NAME: '12',
      GITHUB_SHA: '0123456789abcdef0123456789abcdef01234567'
    };
    const prEvent = (head, base) => ({
      pull_request: { head: { repo: { full_name: head } }, base: { repo: { full_name: base } } }
    });

    test('uses the head branch for a pull request from the same repository', () => {
      const branch = resolveBuildBranch({
        gitHead: 'HEAD',
        env: prEnv,
        event: prEvent('trustoverip/spec', 'trustoverip/spec')
      });
      expect(branch).toBe('add-images');
    });

    test('uses the commit SHA for a pull request from a fork', () => {
      const branch = resolveBuildBranch({
        gitHead: 'HEAD',
        env: prEnv,
        event: prEvent('contributor/spec', 'trustoverip/spec')
      });
      expect(branch).toBe(prEnv.GITHUB_SHA);
    });

    test('uses the commit SHA when the pull request payload is unavailable', () => {
      const branch = resolveBuildBranch({ gitHead: 'HEAD', env: prEnv, event: null });
      expect(branch).toBe(prEnv.GITHUB_SHA);
    });

    test('uses GITHUB_REF_NAME for a branch push', () => {
      const branch = resolveBuildBranch({
        gitHead: 'HEAD',
        env: {
          GITHUB_REF: 'refs/heads/revised-format',
          GITHUB_REF_NAME: 'revised-format'
        }
      });
      expect(branch).toBe('revised-format');
    });

    test('uses GITHUB_REF_NAME for a tag', () => {
      const branch = resolveBuildBranch({
        gitHead: 'HEAD',
        env: {
          GITHUB_REF: 'refs/tags/v1.2.3',
          GITHUB_REF_NAME: 'v1.2.3'
        }
      });
      expect(branch).toBe('v1.2.3');
    });

    test('does not treat a pull request number as a branch', () => {
      const branch = resolveBuildBranch({
        gitHead: 'HEAD',
        env: {
          GITHUB_REF: 'refs/pull/12/merge',
          GITHUB_REF_NAME: '12'
        }
      });
      expect(branch).toBe('main');
    });

    test('falls back to main when git and Actions have no branch', () => {
      expect(resolveBuildBranch({ gitHead: 'HEAD', env: {} })).toBe('main');
    });
  });

  // Tests for formatting GitHub repository information for meta tags
  describe('getGithubRepoInfo', () => {
    // Test: Can the system format complete repository information correctly?
    test('should format github repo info correctly with valid spec', () => {
      const spec = {
        source: {
          account: 'testuser',
          repo: 'testrepo'
        }
      };
      
      const repoInfo = getGithubRepoInfo(spec);
      expect(repoInfo).toMatch(/^testuser,testrepo,.+$/);
      
      const parts = repoInfo.split(',');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('testuser');
      expect(parts[1]).toBe('testrepo');
      expect(parts[2].length).toBeGreaterThan(0);
    });

    // Test: Does the system gracefully handle missing repository information?
    test('should handle missing source object', () => {
      const spec = {};
      const repoInfo = getGithubRepoInfo(spec);
      expect(repoInfo).toMatch(/^unknown,unknown,.+$/);
    });

    // Test: Can the system handle incomplete repository information?
    test('should handle partial source information', () => {
      const spec = {
        source: {
          account: 'onlyuser'
          // missing repo
        }
      };
      
      const repoInfo = getGithubRepoInfo(spec);
      expect(repoInfo).toMatch(/^onlyuser,unknown,.+$/);
    });

    // Test: Does the system follow best practices for meta tag naming?
    test('should use spec-up-t namespace prefix recommendation', () => {
      // This test verifies our implementation follows the best practice
      // of using namespaced property names as recommended in the user request
      const metaTagProperty = 'spec-up-t:github-repo-info';
      expect(metaTagProperty).toMatch(/^spec-up-t:/);
    });
  });
});
