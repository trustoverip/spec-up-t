const { processXTref, addNewXTrefsFromMarkdown, isXTrefInMarkdown } = require('./src/collect-external-references');

console.log('=== Debugging Your Specific Cases ===\n');

// Test your exact failing and working cases
const failingCase = '[[tref: vlei-glossary, vlei-ecosystem-governance-framework, vegf]]';
const workingCase = '[[tref: vlei-glossary, vlei-ecosystem-governance-framework]]';

console.log('1. Testing failing case (with alias):');
console.log('Input:', failingCase);
const failingParsed = processXTref(failingCase);
console.log('Parsed:', JSON.stringify(failingParsed, null, 2));

const markdownWithFailing = `Some content ${failingCase} more content`;
console.log('Markdown content:', markdownWithFailing);

const allXTrefsFailing = { xtrefs: [] };
const resultFailing = addNewXTrefsFromMarkdown(markdownWithFailing, allXTrefsFailing);
console.log('External references created:', JSON.stringify(resultFailing.xtrefs, null, 2));

console.log('Can find in markdown:', isXTrefInMarkdown(failingParsed, markdownWithFailing));
console.log('');

console.log('2. Testing working case (without alias):');
console.log('Input:', workingCase);
const workingParsed = processXTref(workingCase);
console.log('Parsed:', JSON.stringify(workingParsed, null, 2));

const markdownWithWorking = `Some content ${workingCase} more content`;
console.log('Markdown content:', markdownWithWorking);

const allXTrefsWorking = { xtrefs: [] };
const resultWorking = addNewXTrefsFromMarkdown(markdownWithWorking, allXTrefsWorking);
console.log('External references created:', JSON.stringify(resultWorking.xtrefs, null, 2));

console.log('Can find in markdown:', isXTrefInMarkdown(workingParsed, markdownWithWorking));
console.log('');

console.log('3. Key differences analysis:');
console.log('Both should be functionally identical for external lookup:');
console.log('  Failing - externalSpec:', failingParsed.externalSpec);
console.log('  Working - externalSpec:', workingParsed.externalSpec);
console.log('  Same external spec?', failingParsed.externalSpec === workingParsed.externalSpec);
console.log('');
console.log('  Failing - term:', failingParsed.term);
console.log('  Working - term:', workingParsed.term);
console.log('  Same term?', failingParsed.term === workingParsed.term);
console.log('');
console.log('  Failing - alias:', failingParsed.alias);
console.log('  Working - alias:', workingParsed.alias);
console.log('');

console.log('4. Testing with your toip1 example:');
const toip1Case = '[[tref: toip1, non-transferable-identifier, nti]]';
console.log('Input:', toip1Case);
const toip1Parsed = processXTref(toip1Case);
console.log('Parsed:', JSON.stringify(toip1Parsed, null, 2));

const markdownWithToip1 = `Some content ${toip1Case} more content`;
const allXTrefsToip1 = { xtrefs: [] };
const resultToip1 = addNewXTrefsFromMarkdown(markdownWithToip1, allXTrefsToip1);
console.log('External references created:', JSON.stringify(resultToip1.xtrefs, null, 2));
console.log('');

console.log('=== Summary ===');
console.log('All three cases should create identical external reference objects');
console.log('for lookup purposes (ignoring the alias field).');
console.log('If external fetching fails for any of these, the issue is likely:');
console.log('1. External repository configuration');
console.log('2. Network/API issues');
console.log('3. A bug we haven\'t found yet in the external fetching logic');
