// Test to check if there's any issue with JSON serialization or other processing
const { addNewXTrefsFromMarkdown } = require('./src/collect-external-references');

console.log('=== Testing JSON Serialization and Object Integrity ===\n');

// Create external references with and without aliases
const markdownWithAlias = '[[tref: vlei-glossary, vlei-ecosystem-governance-framework, vegf]]';
const markdownWithoutAlias = '[[tref: vlei-glossary, vlei-ecosystem-governance-framework]]';

const allXTrefs1 = { xtrefs: [] };
const result1 = addNewXTrefsFromMarkdown(markdownWithAlias, allXTrefs1);

const allXTrefs2 = { xtrefs: [] };
const result2 = addNewXTrefsFromMarkdown(markdownWithoutAlias, allXTrefs2);

console.log('1. Original objects:');
console.log('With alias:', JSON.stringify(result1.xtrefs[0], null, 2));
console.log('Without alias:', JSON.stringify(result2.xtrefs[0], null, 2));
console.log('');

console.log('2. Testing JSON serialization/parsing:');
const serialized1 = JSON.stringify(result1);
const parsed1 = JSON.parse(serialized1);
console.log('With alias after JSON round-trip:', JSON.stringify(parsed1.xtrefs[0], null, 2));

const serialized2 = JSON.stringify(result2);
const parsed2 = JSON.parse(serialized2);
console.log('Without alias after JSON round-trip:', JSON.stringify(parsed2.xtrefs[0], null, 2));
console.log('');

console.log('3. Testing object property access:');
const objWithAlias = result1.xtrefs[0];
const objWithoutAlias = result2.xtrefs[0];

console.log('With alias - hasOwnProperty("alias"):', objWithAlias.hasOwnProperty('alias'));
console.log('With alias - alias value:', objWithAlias.alias);
console.log('With alias - alias is undefined?', objWithAlias.alias === undefined);
console.log('With alias - alias is null?', objWithAlias.alias === null);
console.log('With alias - alias is truthy?', !!objWithAlias.alias);

console.log('Without alias - hasOwnProperty("alias"):', objWithoutAlias.hasOwnProperty('alias'));
console.log('Without alias - alias value:', objWithoutAlias.alias);
console.log('Without alias - alias is undefined?', objWithoutAlias.alias === undefined);
console.log('');

console.log('4. Testing term comparison:');
console.log('Terms are identical?', objWithAlias.term === objWithoutAlias.term);
console.log('External specs are identical?', objWithAlias.externalSpec === objWithoutAlias.externalSpec);
console.log('Term values:');
console.log('  With alias:', `"${objWithAlias.term}"`);
console.log('  Without alias:', `"${objWithoutAlias.term}"`);
console.log('  Lengths:', objWithAlias.term.length, 'vs', objWithoutAlias.term.length);
console.log('');

console.log('5. Checking for hidden characters:');
function analyzeString(str, label) {
    console.log(`${label}:`);
    console.log(`  String: "${str}"`);
    console.log(`  Length: ${str.length}`);
    console.log(`  Bytes:`, str.split('').map(c => c.charCodeAt(0)));
}

analyzeString(objWithAlias.term, 'Term with alias');
analyzeString(objWithoutAlias.term, 'Term without alias');
analyzeString(objWithAlias.externalSpec, 'External spec with alias');
analyzeString(objWithoutAlias.externalSpec, 'External spec without alias');
