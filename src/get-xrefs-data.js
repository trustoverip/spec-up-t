/**
 * @file This file creates a JavaScript file with the data for the xrefs. It fetches the latest commit hash of the term files from the GitHub API and stores the data in a JavaScript file that is included in the HTML output of the specification. The outputted JS file serves as a source for the JS code that will be included in the html file.
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-06-09
 */

const fs = require('fs-extra');
const config = fs.readJsonSync('specs.json');

// Collect all directories that contain files with a term and definition
const specTermsDirectories = config.specs.map(spec => spec.spec_directory + '/' + spec.spec_terms_directory);

// Create directory named “output” in the project root if it does not yet exist
if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
}

// Create directory named “output/xrefs-history” in the project root if it does not yet exist
if (!fs.existsSync('output/xrefs-history')) {
    fs.mkdirSync('output/xrefs-history');
}

// Create a path for the output file in the project root
const outputPathJSON = 'output/xrefs-data.json';
const outputPathJS = 'output/xrefs-data.js';
const outputPathJSTimeStamped = 'output/xrefs-history/xrefs-data-' + Date.now() + '.js';

function getXrefsData(GITHUB_API_TOKEN) {

    // Set the headers for the fetch request
    const fetchHeaders = {
        'Accept': 'application/vnd.github.v3+json'
    };

    // Check if a GitHub API token is set in the environment variables
    if (GITHUB_API_TOKEN) {
        fetchHeaders['Authorization'] = `token ${GITHUB_API_TOKEN}`;
        // fetchHeaders['Authorization'] = `${GITHUB_API_TOKEN}`;
    } else {
        console.log('\n   SPEC-UP-T: There is no GitHub token set up. Therefore, you are more likely to be at your limit of GitHub API requests. If you run into the limit, create a token and search the documentation on this topic.\n');
    }

    // Create an object to store all xrefs
    let allXrefs = {};
    allXrefs.xrefs = new Set();

    // Function to check the rate limit of the GitHub API
    function checkRateLimit(response) {
        if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
            const resetTime = new Date(response.headers.get('X-RateLimit-Reset') * 1000);
            console.error(`\n   SPEC-UP-T: Github API rate limit exceeded. Try again after ${resetTime}` + "\n");
            return true;
        } else {
            console.log(`\n   SPEC-UP-T: Github API rate limit: ${response.headers.get('X-RateLimit-Remaining')} requests remaining. See https://blockchainbird.github.io/spec-up-t-website/docs/github-token/ for more info.` + "\n");
        }
        return false;
    }

    // Function to fetch the latest commit hash of the file
    async function fetchTermInfoFromGithub(match) {
        // console.log('match: ', match);
        /* Example
            match:  {
                externalSpec: 'test-1',
                term: 'Aal',
                repoUrl: 'https://github.com/blockchainbird/spec-up-xref-test-1',
                terms_dir: 'spec/term-definitions',
                owner: 'blockchainbird',
                repo: 'spec-up-xref-test-1',
                site: 'https://blockchainbird.github.io/spec-up-xref-test-1/'
            }
        */

        let commitHash;
        let fileContent;
        let gitHubData = {};

        // Function to fetch the content of a file from a commit
        async function fetchFileContentFromCommit(owner, repo, commitHash, filePath) {
            try {
                // Step 1: Get the tree of the commit
                const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitHash}?recursive=1`;
                const treeResponse = await fetch(treeUrl, {
                    headers: fetchHeaders
                });

                // Check for rate limit before proceeding
                if (checkRateLimit(treeResponse)) {
                    return;
                }

                if (!treeResponse.ok) {
                    throw new Error(`Failed to fetch tree: ${treeResponse.statusText}`);
                }
                const treeData = await treeResponse.json();

                // Step 2: Find the file in the tree
                if (!treeData.tree) {
                    throw new Error('Tree data does not contain a tree property');
                }
                const file = treeData.tree.find(item => item.path === filePath);
                if (!file) {
                    throw new Error(`File ${filePath} not found in commit ${commitHash}`);
                }

                // Step 3: Fetch the content of the file
                const fileContentUrl = file.url;
                const fileContentResponse = await fetch(fileContentUrl);
                // if (!fileContentResponse.ok) {
                //     throw new Error(`Failed to fetch file content: ${fileContentResponse.statusText}`);
                // }
                const fileContentData = await fileContentResponse.json();

                // Decode the base64 content
                return Buffer.from(fileContentData.content, 'base64').toString('utf-8');
            } catch (error) {
                console.error(error);
                return;
            }
        }

        try {
            // Look if the term is already locally stored in the JSON file, in that case stop here, no need to fetch the commit hash from GitHub

            // // If even the JSON file that holds the terms does not exist, stop here, and go to GitHub to fetch the commit hash
            // if (!fs.existsSync(outputPathJSON)) {
            //     console.log(`\n   SPEC-UP-T: There are no external references stored.\n`);
            //     return;
            // }

            // console.log("pomtiedom");

            
            let found = false;
            // Check if the term is already in the JSON file, if so, stop and do not fetch the commit hash
            if (fs.existsSync(outputPathJSON)) {
                // If the JSON file is found, read it
                let currentXrefs = fs.readJsonSync(outputPathJSON);
                // console.log('currentXrefs djdjdjdjdj: ', currentXrefs);
                found = currentXrefs.xrefs.some(xref => {
                    if (xref.term === match.term) {
                        console.log(`\n   SPEC-UP-T: This external reference:\n Term: ${match.term}\n Name: ${match.externalSpec}\n Owner: ${match.owner}\n Repo: ${match.repo}\nis already referenced.\n`);
                        return true; // Term found in the JSON file, exit the loop
                    }
                    return false;
                });
            }

            // console.log('found: ', found);
            if (found) {
                return;
            }
            // console.log("kedenk");
            // Nothing found in the JSON file, continue to fetch the commit hash from GitHub

            // prerequisite: filename should be the term in the match object with spaces replaced by dashes and all lowercase
            //TODO: Loop through all markdown files to find the term and get the filename, instead of assuming that the filename is the term with spaces replaced by dashes and all lowercase
            // const url = `https://api.github.com/repos/${match.owner}/${match.repo}/commits?path=${match.terms_dir}/${match.term.replace(/ /g, '-').toLowerCase()}.md`;

            const url = `https://api.github.com/repos/${match.owner}/${match.repo}/commits?path=${match.terms_dir}/${match.term.replace(/ /g, '-').toLowerCase()}.md&per_page=1`;
            // console.log('url: ', url);

            const response = await fetch(url, {
                headers: fetchHeaders
            });

            // Check for rate limit before proceeding
            if (checkRateLimit(response)) {
                return;
            }

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(`\n   SPEC-UP-T: Github API request for:\n   Term ${match.term},\n   Name: ${match.externalSpec}\n   Owner ${match.owner}\n   Repo ${match.repo}\n   was successful` + "\n");

            // Extract JSON data from the response, see https://blockchainbird.github.io/spec-up-t-website/docs/various-roles/developers-guide/#example-of-api-response for example response
            const data = await response.json();

            // Check if there are any commits
            if (data.length === 0) {
                console.log(`\n   SPEC-UP-T: No commit hash found for the term “${match.term}”` + "\n");

                return;
            }

            // Get only the last commit, this is not strictly necessary since we use &per_page=1 in the url
            const commits = data.slice(0, 1);
            // Assign the fetched commit hash to the variable commitHash
            gitHubData.commitHash = commits.map(commit => commit.sha);

            console.log(`\n   SPEC-UP-T: Commit hash found for the term “${match.term}”: `, gitHubData.commitHash + "\n");

            // Based on the commit hash, fetch the content of the file
            async function processGitHubData(match, gitHubData) {
                const filePath = `${match.terms_dir}/${match.term.replace(/ /g, '-').toLowerCase()}.md`;
                gitHubData.content = await fetchFileContentFromCommit(match.owner, match.repo, gitHubData.commitHash, filePath) || '';
                return gitHubData; // Return the populated gitHubData object
            }

            const fetchedData = (async () => {
                const fetchedData = await processGitHubData(match, gitHubData);
                return fetchedData;
            })();

            // console.log('fetchedData: ', fetchedData);
            return fetchedData
        } catch (error) {
            console.error(`\n   SPEC-UP-T: Failed to fetch commit hash for the term “${match.term}”:`, error + "\n");
        }
    }

    async function fetchAllTermsInfoFromGithub() {
        for (const xref of allXrefs.xrefs) {

            const output = await fetchTermInfoFromGithub(xref);
            // console.log('xref: ', xref);
            // console.log('output: ', output);
            
            if (output !== undefined) {
                xref.commitHash = output.commitHash;
                xref.content = output.content;
            }
        }
    }

    // Go through all directories that contain files with a term and definition
    specTermsDirectories.forEach(specDirectory => {
        console.log(`\n   SPEC-UP-T: Current spec_directory: `, specDirectory + "\n");
        // read directory
        fs.readdirSync(specDirectory).forEach(file => {
            // read file
            if (file.endsWith('.md')) {
                console.log(`\n   SPEC-UP-T: Markdown file referenced in spec_directory: `, file + "\n");
                const markdown = fs.readFileSync(`${specDirectory}/${file}`, 'utf8');
                // create regex that finds “[[xref:.*]]”
                const regex = /\[\[xref:.*?\]\]/g;
                if (regex.test(markdown)) {
                    const xrefs = markdown.match(regex);
                    xrefs.forEach(xref => {
                        console.log(`\n   SPEC-UP-T: Xref found in ${file}: `, xref + "\n");
                        // example of xref: [xref: test-1, Aal]
                        console.log('xrefxrefxrefxrefxrefxrefxref: ', xref);
                        allXrefs.xrefs.add(xref);
                    });
                }
            }
        });
    })
    // Convert the Set back to an Array if needed
    allXrefs.xrefs = Array.from(allXrefs.xrefs);

    // Example output:
    // allXrefs.xrefs: [
    //     '[[xref: test-1, Aal]]',
    //     '[[xref: test-2, Abac]]'
    // ]

    // The following steps create an array of objects with the keys “externalSpec” and “term” for each xref by splitting the xref string on the comma and removing the “[[xref:” and “]]” parts

    // Step 1: remove “[[xref:” from the beginning of every value in allMatches
    allXrefs.xrefs = allXrefs.xrefs.map(xref => {
        return xref.replace(/\[\[xref:/, '');
    });

    // Step 2: remove “]]” from the end of every value in allMatches
    allXrefs.xrefs = allXrefs.xrefs.map(xref => {
        return xref.replace(/\]\]/, '');
    });

    // Step 3: trim every entry of allMatches
    allXrefs.xrefs = allXrefs.xrefs.map(xref => {
        return xref.trim();
    });

    // Step 4: split every entry of allMatches on the first comma, replace the entry with an object that has two keys: one that contains everything before the comma and one that contains everything after the comma
    allXrefs.xrefs = allXrefs.xrefs.map(xref => {
        let [externalSpec, term] = xref.split(/,/, 2);
        return {
            externalSpec: externalSpec.trim(),
            term: term.trim()
        };
    })

    // Example output:
    // allXrefs.xrefs: [
    //     { externalSpec: 'test-1', term: 'Aal' },
    //     { externalSpec: 'test-2', term: 'Abac' }
    // ]

    // Step 5: add the url and the dir where the terms are, to the xref object
    allXrefs.xrefs.forEach(xref => {
        config.specs.forEach(spec => {
            spec.external_specs_repos.forEach(repo => {
                // if the externalSpec is in the config, add the url and the dir where the terms are, to the xref object
                // Example external_specs_repos:
                // "external_specs_repos": [
                //     {
                //         "external_spec": "test-1",
                //         "url": "https://github.com/blockchainbird/spec-up-xref-test-1",
                //         "terms_dir": "spec"
                //     },
                // …
                // ]
                if (repo.external_spec === xref.externalSpec) {
                    xref.repoUrl = repo.url;
                    xref.terms_dir = repo.terms_dir;
                }
            });
        });
    });

    // Step 6: add the owner and repo to the xref object
    allXrefs.xrefs.forEach(xref => {
        console.log('xref koffie: ', xref);
        if (xref.repoUrl === undefined) {
            console.log('\n   SPEC-UP-T: match.repoUrl is undefined' + "\n");
            return;
        }

        const urlParts = new URL(xref.repoUrl).pathname.split('/');
        xref.owner = urlParts[1];
        xref.repo = urlParts[2];
    });

    // Step 7: add the site to the xref object
    allXrefs.xrefs.forEach(xref => {
        // loop through array of specs in config
        config.specs.forEach(spec => {
            if (spec.external_specs) {
                // Example external_specs:
                // "external_specs": [
                //      {
                //          "test-1": "https://blockchainbird.github.io/spec-up-xref-test-1/"
                //      }
                // …
                // ]
                spec.external_specs.forEach(externalSpec => {
                    const key = Object.keys(externalSpec)[0];
                    if (key === xref.externalSpec) {
                        xref.site = externalSpec[key];
                    }
                });
            }
        });
    });

    // Loop through all xrefs and fetch the latest commit hash for each term and add it to the xref object
    /* Example of xref after adding commitHash:
        xref:  {
            "externalSpec": "test-1",
            "term": "Aal",
            "repoUrl": "https://github.com/blockchainbird/spec-up-xref-test-1",
            "terms_dir": "spec/term-definitions",
            "owner": "blockchainbird",
            "repo": "spec-up-xref-test-1",
            "site": "https://blockchainbird.github.io/spec-up-xref-test-1/",
            "commitHash": [
                "f66951f1d378490289caab9c51141b44a0438365"
            ]
        }
    */

    // Call the function and wait for it to complete before writing to the file
    fetchAllTermsInfoFromGithub().then(() => {
        // Convert allXrefsStr to a JSON string with indentation
        const allXrefsStr = JSON.stringify(allXrefs, null, 2);

        // // Write the JSON code to a .json file
        fs.writeFileSync(outputPathJSON, allXrefsStr, 'utf8');

        // Create the JS code for the assignment
        const stringReadyForFileWrite = `const allXrefs = ${allXrefsStr};`;

        // Write the JS code to a .js file
        fs.writeFileSync(outputPathJS, stringReadyForFileWrite, 'utf8');
        fs.writeFileSync(outputPathJSTimeStamped, stringReadyForFileWrite, 'utf8');
    });
}

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
    } catch (error) {
        messages.push(`\n   SPEC-UP-T: An error occurred - ${error.message}\n`);
    }

    // TODO: messages are not used at the moment, since they apparently are not returned to the calling script. Fix this.
    return messages;
}


module.exports = {
    getXrefsData,
    removeXref
}