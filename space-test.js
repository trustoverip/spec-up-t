const testMarkdown = 'Some text [[tref: vlei-glossary, vlei-ecosystem-governance-framework, vegf]] more text';

console.log('Analyzing spaces in markdown:');
const match = testMarkdown.match(/\[\[tref:[^\]]+\]\]/);
if (match) {
    console.log('Matched text:', JSON.stringify(match[0]));
    console.log('Character by character:');
    for (let i = 0; i < match[0].length; i++) {
        const char = match[0][i];
        console.log(`${i}: "${char}" (${char.charCodeAt(0)})`);
    }
} else {
    console.log('No match found');
}

// Test with correct spacing
const correctRegex = /\[\[(?:x|t)ref:\s*vlei\-glossary,\s*vlei\-ecosystem\-governance\-framework(?:,\s*[^\]]+)?\]\]/g;
console.log('\nTest with corrected regex:', correctRegex.test(testMarkdown));
