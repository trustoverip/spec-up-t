// Debug script to test the complete alias workflow
const { processXTref, addNewXTrefsFromMarkdown } = require('./src/collect-external-references');

console.log('=== Testing Complete Alias Workflow ===\n');

// Test 1: Basic alias processing
console.log('1. Testing processXTref with alias:');
const trefWithAlias = '[[tref: vlei-glossary, vlei-ecosystem-governance-framework, vegf]]';
const parsed = processXTref(trefWithAlias);
console.log('Input:', trefWithAlias);
console.log('Parsed:', JSON.stringify(parsed, null, 2));
console.log('✓ Expected: externalSpec="vlei-glossary", term="vlei-ecosystem-governance-framework", alias="vegf"');
console.log('');

// Test 2: External reference collection
console.log('2. Testing addNewXTrefsFromMarkdown:');
const markdown = `# Test Document

## Terms and definitions intro

External reference with alias: ${trefWithAlias}

Some other content here.
`;

const allXTrefs = { xtrefs: [] };
const result = addNewXTrefsFromMarkdown(markdown, allXTrefs);
console.log('Created external references:', JSON.stringify(result.xtrefs, null, 2));
console.log('✓ Expected: One xtref with original term for lookup, alias stored separately');
console.log('');

// Test 3: Check if the reference would be found in markdown
const { isXTrefInMarkdown } = require('./src/collect-external-references');
const foundInMarkdown = isXTrefInMarkdown(parsed, markdown);
console.log('3. Testing isXTrefInMarkdown:');
console.log('Can find reference in markdown:', foundInMarkdown);
console.log('✓ Expected: true');
console.log('');

console.log('=== Summary ===');
console.log('If these tests pass but the issue persists, the problem is likely in:');
console.log('1. External repository fetching (network/auth issues)');
console.log('2. HTML generation differences between alias and non-alias cases');
console.log('3. Client-side JavaScript execution or timing issues');
console.log('4. Missing specs.json configuration');
