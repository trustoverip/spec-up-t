/**
 * @file This file creates a JavaScript file with the data for the xrefs. It fetches the latest commit hash of the term files from the GitHub API and stores the data in a JavaScript file that is included in the HTML output of the specification. The outputted JS file serves as a source for the JS code that will be included in the html file.
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

// Ensure that the 'output/xrefs-history' directory exists, creating it if necessary.
if (!fs.existsSync('output/xrefs-history')) {
    fs.mkdirSync('output/xrefs-history');
}

// Define paths for various output files, including JSON and JS files.
const outputPathJSON = 'output/xrefs-data.json';
const outputPathJS = 'output/xrefs-data.js';
const outputPathJSTimeStamped = 'output/xrefs-history/xrefs-data-' + Date.now() + '.js';

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
        console.error(`\n   SPEC-UP-T: Github API rate limit exceeded. Try again after ${resetTime}. See https://blockchainbird.github.io/spec-up-t-website/docs/github-token/ for more info.` + "\n");
        return true;
    } else {
        console.log(`\n   SPEC-UP-T: Github API rate limit: ${response.headers.get('X-RateLimit-Remaining')} requests remaining. See https://blockchainbird.github.io/spec-up-t-website/docs/github-token/ for more info.` + "\n");
    }
    return false;
}

// Function to fetch term information from GitHub, including commit hash and content.
async function fetchTermInfoFromGithub(GITHUB_API_TOKEN, xref) {
    try {
        // prerequisite: filename should be the term in the match object with spaces replaced by dashes and all lowercase
        //TODO: Loop through all markdown files to find the term and get the filename, instead of assuming that the filename is the term with spaces replaced by dashes and all lowercase
        const url = `https://api.github.com/repos/${xref.owner}/${xref.repo}/commits?path=${xref.terms_dir}/${xref.term.replace(/ /g, '-').toLowerCase()}.md&per_page=1`;
        const response = await fetch(url, { headers: setupFetchHeaders(GITHUB_API_TOKEN) });

        // Check for rate limit before proceeding
        if (checkRateLimit(response)) {
            return;
        }

        if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
                const commitHash = data[0].sha;
                const content = await fetchFileContentFromCommit(GITHUB_API_TOKEN, xref.owner, xref.repo, commitHash, `${xref.terms_dir}/${xref.term.replace(/ /g, '-').toLowerCase()}.md`);
                return { commitHash, content };
            }
        } else {
            console.error(`\n   SPEC-UP-T: Failed to fetch commit hash for ${xref.term}: ${response.statusText}\n`);
            return { commitHash: null, content: null };
        }
    } catch (error) {
        console.error(`\n   SPEC-UP-T: Error fetching data for term ${xref.term}: ${error.message}\n`);
    }
    return null;
}

// Function to fetch the content of a file from a specific commit in a GitHub repository.
async function fetchFileContentFromCommit(GITHUB_API_TOKEN, owner, repo, commitHash, filePath) {
    try {
        const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitHash}?recursive=1`;
        const treeResponse = await fetch(treeUrl, { headers: setupFetchHeaders(GITHUB_API_TOKEN) });

        if (treeResponse.ok) {
            const treeData = await treeResponse.json();
            const file = treeData.tree.find(item => item.path === filePath);
            if (file) {
                const fileContentResponse = await fetch(file.url);
                const fileContentData = await fileContentResponse.json();
                return Buffer.from(fileContentData.content, 'base64').toString('utf-8');
            }
        }
    } catch (error) {
        console.error(`\n   SPEC-UP-T: Error fetching file content: ${error.message}\n`);
    }
    return null;
}

function updateXrefs(GITHUB_API_TOKEN) {
    // Function to extend xref objects with additional information, such as repository URL and directory information.
    function extendXrefs(config, xrefs) {
        if (config.specs[0].external_specs_repos) {
            console.log("\n   SPEC-UP-T: PLEASE NOTE: Your specs.json file is outdated (not your fault, we changed something). Use this one: https://github.com/trustoverip/spec-up-t-starter-pack/blob/main/spec-up-t-starterpack/specs.json or e-mail kor@dwarshuis.com for help. \n");
            return;
        }

        xrefs.forEach(xref => {
            config.specs.forEach(spec => {
                // Loop through "external_specs" to find the repository URL for each xref
                xref.repoUrl = null;
                xref.terms_dir = null;
                xref.owner = null;
                xref.repo = null;

                spec.external_specs.forEach(repo => {
                    if (repo.external_spec === xref.externalSpec) {
                        xref.repoUrl = repo.url;
                        xref.terms_dir = repo.terms_dir;
                        const urlParts = new URL(xref.repoUrl).pathname.split('/');
                        xref.owner = urlParts[1];
                        xref.repo = urlParts[2];
                    }
                });

                // Loop through "external_specs" to find the site URL for each xref

                xref.site = null;
                if (spec.external_specs) {
                    spec.external_specs.forEach(externalSpec => {
                        const key = Object.keys(externalSpec)[0];
                        if (key === xref.externalSpec) {
                            xref.site = externalSpec[key];
                        }
                    });
                }
            });
        });
    }

    // Initialize an object to store all xrefs.
    let allXrefs = { xrefs: [] };

    // If the output JSON file exists, load its data.
    if (fs.existsSync(outputPathJSON)) {
        const existingXrefs = fs.readJsonSync(outputPathJSON);
        allXrefs = existingXrefs && existingXrefs.xrefs ? existingXrefs : { xrefs: [] };
    }

    // Function to check if an xref is in the markdown content
    function isXrefInMarkdown(xref, markdownContent) {
        const regex = new RegExp(`\\[\\[xref:${xref.term}\\]\\]`, 'g');
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
    allXrefs.xrefs = allXrefs.xrefs.filter(existingXref => {
        return isXrefInMarkdown(existingXref, allMarkdownContent);
    });

    // Add new entries if they are in the markdown
    const regex = /\[\[xref:.*?\]\]/g;
    if (regex.test(allMarkdownContent)) {
        const xrefs = allMarkdownContent.match(regex);
        xrefs.forEach(xref => {
            const newXrefObj = processXref(xref);
            if (!allXrefs.xrefs.some(existingXref =>
                existingXref.term === newXrefObj.term && existingXref.externalSpec === newXrefObj.externalSpec)) {
                allXrefs.xrefs.push(newXrefObj);
            }
        });
    };

    // Function to process and clean up xref strings found in the markdown file, returning an object with `externalSpec` and `term` properties.
    function processXref(xref) {
        let [externalSpec, term] = xref.replace(/\[\[xref:/, '').replace(/\]\]/, '').trim().split(/,/, 2);
        return {
            externalSpec: externalSpec.trim(),
            term: term.trim()
        };
    }

    // Extend each xref with additional data and fetch commit information from GitHub.
    extendXrefs(config, allXrefs.xrefs);


    /* 
        Function to fetch all term information from GitHub. The function will not fetch the commit hash again if an entry already contains a commit hash.

        It checks if the xref object already has a commitHash and content.If both are present, it skips fetching the term information from GitHub. This ensures that existing commit hashes are not overwritten.
    */
    async function fetchAllTermsInfoFromGithub() {
        for (let xref of allXrefs.xrefs) {
            if (!xref.commitHash || !xref.content) {
                const fetchedData = await fetchTermInfoFromGithub(GITHUB_API_TOKEN, xref);
                if (fetchedData) {
                    xref.commitHash = fetchedData.commitHash;
                    xref.content = fetchedData.content;
                }
            }
        }
    }

    // Fetch all term information, then write the results to JSON and JS files.
    fetchAllTermsInfoFromGithub().then(() => {
        const allXrefsStr = JSON.stringify(allXrefs, null, 2);
        fs.writeFileSync(outputPathJSON, allXrefsStr, 'utf8');
        const stringReadyForFileWrite = `const allXrefs = ${allXrefsStr};`;
        fs.writeFileSync(outputPathJS, stringReadyForFileWrite, 'utf8');
        fs.writeFileSync(outputPathJSTimeStamped, stringReadyForFileWrite, 'utf8');

        // Run the render function to update the HTML file
        require('../index.js')({ nowatch: true });
    }).catch(err => {
        console.error('Error:', err);
    });
}

