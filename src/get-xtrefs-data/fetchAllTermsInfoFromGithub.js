/* 
    Function to fetch all term information from GitHub. The function will not fetch the commit hash again if an entry already contains a commit hash.

    It checks if the xtref object already has a commitHash and content.If both are present, it skips fetching the term information from GitHub. This ensures that existing commit hashes are not overwritten.
*/

const { fetchFileContentFromCommit } = require('./fetchFileContentFromCommit');
const {setupFetchHeaders} = require('./setupFetchHeaders');
const {checkRateLimit} = require('./checkRateLimit');

async function fetchAllTermsInfoFromGithub(GITHUB_API_TOKEN, skipExisting, allXTrefs) {
    // Function to fetch term information from GitHub, including commit hash and content.
    async function fetchTermInfoFromGithub(GITHUB_API_TOKEN, xtref) {
        try {
            // prerequisite: filename should be the term in the match object with spaces replaced by dashes and all lowercase
            //TODO: Loop through all markdown files to find the term and get the filename, instead of assuming that the filename is the term with spaces replaced by dashes and all lowercase
            const url = `https://api.github.com/repos/${xtref.owner}/${xtref.repo}/commits?path=${xtref.terms_dir}/${xtref.term.replace(/ /g, '-').toLowerCase()}.md&per_page=1`;
            const response = await fetch(url, { headers: setupFetchHeaders(GITHUB_API_TOKEN) });

            // Check for rate limit before proceeding
            if (checkRateLimit(response)) {
                return;
            }

            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    const commitHash = data[0].sha;
                    const content = await fetchFileContentFromCommit(GITHUB_API_TOKEN, xtref.owner, xtref.repo, commitHash, `${xtref.terms_dir}/${xtref.term.replace(/ /g, '-').toLowerCase()}.md`);
                    return { commitHash, content };
                }
            } else {
                console.error(`\n   SPEC-UP-T: Failed to fetch commit hash for ${xtref.term}: ${response.statusText}\n`);
                return { commitHash: null, content: null };
            }
        } catch (error) {
            console.error(`\n   SPEC-UP-T: Error fetching data for term ${xtref.term}: ${error.message}\n`);
        }
        return null;
    }


    for (let xtref of allXTrefs.xtrefs) {
        if (!skipExisting || (!xtref.commitHash || !xtref.content)) {
            const fetchedData = await fetchTermInfoFromGithub(GITHUB_API_TOKEN, xtref);
            if (fetchedData) {
                xtref.commitHash = fetchedData.commitHash;
                xtref.content = fetchedData.content;
            }
        }
    }
}

exports.fetchAllTermsInfoFromGithub = fetchAllTermsInfoFromGithub;