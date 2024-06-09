/**
 * @file This file creates a JavaScript file with the data for the xrefs. It fetches the latest commit hash of the term files from the GitHub API and stores the data in a JavaScript file that is included in the HTML output of the specification. This file is run as a Node.js script.
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-06-09
 */

// Get the current working directory
const projectRoot = process.cwd();
const path = require('path');
const fs = require('fs-extra');
const config = fs.readJsonSync(path.join(projectRoot, '/', 'specs.json'));
const specDirectories = config.specs.map(spec => spec.spec_directory + '/' + spec.spec_terms_directory);

// Create directory named “output” in the project root if it does not yet exist
if (!fs.existsSync(path.join(projectRoot, '/output'))) {
    fs.mkdirSync(path.join(projectRoot, '/output'));
}

// Create a path for the output file in the project root
const outputPath = path.join(projectRoot, 'output/xrefs-data.js');

function getXrefsData() {
    let allXrefs = {};
    allXrefs.xrefs = new Set();

    // Function to fetch the latest commit hash of the file
    async function fetchLatestCommitHash(match) {
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

            // Extract JSON data from the response
            const data = await response.json();

            // Check if there are any commits
            if (data.length === 0) {
                console.log("no CommitHash");

                return;
            }

            // Process the last ten commits
            const commits = data.slice(0, 1); // Get only the last commit

            return commits.map(commit => commit.sha);

            // return;
        } catch (error) {
            console.error('Failed to fetch commit hash:', error);
        }
    }

    // Go through all directories that contain files with a term and definition
    specDirectories.forEach(specDirectory => {
        // read directory
        fs.readdirSync(specDirectory).forEach(file => {
            // read file
            if (file.endsWith('.md')) {
                const markdown = fs.readFileSync(`${specDirectory}/${file}`, 'utf8');
                // create regex that finds “[[xref:.*]]”
                const regex = /\[\[xref:.*?\]\]/g;
                if (regex.test(markdown)) {
                    const xrefs = markdown.match(regex);
                    xrefs.forEach(xref => {
                        // example of xref: [[xref: PE, Holder]]
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
    //     '[[xref: PE, Holder]]',
    //     '[[xref: test-1, Aal]]',
    //     '[[xref: test-2, Abac]]'
    // ]

    // remove “[[xref:” from the beginning of every value in allMatches
    allXrefs.xrefs = allXrefs.xrefs.map(xref => {
        return xref.replace(/\[\[xref:/, '');
    });
    // remove “]]” from the end of every value in allMatches
    allXrefs.xrefs = allXrefs.xrefs.map(xref => {
        return xref.replace(/\]\]/, '');
    });

    // trim every entry of allMatches
    allXrefs.xrefs = allXrefs.xrefs.map(match => {
        return match.trim();
    });

    // split every entry of allMatches on the first comma, replace the entry with an object that has two keys: one that contains everything before the comma and one that contains everything after the comma
    allXrefs.xrefs = allXrefs.xrefs.map(xref => {
        let [externalSpec, term] = xref.split(/,/, 2);
        return {
            externalSpec: externalSpec.trim(),
            term: term.trim()
        };
    })

    // Example output:
    // allXrefs.xrefs: [
    //     { externalSpec: 'PE', term: 'Holder' },
    //     { externalSpec: 'test-1', term: 'Aal' },
    //     { externalSpec: 'test-2', term: 'Abac' }
    // ]


    allXrefs.xrefs.forEach(xref => {
        config.specs.forEach(spec => {
            spec.external_specs_repos.forEach(repo => {
                // if the externalSpec is in the config, add the url and the dir where the terms are, to the xref object
                // Example external_specs_repos:
                // "external_specs_repos": [
                //     {
                //         "external_spec": "PE",
                //         "url": "https://github.com/decentralized-identity/presentation-exchange",
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

    allXrefs.xrefs.forEach(xref => {
        if (xref.repoUrl === undefined) {
            console.log('match.repoUrl is undefined');
            return;
        }

        const urlParts = new URL(xref.repoUrl).pathname.split('/');
        xref.owner = urlParts[1];
        xref.repo = urlParts[2];
    });

    allXrefs.xrefs.forEach(match => {
        // loop through array of specs in config
        config.specs.forEach(spec => {
            if (spec.external_specs) {
                // Example external_specs:
                // "external_specs": [
                //     {
                //         "PE": "https://identity.foundation/presentation-exchange"
                //     },
                // …
                // ]
                spec.external_specs.forEach(externalSpec => {
                    const key = Object.keys(externalSpec)[0];
                    if (key === match.externalSpec) {
                        match.site = externalSpec[key];
                    }
                });
            }
        });
    });

    async function fetchLatestCommitHashes() {

        // // temporary no github api call
        // for (const match of allXrefs.xrefs) {
        //     match.commitHash = await fetchLatestCommitHash(match);
        // }
    }

    // Call the function and wait for it to complete before writing to the file
    fetchLatestCommitHashes().then(() => {
        // Convert allXrefsStr to a JSON string with indentation
        const allXrefsStr = JSON.stringify(allXrefs, null, 2);

        // Create the JS code for the assignment
        const stringReadyForFileWrite = `const allXrefs = ${allXrefsStr};`;

        // Write the JS code to a .js file
        fs.writeFileSync(outputPath, stringReadyForFileWrite, 'utf8');
    });
}

module.exports = {
    getXrefsData
}