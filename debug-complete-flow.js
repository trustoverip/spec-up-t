const { processXTref, addNewXTrefsFromMarkdown, isXTrefInMarkdown } = require('./src/collect-external-references');

console.log('=== Complete External Reference Flow Debug ===\n');

// Simulate the exact workflow that happens during external reference collection
async function debugCompleteFlow() {
    console.log('1. Processing tref with alias:');
    const trefWithAlias = '[[tref: vlei-glossary, vlei-ecosystem-governance-framework, vegf]]';
    const parsedXtref = processXTref(trefWithAlias);
    console.log('   Input:', trefWithAlias);
    console.log('   Parsed:', JSON.stringify(parsedXtref, null, 4));
    console.log('   ✓ External spec:', parsedXtref.externalSpec);
    console.log('   ✓ Term for external lookup:', parsedXtref.term);
    console.log('   ✓ Alias for local use:', parsedXtref.alias);
    console.log('');

    console.log('2. Adding to external references collection:');
    const allXTrefs = { xtrefs: [] };
    const markdownContent = 'Some content with ' + trefWithAlias + ' in it.';
    const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, allXTrefs);
    console.log('   Markdown content:', markdownContent);
    console.log('   Created external references:', JSON.stringify(updatedXTrefs.xtrefs, null, 4));
    console.log('');

    console.log('3. Checking isXTrefInMarkdown:');
    const isFound = isXTrefInMarkdown(parsedXtref, markdownContent);
    console.log('   Can find in markdown:', isFound);
    console.log('');

    console.log('4. What gets passed to external fetching:');
    console.log('   The external fetcher will receive this object:');
    console.log('   {');
    console.log('     externalSpec:', parsedXtref.externalSpec);
    console.log('     term:', parsedXtref.term, '← This is used for external lookup');
    console.log('     alias:', parsedXtref.alias, '← This is NOT used for external lookup');
    console.log('   }');
    console.log('');

    console.log('5. External repository lookup simulation:');
    console.log('   External repo will search for term:', parsedXtref.term);
    console.log('   Case-insensitive match:', parsedXtref.term.toLowerCase());
    console.log('');

    console.log('6. Testing without alias for comparison:');
    const trefWithoutAlias = '[[tref: vlei-glossary, vlei-ecosystem-governance-framework]]';
    const parsedWithoutAlias = processXTref(trefWithoutAlias);
    console.log('   Input:', trefWithoutAlias);
    console.log('   Parsed:', JSON.stringify(parsedWithoutAlias, null, 4));
    
    const allXTrefs2 = { xtrefs: [] };
    const markdownContent2 = 'Some content with ' + trefWithoutAlias + ' in it.';
    const updatedXTrefs2 = addNewXTrefsFromMarkdown(markdownContent2, allXTrefs2);
    console.log('   Created external references:', JSON.stringify(updatedXTrefs2.xtrefs, null, 4));
    console.log('');

    console.log('7. Key comparison:');
    console.log('   With alias - External spec:', parsedXtref.externalSpec);
    console.log('   With alias - Term:', parsedXtref.term);
    console.log('   Without alias - External spec:', parsedWithoutAlias.externalSpec);
    console.log('   Without alias - Term:', parsedWithoutAlias.term);
    console.log('   Terms are identical:', parsedXtref.term === parsedWithoutAlias.term);
    console.log('   External specs are identical:', parsedXtref.externalSpec === parsedWithoutAlias.externalSpec);
    console.log('');

    console.log('8. Diagnosis:');
    console.log('   If external fetching still fails with alias but works without:');
    console.log('   - The issue is NOT in our alias implementation');
    console.log('   - The issue might be in the external repository configuration');
    console.log('   - Check if external spec "vlei-glossary" is correctly configured in specs.json');
    console.log('   - Verify the external repository URL and terms directory');
    console.log('   - Check network connectivity and GitHub API access');
}

debugCompleteFlow();
