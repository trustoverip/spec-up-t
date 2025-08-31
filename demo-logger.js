#!/usr/bin/env node

/**
 * Demo script showing the improved console output with chalk colors
 */

const Logger = require('./src/utils/logger');

console.log('\n' + '='.repeat(60));
console.log('SPEC-UP-T IMPROVED CONSOLE OUTPUT DEMO');
console.log('='.repeat(60) + '\n');

// Demo different log types
Logger.success('Successfully processed external references');
Logger.error('Failed to fetch terms from repository user/repo');
Logger.warn('Missing GitHub Personal Access Token');
Logger.info('Processing 15 terms from external specifications');
Logger.process('Processing repository: blockchain-bird/keri (8 terms)');
Logger.highlight('Grouped 42 terms into 6 repositories');

console.log('\n' + '-'.repeat(40));
console.log('PROGRESS INDICATORS:');
console.log('-'.repeat(40));

// Demo progress indicators
Logger.progress(1, 5, 'Fetching repository data');
Logger.progress(3, 5, 'Processing terms');
Logger.progress(5, 5, 'Writing output files');

console.log('\n');
Logger.separator();

// Demo structured output
Logger.info('External reference processing complete');
Logger.highlight('Files generated:');
console.log('  • allXTrefs.json');
console.log('  • allXTrefs.js');
console.log('  • allXTrefs_timestamped.js');

Logger.separator();
Logger.success('Console output improvements successfully installed! 🎉');

console.log('\nBefore (plain text):');
console.log('✅ Grouped 42 terms into 6 repositories');
console.log('ℹ️ No match found for term: alice in external-spec');

console.log('\nAfter (with colors and improved formatting):');
Logger.highlight('Grouped 42 terms into 6 repositories');
Logger.info('No match found for term: alice in external-spec');

console.log('\n' + '='.repeat(60) + '\n');
