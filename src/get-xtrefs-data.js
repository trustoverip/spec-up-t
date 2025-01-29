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
const { fetchAllTermsInfoFromGithub } = require('./get-xtrefs-data/fetchAllTermsInfoFromGithub.js');
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

function updateXTrefs(GITHUB_API_TOKEN, skipExisting) {
    // Function to extend xtref objects with additional information, such as repository URL and directory information.
    function extendXTrefs(config, xtrefs) {
        if (config.specs[0].external_specs_repos) {
            console.log("\n   SPEC-UP-T: PLEASE NOTE: Your specs.json file is outdated (not your fault, we changed something). Use this one: https://github.com/trustoverip/spec-up-t-starter-pack/blob/main/spec-up-t-boilerplate/specs.json or e-mail kor@dwarshuis.com for help. \n");
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

    // Function to check if an xtref is in the markdown content
    function isXTrefInMarkdown(xtref, markdownContent) {
        // const regex = new RegExp(`\\[\\[xref:${xref.term}\\]\\]`, 'g');
        const regex = new RegExp(`\\[\\[(?:x|t)ref:${xtref.term}\\]\\]`, 'g');
        const result = regex.test(markdownContent);
        return result;
    }

    // Function to process and clean up xref / tref strings found in the markdown file, returning an object with `externalSpec` and `term` properties.
    function processXTref(xtref) {
        let [externalSpec, term] = xtref.replace(/\[\[(?:xref|tref):/, '').replace(/\]\]/, '').trim().split(/,/, 2);
        return {
            externalSpec: externalSpec.trim(),
            term: term.trim()
        };
    }

    // Initialize an object to store all xtrefs.
    let allXTrefs = { xtrefs: [] };

    // If the output JSON file exists, load its data.
    if (fs.existsSync(outputPathJSON)) {
        const existingXTrefs = fs.readJsonSync(outputPathJSON);
        allXTrefs = existingXTrefs && existingXTrefs.xtrefs ? existingXTrefs : { xtrefs: [] };
    }

    // Collect all markdown content
    let allMarkdownContent = '';

    // Read all Markdown files from a list of directories and concatenate their content into a single string.
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

    // `regex` is the regular expression object, and `allMarkdownContent` is the string being tested. The test method returns a boolean value: true if the pattern is found within the string, and false otherwise.
    if (regex.test(allMarkdownContent)) {
        const xtrefs = allMarkdownContent.match(regex);
        xtrefs.forEach(xtref => {
            const newXTrefObj = processXTref(xtref);
            // Ensure that newXTrefObj is only added to the xtrefs array if there isn't already an object with the same term and externalSpec properties. This helps maintain the uniqueness of entries in the array based on these two properties.
            if (!allXTrefs.xtrefs.some(existingXTref =>
                existingXTref.term === newXTrefObj.term && existingXTref.externalSpec === newXTrefObj.externalSpec)) {
                allXTrefs.xtrefs.push(newXTrefObj);
            }
        });
    };

    console.log('KORKOR allXTrefs.xtrefs: ', allXTrefs.xtrefs);

    // Extend each xref with additional data and fetch commit information from GitHub.
    extendXTrefs(config, allXTrefs.xtrefs);


    /**
     * Fetches information for all terms from GitHub and updates the provided xtrefs array in place.
     * @param {string} GITHUB_API_TOKEN - The GitHub API token.
     * @param {Object} allXTrefs - The object containing the array of xtrefs to update.
     * @param {boolean} skipExisting - Whether to skip existing entries.
     */
    fetchAllTermsInfoFromGithub(GITHUB_API_TOKEN, skipExisting, allXTrefs).then(() => {
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
