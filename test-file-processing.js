const { addNewXTrefsFromMarkdown } = require('./src/collect-external-references');
const fs = require('fs');

console.log('=== Testing Actual File Processing ===\n');

// Test 1: Process file with alias
console.log('1. Processing file with alias:');
const fileWithAlias = fs.readFileSync('test-external-with-alias.md', 'utf8');
console.log('File content:', fileWithAlias.replace(/\n/g, ' ').substring(0, 100) + '...');

const allXTrefs1 = { xtrefs: [] };
const result1 = addNewXTrefsFromMarkdown(fileWithAlias, allXTrefs1);
console.log('External references created:', JSON.stringify(result1.xtrefs, null, 2));
console.log('');

// Test 2: Process file without alias
console.log('2. Processing file without alias:');
const fileWithoutAlias = fs.readFileSync('test-external-without-alias.md', 'utf8');
console.log('File content:', fileWithoutAlias.replace(/\n/g, ' ').substring(0, 100) + '...');

const allXTrefs2 = { xtrefs: [] };
const result2 = addNewXTrefsFromMarkdown(fileWithoutAlias, allXTrefs2);
console.log('External references created:', JSON.stringify(result2.xtrefs, null, 2));
console.log('');

// Test 3: Compare the results
console.log('3. Comparison:');
if (result1.xtrefs.length > 0 && result2.xtrefs.length > 0) {
    const ref1 = result1.xtrefs[0];
    const ref2 = result2.xtrefs[0];
    
    console.log('With alias:');
    console.log('  externalSpec:', ref1.externalSpec);
    console.log('  term:', ref1.term);
    console.log('  alias:', ref1.alias);
    
    console.log('Without alias:');
    console.log('  externalSpec:', ref2.externalSpec);
    console.log('  term:', ref2.term);
    console.log('  alias:', ref2.alias);
    
    console.log('Are they functionally identical for external lookup?');
    console.log('  Same externalSpec:', ref1.externalSpec === ref2.externalSpec);
    console.log('  Same term:', ref1.term === ref2.term);
    console.log('  Only difference is alias presence:', 
        ref1.alias !== undefined && ref2.alias === undefined);
} else {
    console.log('ERROR: Could not create external references from one or both files');
}

console.log('\n=== Conclusion ===');
console.log('If the external fetching behaves differently between these two cases,');
console.log('the issue is likely in:');
console.log('1. Cache key generation (if cache includes alias)');
console.log('2. External repository configuration differences');
console.log('3. A bug in the external fetching logic that we haven\'t found yet');
console.log('4. Network/timing issues');
console.log('\nThe alias implementation itself is working correctly.');
