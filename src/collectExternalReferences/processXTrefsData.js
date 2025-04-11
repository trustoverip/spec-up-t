const fs = require('fs');
const { fetchTermsFromGitHubRepository } = require('./fetchTermsFromGitHubRepository.js');
const { matchTerm } = require('./matchTerm.js');
const { addPath, getPath, getAllPaths } = require('../config/paths');

// Directory to store cached files
const CACHE_DIR = getPath('githubcache');

async function processXTrefsData(allXTrefs, GITHUB_API_TOKEN, outputPathJSON, outputPathJS, outputPathJSTimeStamped, options) {
    try {

        // Clear the cache (remove the cache directory) if the cache option is set to false
        if (options.cache === false) {
            if (fs.existsSync(CACHE_DIR)) {
                fs.rmdirSync(CACHE_DIR, { recursive: true });
            }
        }
        
        // Ensure the cache directory exists, so that we can store the fetched data
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }

        for (let xtref of allXTrefs.xtrefs) {
            // console.log('KORKORxtref: ', xtref);
            // Go and look if the term is in the external repository and if so, get the commit hash, and other meta info plus the content of the file
            const item = await fetchTermsFromGitHubRepository(GITHUB_API_TOKEN, xtref.term, xtref.owner, xtref.repo, xtref.terms_dir, options);
            console.log('KORKORxtref.term: ', xtref.term);
            console.log('KORKORitem: ', item);

            // // Check if fetchedData.data is defined
            // console.log('KORKORitem.content: ', item.content);
            if (item !== null && matchTerm(item.content, xtref.term)) {
                xtref.commitHash = item.sha;
                xtref.content = item.content;
                xtref.avatarUrl = item.repository.owner.avatar_url;
                console.log(`✅ Match found for term: ${xtref.term} in ${xtref.externalSpec};`);
                console.log("============================================\n\n");
            } else {
                xtref.commitHash = "not found";
                xtref.content = "This term was not found in the external repository.";
                console.log(`ℹ️ No match found for term: ${xtref.term} in ${xtref.externalSpec};`);
                console.log("============================================\n\n");
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