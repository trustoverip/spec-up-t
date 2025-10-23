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
                Logger.error(`Removing incomplete reference: ${xtref.externalSpec}, ${xtref.term}`, {
                    context: 'External reference is missing required repository information',
                    hint: 'Verify external_specs configuration in specs.json includes github_repo_url for each entry',
                    details: `Missing: ${!xtref.owner ? 'owner' : ''} ${!xtref.repo ? 'repo' : ''} ${!xtref.repoUrl ? 'repoUrl' : ''}`
                });
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
            // Build a repository URL for logging. Prefer an explicit repoUrl from
            // an xtref, otherwise fall back to the canonical GitHub URL.
            const repoUrl = repoGroup.xtrefs[0]?.repoUrl || `https://github.com/${repoKey}`;
            Logger.process(`Processing repository: ${repoKey} (${repoGroup.xtrefs.length} terms) - ${repoUrl}`);

            const ghPageUrl = repoGroup.xtrefs[0]?.ghPageUrl;
            const allTermsData = await fetchAllTermsFromIndex(
                GITHUB_API_TOKEN,
                repoGroup.owner,
                repoGroup.repo,
                { ghPageUrl }
            );

            if (!allTermsData) {
                Logger.error(`Could not fetch terms from repository ${repoKey}`, {
                    context: `Failed to retrieve terminology from ${repoUrl}`,
                    hint: 'Ensure the repository exists, is accessible, and has published its spec. If it\'s private, set GITHUB_PAT environment variable',
                    details: `Repository: ${repoUrl}. Check if GitHub Pages is enabled or if the repo has a valid specs.json`
                });
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
                    // Copy the classes array from the foundTerm to identify if this is a local or external term.
                    // This helps determine if a tref to an external resource is itself a tref (term-external).
                    xtref.classes = foundTerm.classes || [];

                    // Check if this is a tref to an external tref (nested tref)
                    // A term with 'term-external' class means it's transcluded from another spec
                    const isExternalTref = foundTerm.classes && foundTerm.classes.includes('term-external');
                    const isTref = xtref.sourceFiles && xtref.sourceFiles.some(sf => sf.type === 'tref');
                    const isXref = xtref.sourceFiles && xtref.sourceFiles.some(sf => sf.type === 'xref');

                    if (isExternalTref && isTref) {
                        // Build a readable list of source files for the error message
                        const sourceFilesList = xtref.sourceFile
                            ? xtref.sourceFile
                            : (xtref.sourceFiles || []).map(sf => sf.file).join(', ');

                        // Construct the external repository URL
                        const externalRepoUrl = xtref.ghPageUrl || xtref.repoUrl || `https://github.com/${xtref.owner}/${xtref.repo}`;

                        Logger.error(`NESTED TREF DETECTED: Term "${xtref.term}" in ${xtref.externalSpec}`, {
                            context: `Origin: ${sourceFilesList} - This term is itself a tref transcluded from another spec`,
                            hint: 'Avoid chaining trefs (tref → tref). Either reference the original source spec directly, or define the term locally',
                            details: `Repository: ${externalRepoUrl}. Nested trefs create complex dependency chains`
                        });
                    }

                    if (isExternalTref && isXref) {
                        // Build a readable list of source files for the warning message
                        const sourceFilesList = xtref.sourceFile
                            ? xtref.sourceFile
                            : (xtref.sourceFiles || []).map(sf => sf.file).join(', ');

                        // Construct the external repository URL
                        const externalRepoUrl = xtref.ghPageUrl || xtref.repoUrl || `https://github.com/${xtref.owner}/${xtref.repo}`;

                        Logger.error(`NESTED XREF DETECTED: Term "${xtref.term}" in ${xtref.externalSpec}`, {
                            context: `Origin: ${sourceFilesList} - This xref points to a term that is already transcluded elsewhere`,
                            hint: 'Use [[xref]] only for terms directly defined in the external spec. For nested refs, reference the original source',
                            details: `Repository: ${externalRepoUrl}. This creates a chain of external references`
                        });
                    }

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

                    Logger.error(`No match found for term: ${xtref.term} in ${xtref.externalSpec}`, {
                        context: `Origin: ${sourceFilesList} - Term not found in external repository`,
                        hint: 'Check if the term exists in the external spec. Verify spelling, ensure the external spec has published, and confirm the term is in their terminology section',
                        details: `Repository: ${githubUrl}. The term may have been renamed or removed`
                    });
                }
            }

            Logger.success(`Finished processing repository: ${repoKey} (${repoUrl})`);
            Logger.separator();
        }

        const allXTrefsStr = JSON.stringify(allXTrefs, null, 2);
        fs.writeFileSync(outputPathJSON, allXTrefsStr, 'utf8');
        const jsPayload = `const allXTrefs = ${allXTrefsStr};`;
        fs.writeFileSync(outputPathJS, jsPayload, 'utf8');
        fs.writeFileSync(outputPathJSTimeStamped, jsPayload, 'utf8');
    } catch (error) {
        Logger.error('An error occurred during xtrefs processing', {
            context: 'Failed while processing external references and fetching terms',
            hint: 'Check your internet connection, verify GITHUB_PAT is set if needed, and ensure specs.json external_specs configuration is correct',
            details: error.message
        });
    }
}

module.exports = {
    processXTrefsData
};
