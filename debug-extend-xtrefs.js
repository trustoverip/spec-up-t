// Test the extendXTrefs function to see if the alias affects repository lookup
const { addNewXTrefsFromMarkdown } = require('./src/collect-external-references');

console.log('=== Testing extendXTrefs Impact ===\n');

// Simulate the extendXTrefs function behavior
function simulateExtendXTrefs(xtref, externalSpecs) {
    console.log('Input xtref:', JSON.stringify(xtref, null, 2));
    
    // This mimics the logic in extendXTrefs
    xtref.repoUrl = null;
    xtref.terms_dir = null;
    xtref.owner = null;
    xtref.repo = null;

    externalSpecs.forEach(repo => {
        console.log('Checking repo:', JSON.stringify(repo, null, 2));
        console.log('Comparing:', repo.external_spec, '===', xtref.externalSpec);
        
        if (repo.external_spec === xtref.externalSpec) {
            console.log('✅ Match found!');
            xtref.repoUrl = repo.url;
            xtref.terms_dir = repo.terms_dir;
            
            if (xtref.repoUrl) {
                const urlParts = new URL(xtref.repoUrl).pathname.split('/');
                xtref.owner = urlParts[1];
                xtref.repo = urlParts[2];
                console.log('✅ Repository info extracted:');
                console.log('  owner:', xtref.owner);
                console.log('  repo:', xtref.repo);
                console.log('  repoUrl:', xtref.repoUrl);
                console.log('  terms_dir:', xtref.terms_dir);
            }
        } else {
            console.log('❌ No match');
        }
    });
    
    console.log('Final xtref:', JSON.stringify(xtref, null, 2));
    return xtref;
}

// Create test cases
const markdownWithAlias = '[[tref: vlei-glossary, vlei-ecosystem-governance-framework, vegf]]';
const markdownWithoutAlias = '[[tref: vlei-glossary, vlei-ecosystem-governance-framework]]';

const allXTrefs1 = { xtrefs: [] };
const result1 = addNewXTrefsFromMarkdown(markdownWithAlias, allXTrefs1);

const allXTrefs2 = { xtrefs: [] };
const result2 = addNewXTrefsFromMarkdown(markdownWithoutAlias, allXTrefs2);

// Your external specs configuration
const externalSpecs = [
    {
        "external_spec": "test-1",
        "gh_page": "https://blockchainbird.github.io/spec-up-xref-test-1/",
        "url": "https://github.com/blockchainbird/spec-up-xref-test-1",
        "terms_dir": "spec/term-definitions"
    },
    {
        "external_spec": "test-2",
        "gh_page": "https://blockchainbird.github.io/spec-up-xref-test-2/",
        "url": "https://github.com/blockchainbird/spec-up-xref-test-2",
        "terms_dir": "spec/term-definitions"
    },
    {
        "external_spec": "toip1",
        "gh_page": "https://henkvancann.github.io/ctwg-main-glossary/",
        "url": "https://github.com/henkvancann/ctwg-main-glossary",
        "terms_dir": "spec/terms-definitions"
    },
    {
        "url": "https://github.com/henkvancann/vlei-glossary",
        "gh_page": "https://henkvancann.github.io/vlei-glossary/",
        "terms_dir": "spec/terms-definitions",
        "external_spec": "vlei-glossary"
    }
];

console.log('1. Testing xtref WITH alias:');
const xtrefWithAlias = { ...result1.xtrefs[0] };
simulateExtendXTrefs(xtrefWithAlias, externalSpecs);
console.log('');

console.log('2. Testing xtref WITHOUT alias:');
const xtrefWithoutAlias = { ...result2.xtrefs[0] };
simulateExtendXTrefs(xtrefWithoutAlias, externalSpecs);
console.log('');

console.log('3. Final comparison:');
console.log('With alias final state:', JSON.stringify(xtrefWithAlias, null, 2));
console.log('Without alias final state:', JSON.stringify(xtrefWithoutAlias, null, 2));

console.log('Repository info identical?');
console.log('  Same owner:', xtrefWithAlias.owner === xtrefWithoutAlias.owner);
console.log('  Same repo:', xtrefWithAlias.repo === xtrefWithoutAlias.repo);
console.log('  Same repoUrl:', xtrefWithAlias.repoUrl === xtrefWithoutAlias.repoUrl);
console.log('  Same terms_dir:', xtrefWithAlias.terms_dir === xtrefWithoutAlias.terms_dir);
