/**
 * @file This script is responsible for fetching the latest commit hash of term files from the GitHub API and generating both a JavaScript file and a JSON file containing the data for the cross-references (xrefs). 
 * 
 * The generated JavaScript file is included in the HTML output of the specification, serving as a data source for the JavaScript code embedded in the HTML file. 
 * 
 * Additionally, the data is written to a JSON file for further processing or usage. This ensures that the xref data is available in both JavaScript and JSON formats, providing flexibility for different use cases.
 *
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-06-09
 */


const fs = require('fs-extra');
const config = fs.readJsonSync('specs.json');

// Collect all directories that contain files with a term and definition
// This maps over the specs in the config file and constructs paths to directories
// where the term definition files are located.
const specTermsDirectories = config.specs.map(spec => spec.spec_directory + '/' + spec.spec_terms_directory);

// Ensure that the 'output' directory exists, creating it if necessary.
if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
}

// Ensure that the 'output/xtrefs-history' directory exists, creating it if necessary.
if (!fs.existsSync('output/xtrefs-history')) {
    fs.mkdirSync('output/xtrefs-history');
}

// Define paths for various output files, including JSON and JS files.
const outputPathJSON = 'output/xtrefs-data.json';
const outputPathJS = 'output/xtrefs-data.js';
const outputPathJSTimeStamped = 'output/xtrefs-history/xtrefs-data-' + Date.now() + '.js';

function setupFetchHeaders(GITHUB_API_TOKEN) {
    const fetchHeaders = {
        'Accept': 'application/vnd.github.v3+json'
    };

    if (GITHUB_API_TOKEN) {
        fetchHeaders['Authorization'] = `token ${GITHUB_API_TOKEN}`;
    } else {
        console.log('\n   SPEC-UP-T: There is no GitHub token set up. Therefore, you are more likely to be at your limit of GitHub API requests. If you run into the limit, create a token and search the documentation on this topic.\n');
    }

    return fetchHeaders;
}

// Function to check the rate limit of the GitHub API
function checkRateLimit(response) {
    if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
        const resetTime = new Date(response.headers.get('X-RateLimit-Reset') * 1000);
        console.error(`\n   SPEC-UP-T: Github API rate limit exceeded. Try again after ${resetTime}. See https://trustoverip.github.io/spec-up-t-website/docs/github-token/ for more info.` + "\n");
        return true;
    } else {
        console.log(`\n   SPEC-UP-T: Github API rate limit: ${response.headers.get('X-RateLimit-Remaining')} requests remaining. See https://trustoverip.github.io/spec-up-t-website/docs/github-token/ for more info.` + "\n");
    }
    return false;
}

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

// Function to fetch the content of a file from a specific commit in a GitHub repository.
async function fetchFileContentFromCommit(GITHUB_API_TOKEN, owner, repo, commitHash, filePath) {
    const MAX_RETRIES = 3;
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitHash}?recursive=1`;
            const treeResponse = await fetch(treeUrl, { headers: setupFetchHeaders(GITHUB_API_TOKEN) });

            if (treeResponse.ok) {
                const treeData = await treeResponse.json();
                const file = treeData.tree.find(item => item.path === filePath);
                if (file) {
                    const fileContentResponse = await fetch(file.url);
                    const fileContentData = await fileContentResponse.json();
                    if (fileContentData.content) {
                        return Buffer.from(fileContentData.content, 'base64').toString('utf-8');
                    } else {
                        console.error('Error: fileContentData.content is undefined');
                    }
                } else {
                    console.error(`Error: File ${filePath} not found in commit ${commitHash}`);
                }
            } else if (treeResponse.status === 403 && treeResponse.headers.get('X-RateLimit-Remaining') === '0') {
                const resetTime = treeResponse.headers.get('X-RateLimit-Reset');
                const waitTime = resetTime ? (resetTime - Math.floor(Date.now() / 1000)) * 1000 : 60000;
                console.warn(`Rate limit exceeded. Retrying in ${waitTime / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                retries++;
            } else {
                console.error(`Error: Failed to fetch tree from ${treeUrl}`);
                break;
            }
        } catch (error) {
            console.error(`Error fetching file content: ${error.message}`);
            break;
        }
    }

    return null;
}

