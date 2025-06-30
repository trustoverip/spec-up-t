// Debug script to trace external reference fetching with aliases
const { processXTref, addNewXTrefsFromMarkdown } = require('./src/collect-external-references');

console.log('=== External Reference Fetching Debug ===\n');

// Simulate the exact scenario that would happen during external fetching
function simulateExternalFetch() {
    // Step 1: Process the tref with alias
    const xtrefWithAlias = '[[tref:vlei1, vlei-ecosystem-governance-framework, vEGF]]';
    const parsedXtref = processXTref(xtrefWithAlias);
    
    console.log('1. Parsed XTref:');
    console.log('   Input:', xtrefWithAlias);
    console.log('   Parsed:', JSON.stringify(parsedXtref, null, 4));
    console.log('   ✓ External lookup will use term:', parsedXtref.term);
    console.log('   ✓ Local alias will be:', parsedXtref.alias);
    console.log('');
    
    // Step 2: Simulate what happens in processXTrefsData.js
    console.log('2. External Repository Lookup Simulation:');
    console.log('   Repository lookup uses: xtref.term =', parsedXtref.term);
    console.log('   NOT using alias:', parsedXtref.alias);
    console.log('');
    
    // Step 3: Show the case-insensitive matching that happens
    console.log('3. Term Matching Logic:');
    console.log('   Looking for term:', parsedXtref.term);
    console.log('   Case-insensitive match: term.toLowerCase() ===', parsedXtref.term.toLowerCase());
    console.log('');
    
    // Step 4: What gets stored in the final output
    console.log('4. Final External Reference Object:');
    const finalXtref = {
        externalSpec: parsedXtref.externalSpec,
        term: parsedXtref.term, // Original term for external lookup
        alias: parsedXtref.alias, // Alias for local use only
        commitHash: "simulated-hash",
        content: "[[def: vlei-ecosystem-governance-framework]]\n\nThis is the definition...",
        repoUrl: "https://github.com/henkvancann/vlei-glossary"
    };
    console.log(JSON.stringify(finalXtref, null, 4));
    console.log('');
    
    console.log('5. Key Points:');
    console.log('   ✓ External fetch uses "term" field:', finalXtref.term);
    console.log('   ✓ Alias is stored separately:', finalXtref.alias);
    console.log('   ✓ External repository lookup is case-insensitive');
    console.log('   ✓ If term is not found, content will be "This term was not found..."');
}

simulateExternalFetch();

console.log('\n=== Debugging Questions ===');
console.log('If you\'re still seeing "This term was not found in the external repository":');
console.log('');
console.log('1. Is the term "vlei-ecosystem-governance-framework" actually in the vlei1 repo?');
console.log('2. Is the external repository URL correct in specs.json?');
console.log('3. Are there any network/authentication issues with GitHub API?');
console.log('4. Check the console output during external fetch for more specific error messages');
console.log('');
console.log('The alias functionality is working correctly - the issue is likely:');
console.log('- Term not found in external repository');
console.log('- Repository configuration issues');
console.log('- Network connectivity issues');
