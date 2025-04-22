const fs = require('fs');
const { fetchTermsFromIndex, fetchAllTermsFromIndex } = require('./fetchTermsFromIndex.js');
const { matchTerm } = require('./matchTerm.js');
const { addPath, getPath, getAllPaths } = require('../config/paths');
const path = require('path');

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
            
            // First, fetch all terms from this repository
            const allTermsData = await fetchAllTermsFromIndex(
                GITHUB_API_TOKEN, 
                repoGroup.owner, 
                repoGroup.repo, 
                options
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
            
            // Log the terms we found with their mapping information
            console.log(`===== TERMS MAPPING DEBUG INFO =====`);
            console.log(`Repository: ${repoKey}`);
            allTermsData.terms.forEach(term => {
                console.log(`Term: ${term.term}`);
                console.log(`  Source File: ${term.sourceFile || 'null'}`);
                console.log(`  File Commit Hash: ${term.fileCommitHash || 'null'}`);
                console.log(`  Source Pattern Match: ${term.sourceFile ? 'YES' : 'NO'}`);
                console.log(`  Commit Hash Match: ${term.fileCommitHash ? 'YES' : 'NO'}`);
            });
            console.log(`===== END DEBUG INFO =====`);
            
            // Check for the terms directory to make sure it exists
            if (allTermsData.termsDir) {
                console.log(`Terms directory found: ${allTermsData.termsDir}`);
            } else {
                console.log(`⚠️ No terms directory found in specs.json. Check if spec_terms_directory is set correctly.`);
            }
            
            // Now process each term in this repository
            for (const xtref of repoGroup.xtrefs) {
                // Find the term in the pre-fetched data
                const foundTerm = allTermsData.terms.find(
                    t => t.term.toLowerCase() === xtref.term.toLowerCase()
                );
                
                if (foundTerm) {
                    // Use the file-specific commit hash if available, fall back to repo SHA if not
                    xtref.commitHash = foundTerm.fileCommitHash || allTermsData.sha;
                    xtref.sourceFile = foundTerm.sourceFile || null; // Store the source file path
                    xtref.content = foundTerm.definition;
                    xtref.avatarUrl = allTermsData.avatarUrl;
                    
                    console.log(`===== TERM PROCESSING DEBUG INFO =====`);
                    console.log(`Term: ${xtref.term}`);
                    console.log(`Using hash: ${xtref.commitHash}`);
                    console.log(`File hash available: ${foundTerm.fileCommitHash ? 'YES' : 'NO'}`);
                    console.log(`Repo hash fallback: ${!foundTerm.fileCommitHash ? 'YES - using ' + allTermsData.sha : 'NO'}`);
                    console.log(`===== END TERM DEBUG INFO =====`);
                    
                    if (foundTerm.fileCommitHash) {
                        console.log(`✅ Match found for term: ${xtref.term} in ${xtref.externalSpec} (file: ${foundTerm.sourceFile}, commit: ${foundTerm.fileCommitHash.substring(0, 7)}...)`);
                    } else {
                        console.log(`✅ Match found for term: ${xtref.term} in ${xtref.externalSpec} (using repo SHA)`);
                    }
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

        require('../../index.js')({ nowatch: true });
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

module.exports.processXTrefsData = processXTrefsData;