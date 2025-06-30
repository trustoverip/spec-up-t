const { processXTref, addNewXTrefsFromMarkdown } = require('./src/collect-external-references');

// Test the external reference processing
console.log('=== Testing External Reference Processing ===\n');

// Test 1: processXTref with alias
console.log('Test 1: processXTref with alias');
const xtrefWithAlias = '[[tref:test-1, some-test-term, STT]]';
const result = processXTref(xtrefWithAlias);
console.log('Input:', xtrefWithAlias);
console.log('Output:', JSON.stringify(result, null, 2));
console.log('✓ Expected: term="some-test-term", alias="STT"');
console.log('');

// Test 2: addNewXTrefsFromMarkdown with alias
console.log('Test 2: addNewXTrefsFromMarkdown with alias');
const markdownContent = 'Test [[tref:test-1, some-test-term, STT]] content';
const allXTrefs = { xtrefs: [] };
const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, allXTrefs);
console.log('Input markdown:', markdownContent);
console.log('Output xtrefs:', JSON.stringify(updatedXTrefs.xtrefs, null, 2));
console.log('✓ Expected: One xtref with term="some-test-term", alias="STT"');
console.log('');

// Test 3: Multiple aliases for same term
console.log('Test 3: Multiple aliases for same term');
const markdownWithMultipleAliases = `
    First: [[tref:test-1, some-test-term, STT]]
    Second: [[tref:test-1, some-test-term, ALIAS2]]
    Third: [[tref:test-1, some-test-term]]
`;
const allXTrefs2 = { xtrefs: [] };
const updatedXTrefs2 = addNewXTrefsFromMarkdown(markdownWithMultipleAliases, allXTrefs2);
console.log('Input markdown:', markdownWithMultipleAliases.replace(/\n/g, ' ').trim());
console.log('Output xtrefs:', JSON.stringify(updatedXTrefs2.xtrefs, null, 2));
console.log('✓ Expected: Only ONE xtref despite multiple aliases');
console.log('');

console.log('=== Debug Complete ===');
