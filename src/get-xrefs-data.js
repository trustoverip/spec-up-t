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

function getXrefsData() {
    let allXrefs = {};
    allXrefs.xrefs = new Set();

    // Function to fetch the latest commit hash of the file
    async function fetchLatestCommitHash(match) {
        /* Example
            console.log('match: ', match); ->
            
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

        
        
        try {

            if (match.repoUrl === undefined) {
                console.log('match.repoUrl is undefined');
                return;
            }

            // prerequisite: filename should be the term in the match object with spaces replaced by dashes and all lowercase
            const url = `https://api.github.com/repos/${match.owner}/${match.repo}/commits?path=${match.terms_dir}/${match.term.replace(/ /g, '-').toLowerCase()}.md`;

            // Fetch the list of commits for the specified file
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            // Check for rate limit before proceeding
            if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
                const resetTime = new Date(response.headers.get('X-RateLimit-Reset') * 1000);
                console.error(`Github API rate limit exceeded. Try again after ${resetTime}`);
                return;
            }

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(`\nGithub API request for:\n  Term ${match.term},\n  Name: ${match.externalSpec}\n  Owner ${match.owner}\n  Repo ${match.repo}\nwas successful`);

            // Extract JSON data from the response, see https://blockchainbird.github.io/spec-up-t-website/docs/various-roles/developers-guide/#example-of-api-response for example response
            const data = await response.json();

            // Check if there are any commits
            if (data.length === 0) {
                console.log(`No commit hash found for the term “${match.term}”`);

                return;
            }

            // Process the last ten commits
            const commits = data.slice(0, 1); // Get only the last commit
            
            // Assign the fetched commit hash to the variable commitHash
            let commitHash = commits.map(commit => commit.sha);
            
            console.log(`\nCommit hash found for the term “${match.term}”: `, commitHash);

            // Check if the file exists
            if (fs.existsSync(outputPathJSON)) {
                // Read the JSON file
                let currentXrefs = fs.readJsonSync(outputPathJSON);
                // Check if the term is in the JSON file
                currentXrefs.xrefs.forEach(xref => {
                    // Check if the term is in the JSON file
                    if (xref.term === match.term) {
                        // If the term is in the JSON file, get the commit hash from the file and assign it to the variable commitHash. This is done to prevent the commit hash from being overwritten by the fetched commit hash. We want to keep the commit hash that was fetched at the time that the author looked it up.
                        console.log(`\nThis external reference:\n Term: ${match.term}\n Name: ${match.externalSpec}\n Owner: ${match.owner}\n Repo: ${match.repo}\nis already referenced.
                        `)

                        // Give the commitHash from the JSON file to the commitHash variable
                        commitHash = xref.commitHash;
                    }
                });
            } else {
                console.error(`File not found: ${outputPathJSON}`);
            }

            return commitHash;
        } catch (error) {
            console.error(`Failed to fetch commit hash for the term “${match.term}”:`, error);
        }
    }

    async function fetchLatestCommitHashes() {
        for (const xref of allXrefs.xrefs) {
            xref.commitHash = await fetchLatestCommitHash(xref);
        }
    }

    // Go through all directories that contain files with a term and definition
    console.log("All “spec_directory”'s found in specs.json: ", specTermsDirectories);
    specTermsDirectories.forEach(specDirectory => {
        console.log(`Current spec_directory: `, specDirectory);
        // read directory
        fs.readdirSync(specDirectory).forEach(file => {
            // read file
            if (file.endsWith('.md')) {
                console.log(`Markdown file referenced in spec_directory: `, file);
                const markdown = fs.readFileSync(`${specDirectory}/${file}`, 'utf8');
                // create regex that finds “[[xref:.*]]”
                const regex = /\[\[xref:.*?\]\]/g;
                if (regex.test(markdown)) {
                    const xrefs = markdown.match(regex);
                    xrefs.forEach(xref => {
                        console.log(`Xref found in ${file}: `, xref);
                        // example of xref: [xref: test-1, Aal]
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
        if (xref.repoUrl === undefined) {
            console.log('match.repoUrl is undefined');
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
    fetchLatestCommitHashes().then(() => {
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

// Write function that removes an entry from xrefs-data.json and xrefs-data.js based on the term and externalSpec
function removeXref(term, externalSpec) {
    // Read the JSON file
    let currentXrefs = fs.readJsonSync(outputPathJSON);

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
}

module.exports = {
    getXrefsData,
    removeXref
}