/**
 * @file prepare-tref.js
 * @description This module provides functionality to process markdown files in a directory recursively, 
 * searching for specific `[[tref:]]` references, and replacing them with detailed information 
 * fetched from a local JSON file (`xtrefs-data.json`). The information includes metadata such as 
 * owner, repository, commit hash, and content. If no matching reference is found, a placeholder 
 * message is written to the file.
 * 
 * The module includes:
 * - A helper function `getLocalXTrefContent` to retrieve reference data from the JSON file.
 * - A main function `prepareTref` to process directories and markdown files, replacing tref references.
 * 
 * This is useful for dynamically enriching markdown documentation with external reference details.
 * 
 * @requires fs - Node.js file system module for reading and writing files.
 * @requires path - Node.js path module for handling file paths.
 * @requires dedent - A utility for removing indentation from multi-line strings.
 * 
 * @module prepareTref
 */

const fs = require('fs');
const path = require('path');
const dedent = require('dedent');
const { shouldProcessFile } = require('./utils/file-filter');

function getLocalXTrefContent(externalSpec, term) {
    const filePath = path.join('output', 'xtrefs-data.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const xtrefs = data.xtrefs;

    for (const xtref of xtrefs) {
        if (xtref.externalSpec === externalSpec && xtref.term === term) {
            return {
                content: xtref.content,
                commitHash: xtref.commitHash,
                owner: xtref.owner,
                repo: xtref.repo,
                repoUrl: xtref.repoUrl,
                avatarUrl: xtref.avatarUrl
            };
        }
    }

    return null;
}

// Function to process markdown files in a directory recursively
function prepareTref(directory) {
    // Helper function to process a directory
    function processDirectory(directory) {
        try {
            // Read the contents of the directory synchronously
            const items = fs.readdirSync(directory, { withFileTypes: true });

            // Loop through each item in the directory
            items.forEach(item => {
                const itemPath = path.join(directory, item.name);
                if (item.isDirectory()) {
                    // If the item is a directory, call processDirectory recursively
                    processDirectory(itemPath);
                } else if (item.isFile() && shouldProcessFile(item.name)) {
                    try {
                        // Read the file synchronously
                        let data = fs.readFileSync(itemPath, 'utf8');

                        // Split the content into lines
                        let lines = data.split('\n');

                        // Variable to store content after the span or tref line
                        let contentAfterSpan = '';
                        const spanMarker = '<span style="display: none;">End of included external content. Add your optional custom content below.</span>';
                        const spanIndex = data.indexOf(spanMarker);

                        if (spanIndex !== -1) {
                            // If span marker exists, take content after it
                            contentAfterSpan = data.substring(spanIndex + spanMarker.length);
                        } else {
                            // If span marker doesn't exist, find the tref line and keep everything after it
                            let trefLineIndex = -1;
                            for (let i = 0; i < lines.length; i++) {
                                if (lines[i].startsWith('[[tref:')) {
                                    trefLineIndex = i;
                                    break;
                                }
                            }
                            if (trefLineIndex !== -1 && trefLineIndex < lines.length - 1) {
                                contentAfterSpan = lines.slice(trefLineIndex + 1).join('\n');
                            }
                        }

                        for (let i = 0; i < lines.length; i++) {
                            if (lines[i].startsWith('[[tref:')) {
                                const tref = /\[\[tref:(.*?)\]\]/;
                                const match = lines[i].match(tref);
                                if (match) {
                                    const result = match[1].split(',').map(term => term.trim());
                                    const localXTrefContent = getLocalXTrefContent(result[0], result[1]);

                                    const defPart = /\[\[def: ([^,]+),.*?\]\]/g;
                                    localXTrefContent.content = localXTrefContent.content.replace(defPart, '');

                                    const readyForWrite = dedent`
${match[0]}
| Property | Value |
| -------- | ----- |
| Owner | ![avatar](${localXTrefContent.avatarUrl}) ${localXTrefContent.owner} |
| Repo | [${localXTrefContent.repo}](${localXTrefContent.repoUrl}) |
| Commit hash | ${localXTrefContent.commitHash} |

${localXTrefContent.content}
${spanMarker}

${contentAfterSpan}

`;

                                    fs.writeFileSync(itemPath, readyForWrite, 'utf8');
                                }
                            }
                        }
                    } catch (err) {
                        fs.writeFileSync(itemPath, match[0] + '\n\n' + '\n\nNothing found, so nothing to show.', 'utf8');
                    }
                }
            });
        } catch (err) {
            console.error(`❌ Error reading directory: ${err}`);
        }
    }

    processDirectory(directory);
}

module.exports = {
    prepareTref
};