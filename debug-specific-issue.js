const { processXTref, isXTrefInMarkdown } = require('./src/collect-external-references');

console.log('=== Debugging Specific Issue ===\n');

// Test the exact case that's failing
const failingCase = '[[tref: vlei-glossary, vlei-ecosystem-governance-framework, vegf]]';
const workingCase = '[[tref: vlei-glossary, vlei-ecosystem-governance-framework]]';

console.log('1. Processing failing case:');
console.log('Input:', failingCase);
const failingResult = processXTref(failingCase);
console.log('Parsed:', JSON.stringify(failingResult, null, 2));
console.log('');

console.log('2. Processing working case:');
console.log('Input:', workingCase);
const workingResult = processXTref(workingCase);
console.log('Parsed:', JSON.stringify(workingResult, null, 2));
console.log('');

console.log('3. Testing isXTrefInMarkdown with both cases:');
const testMarkdownFailing = 'Some text [[tref: vlei-glossary, vlei-ecosystem-governance-framework, vegf]] more text';
const testMarkdownWorking = 'Some text [[tref: vlei-glossary, vlei-ecosystem-governance-framework]] more text';

console.log('Testing regex with failing case:');
console.log('Markdown:', testMarkdownFailing);
console.log('XTref object:', JSON.stringify(failingResult, null, 2));
const isFoundFailing = isXTrefInMarkdown(failingResult, testMarkdownFailing);
console.log('Found in markdown:', isFoundFailing);
console.log('');

console.log('Testing regex with working case:');
console.log('Markdown:', testMarkdownWorking);
console.log('XTref object:', JSON.stringify(workingResult, null, 2));
const isFoundWorking = isXTrefInMarkdown(workingResult, testMarkdownWorking);
console.log('Found in markdown:', isFoundWorking);
console.log('');

console.log('4. Checking regex pattern:');
console.log('Pattern for failing case:');
const escapedSpec = failingResult.externalSpec.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
const escapedTerm = failingResult.term.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
const regexPattern = `\\[\\[(?:x|t)ref:${escapedSpec},\\s*${escapedTerm}(?:,\\s*[^\\]]+)?\\]\\]`;
console.log('Escaped spec:', escapedSpec);
console.log('Escaped term:', escapedTerm);
console.log('Regex pattern:', regexPattern);
console.log('');

console.log('5. Key differences:');
console.log('Failing spec:', failingResult.externalSpec);
console.log('Working spec:', workingResult.externalSpec);
console.log('Failing term:', failingResult.term);
console.log('Working term:', workingResult.term);
console.log('Failing alias:', failingResult.alias);
console.log('Working alias:', workingResult.alias);