// Function to remove a specific xref from the JSON file, based on term and externalSpec.
function removeXref(term, externalSpec) {
    let messages = [];

    try {
        // Read the JSON file
        let currentXrefs = fs.readJsonSync(outputPathJSON);

        // Check if the term and externalSpec exist
        const entryExists = currentXrefs.xrefs.some(xref => xref.term === term && xref.externalSpec === externalSpec);

        if (!entryExists) {
            messages.push(`\n   SPEC-UP-T: Entry with term "${term}" and externalSpec "${externalSpec}" not found.\n`);
            return messages;
        }

        // Remove the entry from the JSON file
        currentXrefs.xrefs = currentXrefs.xrefs.filter(xref => {
            return !(xref.term === term && xref.externalSpec === externalSpec);
        });

        // Convert the JSON object back to a JSON string
        const currentXrefsStr = JSON.stringify(currentXrefs, null, 2);

        // Write the JSON code to a .json file
        fs.writeFileSync(outputPathJSON, currentXrefsStr, 'utf8');

        // Create the JS code for the assignment
        const stringReadyForFileWrite = `const allXrefs = ${currentXrefsStr};`;

        // Write the JS code to a .js file
        fs.writeFileSync(outputPathJS, stringReadyForFileWrite, 'utf8');

        messages.push(`\n   SPEC-UP-T: Entry with term "${term}" and externalSpec "${externalSpec}" removed.\n`);

        // Run the render function to update the HTML file
        require('../index.js')({ nowatch: true });

    } catch (error) {
        messages.push(`\n   SPEC-UP-T: An error occurred - ${error.message}\n`);
    }

    // TODO: messages are not used at the moment, since they apparently are not returned to the calling script. Fix this.

    return messages;
}