function updateXTrefs(GITHUB_API_TOKEN, skipExisting) {
    // Function to extend xtref objects with additional information, such as repository URL and directory information.
    function extendXTrefs(config, xtrefs) {
        if (config.specs[0].external_specs_repos) {
            console.log("\n   SPEC-UP-T: PLEASE NOTE: Your specs.json file is outdated (not your fault, we changed something). Use this one: https://github.com/trustoverip/spec-up-t-starter-pack/blob/main/spec-up-t-starterpack/specs.json or e-mail kor@dwarshuis.com for help. \n");
            return;
        }

        xtrefs.forEach(xtref => {
            config.specs.forEach(spec => {
                // Loop through "external_specs" to find the repository URL for each xtref
                xtref.repoUrl = null;
                xtref.terms_dir = null;
                xtref.owner = null;
                xtref.repo = null;

                spec.external_specs.forEach(repo => {
                    if (repo.external_spec === xtref.externalSpec) {
                        xtref.repoUrl = repo.url;
                        xtref.terms_dir = repo.terms_dir;
                        const urlParts = new URL(xtref.repoUrl).pathname.split('/');
                        xtref.owner = urlParts[1];
                        xtref.repo = urlParts[2];
                    }
                });

                // Loop through "external_specs" to find the site URL for each xtref

                xtref.site = null;
                if (spec.external_specs) {
                    spec.external_specs.forEach(externalSpec => {
                        const key = Object.keys(externalSpec)[0];
                        if (key === xtref.externalSpec) {
                            xtref.site = externalSpec[key];
                        }
                    });
                }
            });
        });
    }

    // Initialize an object to store all xtrefs.
    let allXTrefs = { xtrefs: [] };

    // If the output JSON file exists, load its data.
    if (fs.existsSync(outputPathJSON)) {
        const existingXTrefs = fs.readJsonSync(outputPathJSON);
        allXTrefs = existingXTrefs && existingXTrefs.xtrefs ? existingXTrefs : { xtrefs: [] };
    }

    // Function to check if an xtref is in the markdown content
    function isXTrefInMarkdown(xtref, markdownContent) {
        // const regex = new RegExp(`\\[\\[xref:${xref.term}\\]\\]`, 'g');
        const regex = new RegExp(`\\[\\[(?:x|t)ref:${xtref.term}\\]\\]`, 'g');
        const result = regex.test(markdownContent);
        return result;
    }

    // Collect all markdown content
    let allMarkdownContent = '';

    specTermsDirectories.forEach(specDirectory => {
        fs.readdirSync(specDirectory).forEach(file => {
            if (file.endsWith('.md')) {
                const markdown = fs.readFileSync(`${specDirectory}/${file}`, 'utf8');
                allMarkdownContent += markdown;
            }
        });
    });

    // Remove existing entries if not in the combined markdown content
    allXTrefs.xtrefs = allXTrefs.xtrefs.filter(existingXTref => {
        return isXTrefInMarkdown(existingXTref, allMarkdownContent);
    });

    // Add new entries if they are in the markdown
    const regex = /\[\[(?:xref|tref):.*?\]\]/g;
    if (regex.test(allMarkdownContent)) {
        const xtrefs = allMarkdownContent.match(regex);
        xtrefs.forEach(xtref => {
            const newXTrefObj = processXTref(xtref);
            if (!allXTrefs.xtrefs.some(existingXTref =>
                existingXTref.term === newXTrefObj.term && existingXTref.externalSpec === newXTrefObj.externalSpec)) {
                allXTrefs.xtrefs.push(newXTrefObj);
            }
        });
    };

    // Function to process and clean up xref / tref strings found in the markdown file, returning an object with `externalSpec` and `term` properties.
    function processXTref(xtref) {
        let [externalSpec, term] = xtref.replace(/\[\[(?:xref|tref):/, '').replace(/\]\]/, '').trim().split(/,/, 2);
        return {
            externalSpec: externalSpec.trim(),
            term: term.trim()
        };
    }

    // Extend each xref with additional data and fetch commit information from GitHub.
    extendXTrefs(config, allXTrefs.xtrefs);


    /* 
        Function to fetch all term information from GitHub. The function will not fetch the commit hash again if an entry already contains a commit hash.

        It checks if the xtref object already has a commitHash and content.If both are present, it skips fetching the term information from GitHub. This ensures that existing commit hashes are not overwritten.
    */
    async function fetchAllTermsInfoFromGithub(skipExisting) {
        for (let xtref of allXTrefs.xtrefs) {
            if (!skipExisting || (!xtref.commitHash || !xtref.content)) {
                const fetchedData = await fetchTermInfoFromGithub(GITHUB_API_TOKEN, xtref);
                if (fetchedData) {
                    xtref.commitHash = fetchedData.commitHash;
                    xtref.content = fetchedData.content;
                }
            }        }
    }

    // Fetch all term information, then write the results to JSON and JS files.
    fetchAllTermsInfoFromGithub(skipExisting).then(() => {
        const allXTrefsStr = JSON.stringify(allXTrefs, null, 2);
        fs.writeFileSync(outputPathJSON, allXTrefsStr, 'utf8');
        const stringReadyForFileWrite = `const allXTrefs = ${allXTrefsStr};`;
        fs.writeFileSync(outputPathJS, stringReadyForFileWrite, 'utf8');
        fs.writeFileSync(outputPathJSTimeStamped, stringReadyForFileWrite, 'utf8');

        // Run the render function to update the HTML file
        require('../index.js')({ nowatch: true });
    }).catch(err => {
        console.error('Error:', err);
    });
}

module.exports = {
    updateXTrefs
}
