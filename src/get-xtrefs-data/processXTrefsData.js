const fs = require('fs');
const { fetchTermsFromGitHubRepository } = require('./fetchTermsFromGitHubRepository.js');
const { matchTerm } = require('./matchTerm.js');


async function processXTrefsData(allXTrefs, GITHUB_API_TOKEN, outputPathJSON, outputPathJS, outputPathJSTimeStamped) {
    try {
        for (let xtref of allXTrefs.xtrefs) {
            const fetchedData = await fetchTermsFromGitHubRepository(GITHUB_API_TOKEN, xtref.term, xtref.owner, xtref.repo, xtref.terms_dir);
            if (fetchedData.data.items.length === 0) {
                xtref.commitHash = "not found";
                xtref.content = "This term was not found in the external repository.";
            } else {
                fetchedData.data.items.forEach(item => {
                    console.log('KORKOR item: ', item);
                    if (matchTerm(item.content, xtref.term)) {
                        xtref.commitHash = item.sha;
                        xtref.content = item.content;
                        console.log(`\n   SPEC-UP-T: Match found for term: ${xtref.term} in ${xtref.externalSpec};`);
                    } else {
                        xtref.commitHash = "not found";
                        xtref.content = "This term was not found in the external repository.";
                        console.log(`\n   SPEC-UP-T: No match found for term: ${xtref.term} in ${xtref.externalSpec};`);
                    }
                });
            }
        }

        const allXTrefsStr = JSON.stringify(allXTrefs, null, 2);
        fs.writeFileSync(outputPathJSON, allXTrefsStr, 'utf8');
        const stringReadyForFileWrite = `const allXTrefs = ${allXTrefsStr};`;
        fs.writeFileSync(outputPathJS, stringReadyForFileWrite, 'utf8');
        fs.writeFileSync(outputPathJSTimeStamped, stringReadyForFileWrite, 'utf8');

        require('../../index.js')({ nowatch: true });
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

module.exports.processXTrefsData = processXTrefsData;