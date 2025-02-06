const fs = require('fs');
const { fetchTermsFromGitHubRepository } = require('./fetchTermsFromGitHubRepository.js');
const { matchTerm } = require('./matchTerm.js');


async function processXTrefsData(allXTrefs, GITHUB_API_TOKEN, outputPathJSON, outputPathJS, outputPathJSTimeStamped, options) {
    try {
        for (let xtref of allXTrefs.xtrefs) {
            // Go and look if the term is in the external repository and if so, get the commit hash, and other meta info plus the content of the file
            const item = await fetchTermsFromGitHubRepository(GITHUB_API_TOKEN, xtref.term, xtref.owner, xtref.repo, xtref.terms_dir, options);

            // // Check if fetchedData.data is defined
            if (item !== null && matchTerm(item.content, xtref.term)) {
                xtref.commitHash = item.sha;
                xtref.content = item.content;
                xtref.avatarUrl = item.repository.owner.avatar_url;
                console.log(`\n   SPEC-UP-T: Match found for term: ${xtref.term} in ${xtref.externalSpec};`);
            } else {
                xtref.commitHash = "not found";
                xtref.content = "This term was not found in the external repository.";
                console.log(`\n   SPEC-UP-T: No match found for term: ${xtref.term} in ${xtref.externalSpec};`);
            }
        }

        const allXTrefsStr = JSON.stringify(allXTrefs, null, 2);
        fs.writeFileSync(outputPathJSON, allXTrefsStr, 'utf8');
        const stringReadyForFileWrite = `const allXTrefs = ${allXTrefsStr};`;
        fs.writeFileSync(outputPathJS, stringReadyForFileWrite, 'utf8');
        fs.writeFileSync(outputPathJSTimeStamped, stringReadyForFileWrite, 'utf8');

        require('../../index.js')({ nowatch: true });
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

module.exports.processXTrefsData = processXTrefsData;