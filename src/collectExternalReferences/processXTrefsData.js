const fs = require('fs');
const { fetchTermsFromIndex, fetchAllTermsFromIndex } = require('./fetchTermsFromIndex.js');
const { matchTerm } = require('./matchTerm.js');
const { addPath, getPath, getAllPaths } = require('../../config/paths');
const path = require('path');

// Directory to store fetched data files
const CACHE_DIR = getPath('githubcache');

async function processXTrefsData(allXTrefs, GITHUB_API_TOKEN, outputPathJSON, outputPathJS, outputPathJSTimeStamped) {
    try {
        // Ensure the directory exists, so that we can store the fetched data
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }
        
        // Filter out incomplete xtrefs that don't have proper repository information
        allXTrefs.xtrefs = allXTrefs.xtrefs.filter(xtref => {
            if (!xtref.owner || !xtref.repo || !xtref.repoUrl) {
                console.log(`⚠️ Removing incomplete reference: ${xtref.externalSpec}, ${xtref.term}`);
                return false;
            }
            return true;
        });
        
        // Group xtrefs by repository to avoid multiple downloads of the same index.html
        const xrefsByRepo = allXTrefs.xtrefs.reduce((groups, xtref) => {
            const repoKey = `${xtref.owner}/${xtref.repo}`;
            if (!groups[repoKey]) {
                groups[repoKey] = {
                    owner: xtref.owner,
                    repo: xtref.repo,
                    xtrefs: []
                };
            }
            groups[repoKey].xtrefs.push(xtref);
            return groups;
        }, {});

        console.log(`✅ Grouped ${allXTrefs.xtrefs.length} terms into ${Object.keys(xrefsByRepo).length} repositories`);
        
        // Process each repository once
        for (const repoKey of Object.keys(xrefsByRepo)) {
            const repoGroup = xrefsByRepo[repoKey];
            console.log(`Processing repository: ${repoKey} (${repoGroup.xtrefs.length} terms)`);
            
            // Get the GitHub Pages URL from the first xtref in this repo group
            const ghPageUrl = repoGroup.xtrefs[0]?.ghPageUrl;
            
            // First, fetch all terms from this repository
            const allTermsData = await fetchAllTermsFromIndex(
                GITHUB_API_TOKEN, 
                repoGroup.owner, 
                repoGroup.repo, 
                { 
                    ghPageUrl: ghPageUrl // Pass the GitHub Pages URL
                }
            );
            
            if (!allTermsData) {
                console.log(`❌ Could not fetch terms from repository ${repoKey}`);
                // Mark all terms from this repo as not found
                repoGroup.xtrefs.forEach(xtref => {
                    xtref.commitHash = "not found";
                    xtref.content = "This term was not found in the external repository.";
                    xtref.avatarUrl = null;
                });
                continue; // Skip to next repository
            }
            
            // Now process each term in this repository
            for (const xtref of repoGroup.xtrefs) {
                // Find the term in the pre-fetched data
                const foundTerm = allTermsData.terms.find(
                    t => t.term.toLowerCase() === xtref.term.toLowerCase()
                );
                
                if (foundTerm) {
                    xtref.commitHash = allTermsData.sha;
                    xtref.content = foundTerm.definition;
                    xtref.avatarUrl = allTermsData.avatarUrl;
                    console.log(`✅ Match found for term: ${xtref.term} in ${xtref.externalSpec}`);
                } else {
                    xtref.commitHash = "not found";
                    xtref.content = "This term was not found in the external repository.";
                    xtref.avatarUrl = null;
                    console.log(`ℹ️ No match found for term: ${xtref.term} in ${xtref.externalSpec}`);
                }
            }
            
            console.log(`✅ Finished processing repository: ${repoKey}`);
            console.log("============================================\n\n");
        }

        const allXTrefsStr = JSON.stringify(allXTrefs, null, 2);
        fs.writeFileSync(outputPathJSON, allXTrefsStr, 'utf8');
        const stringReadyForFileWrite = `const allXTrefs = ${allXTrefsStr};`;
        fs.writeFileSync(outputPathJS, stringReadyForFileWrite, 'utf8');
        fs.writeFileSync(outputPathJSTimeStamped, stringReadyForFileWrite, 'utf8');

        // This will run index.js
        require('../../index.js')({ nowatch: true });
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

module.exports.processXTrefsData = processXTrefsData;