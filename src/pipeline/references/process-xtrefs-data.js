const fs = require('fs');
const path = require('path');
const { fetchAllTermsFromIndex } = require('./fetch-terms-from-index');
const { getPath } = require('../../../config/paths');
const Logger = require('../../utils/logger');

const CACHE_DIR = getPath('githubcache');

async function processXTrefsData(allXTrefs, GITHUB_API_TOKEN, outputPathJSON, outputPathJS, outputPathJSTimeStamped) {
    try {
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }

        allXTrefs.xtrefs = allXTrefs.xtrefs.filter(xtref => {
            if (!xtref.owner || !xtref.repo || !xtref.repoUrl) {
                Logger.error(`Removing incomplete reference: ${xtref.externalSpec}, ${xtref.term}`);
                return false;
            }
            return true;
        });

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

        Logger.highlight(`Grouped ${allXTrefs.xtrefs.length} terms into ${Object.keys(xrefsByRepo).length} repositories`);

        for (const repoKey of Object.keys(xrefsByRepo)) {
            const repoGroup = xrefsByRepo[repoKey];
            Logger.process(`Processing repository: ${repoKey} (${repoGroup.xtrefs.length} terms)`);

            const ghPageUrl = repoGroup.xtrefs[0]?.ghPageUrl;
            const allTermsData = await fetchAllTermsFromIndex(
                GITHUB_API_TOKEN,
                repoGroup.owner,
                repoGroup.repo,
                { ghPageUrl }
            );

            if (!allTermsData) {
                Logger.error(`Could not fetch terms from repository ${repoKey}`);
                repoGroup.xtrefs.forEach(xtref => {
                    xtref.commitHash = 'not found';
                    xtref.content = 'This term was not found in the external repository.';
                    xtref.avatarUrl = null;
                });
                continue;
            }

            for (const xtref of repoGroup.xtrefs) {
                const foundTerm = allTermsData.terms.find(
                    t => t.term.toLowerCase() === xtref.term.toLowerCase()
                );

                if (foundTerm) {
                    xtref.commitHash = allTermsData.sha;
                    xtref.content = foundTerm.definition;
                    xtref.avatarUrl = allTermsData.avatarUrl;
                    Logger.success(`Match found for term: ${xtref.term} in ${xtref.externalSpec}`);
                } else {
                    xtref.commitHash = 'not found';
                    xtref.content = 'This term was not found in the external repository.';
                    xtref.avatarUrl = null;
                    
                    // Build a readable list of source files for the error message.
                    // Two possible data structures exist:
                    // 1. xtref.sourceFile is a STRING like "primitive.md"
                    // 2. xtref.sourceFiles is an ARRAY OF OBJECTS like [{file: "primitive.md", type: "xref"}]
                    //
                    // The ternary operator works as follows:
                    // - If xtref.sourceFile exists (legacy case) → use it directly (it's already a string)
                    // - Otherwise → extract file names from the sourceFiles array:
                    //   - .map(sf => sf.file) extracts just the filename from each object
                    //   - .join(', ') combines them into a comma-separated string
                    const sourceFilesList = xtref.sourceFile 
                        ? xtref.sourceFile 
                        : (xtref.sourceFiles || []).map(sf => sf.file).join(', ');

                    // Prefer an explicit repo URL if provided on the xtref, otherwise
                    // build a standard GitHub URL from the owner/repo.
                    const githubUrl = xtref.repoUrl || `https://github.com/${repoKey}`;

                    Logger.error(`Origin: ${sourceFilesList} 👉 No match found for term: ${xtref.term} in ${xtref.externalSpec} (${githubUrl})`);
                }
            }

            Logger.success(`Finished processing repository: ${repoKey}`);
            Logger.separator();
        }

        const allXTrefsStr = JSON.stringify(allXTrefs, null, 2);
        fs.writeFileSync(outputPathJSON, allXTrefsStr, 'utf8');
        const jsPayload = `const allXTrefs = ${allXTrefsStr};`;
    fs.writeFileSync(outputPathJS, jsPayload, 'utf8');
    fs.writeFileSync(outputPathJSTimeStamped, jsPayload, 'utf8');
    } catch (error) {
        Logger.error('An error occurred:', error);
    }
}

module.exports = {
    processXTrefsData
};
