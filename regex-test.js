// Direct regex test
const testMarkdown = 'Some text [[tref: vlei-glossary, vlei-ecosystem-governance-framework, vegf]] more text';
const escapedSpec = 'vlei\\-glossary';
const escapedTerm = 'vlei\\-ecosystem\\-governance\\-framework';
const regexPattern = `\\[\\[(?:x|t)ref:${escapedSpec},\\s*${escapedTerm}(?:,\\s*[^\\]]+)?\\]\\]`;

console.log('Test markdown:', testMarkdown);
console.log('Regex pattern:', regexPattern);

const regex = new RegExp(regexPattern, 'g');
console.log('Regex object:', regex);

const match = regex.test(testMarkdown);
console.log('Match result:', match);

// Let's also test a simpler case
const simpleRegex = /\[\[(?:x|t)ref:vlei\-glossary,\s*vlei\-ecosystem\-governance\-framework(?:,\s*[^\]]+)?\]\]/g;
console.log('Simple regex test:', simpleRegex.test(testMarkdown));

// Test even simpler
const verySimpleRegex = /vlei-glossary/;
console.log('Very simple test:', verySimpleRegex.test(testMarkdown));
