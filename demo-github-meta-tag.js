/**
 * Demo script to show GitHub repository information meta tag in action
 * 
 * This script demonstrates how the new meta tag feature works by
 * showing the git info extraction and HTML template interpolation.
 */

const { getGithubRepoInfo } = require('./src/utils/git-info');

// Example spec configuration (similar to what would be in specs.json)
const exampleSpec = {
  source: {
    host: 'github',
    account: 'blockchainbird', 
    repo: 'spec-up-t'
  },
  title: 'Demo Specification',
  description: 'A demo showing GitHub repo info in meta tags',
  author: 'Demo Author'
};

// Get the GitHub repository information
const githubRepoInfo = getGithubRepoInfo(exampleSpec);

// Show what the meta tag content will look like
console.log('🔍 GitHub Repository Information:');
console.log(`   Account: ${exampleSpec.source.account}`);
console.log(`   Repository: ${exampleSpec.source.repo}`);
console.log(`   Current Branch: ${githubRepoInfo.split(',')[2]}`);
console.log('');
console.log('📝 Generated Meta Tag:');
console.log(`<meta property="spec-up-t:github-repo-info" content="${githubRepoInfo}">`);
console.log('');
console.log('🚀 JavaScript Usage Example:');
console.log('```javascript');
console.log('const metaTag = document.querySelector(\'meta[property="spec-up-t:github-repo-info"]\');');
console.log('const content = metaTag ? metaTag.getAttribute(\'content\') : null;');
console.log('if (content) {');
console.log('  const [username, repo, branch] = content.split(\',\');');
console.log(`  console.log('Generated from:', username, '/', repo, 'on branch', branch);`);
console.log('}');
console.log('```');
console.log('');
console.log('✅ Implementation Complete!');
console.log('   The meta tag will now be automatically included in all generated HTML files.');
console.log('   It contains the current repository information at build time.');