function addXref(term, externalSpec) {
    let messages = [];

    try {
        // Read the JSON file
        let currentXrefs = fs.readJsonSync(outputPathJSON);

        // Check if the term and externalSpec exist
        const entryExists = currentXrefs.xrefs.some(xref => xref.term === term && xref.externalSpec === externalSpec);

        if (entryExists) {
            messages.push(`\n   SPEC-UP-T: Entry with term "${term}" and externalSpec "${externalSpec}" already exists.\n`);
            return messages;
        }

        // Add the entry to the JSON file
        currentXrefs.xrefs.push({ term, externalSpec });

        // Convert the JSON object back to a JSON string
        const currentXrefsStr = JSON.stringify(currentXrefs, null, 2);

        // Write the JSON code to a .json file
        fs.writeFileSync(outputPathJSON, currentXrefsStr, 'utf8');

        // Create the JS code for the assignment
        const stringReadyForFileWrite = `const allXrefs = ${currentXrefsStr};`;

        // Write the JS code to a .js file
        fs.writeFileSync(outputPathJS, stringReadyForFileWrite, 'utf8');

        messages.push(`\n   SPEC-UP-T: Entry with term "${term}" and externalSpec "${externalSpec}" added.\n`);

        // Run the render function to update the HTML file
        require('../index.js')({ nowatch: true });

    } catch (error) {
        messages.push(`\n   SPEC-UP-T: An error occurred - ${error.message}\n`);
    }
}

// Export the updateXrefs and removeXref functions for use in other modules.
module.exports = {
    updateXrefs,
    removeXref,
    addXref
}
