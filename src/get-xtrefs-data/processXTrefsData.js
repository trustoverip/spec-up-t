const fs = require('fs');
const { fetchTermsFromGitHubRepository } = require('./fetchTermsFromGitHubRepository.js');
const { matchTerm } = require('./matchTerm.js');


async function processXTrefsData(allXTrefs, GITHUB_API_TOKEN, outputPathJSON, outputPathJS, outputPathJSTimeStamped) {
    try {
        for (let xtref of allXTrefs.xtrefs) {
            // Go and look if the term is in the external repository and if so, get the commit hash, and other meta info plus the content of the file
            const fetchedData = await fetchTermsFromGitHubRepository(GITHUB_API_TOKEN, xtref.term, xtref.owner, xtref.repo, xtref.terms_dir);

            // A lot of meta info is returned anyway but maybe there are no matches (items) 
            if (fetchedData.data.items.length === 0) {
                xtref.commitHash = "not found";
                xtref.content = "This term was not found in the external repository.";
            } else {
                // In case there are matches (items) we need to check if the term is in the content of the file
                fetchedData.data.items.forEach(item => {

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