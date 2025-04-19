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
    
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const xtrefs = data.xtrefs;

        for (const xtref of xtrefs) {
            if (xtref.externalSpec === externalSpec && xtref.term === term) {
                // Validate that required properties exist
                if (!xtref.content || !xtref.owner || !xtref.repo || !xtref.repoUrl) {
                    console.warn(`Warning: Incomplete data for ${externalSpec}, ${term}`);
                }
                
                return {
                    content: xtref.content || "No content available",
                    commitHash: xtref.commitHash || "Not available",
                    owner: xtref.owner || "Unknown",
                    repo: xtref.repo || "Unknown",
                    repoUrl: xtref.repoUrl || "#",
                    avatarUrl: xtref.avatarUrl || ""
                };
            }
        }
    } catch (err) {
        console.error(`Error reading xtrefs-data.json: ${err}`);
    }

    return {
        content: `Term '${term}' not found in external specification '${externalSpec}'`,
        commitHash: "Not available",
        owner: "Unknown",
        repo: "Unknown",
        repoUrl: "#",
        avatarUrl: ""
    };
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
                                let currentTref = lines[i]; // Store the current tref line for error handling
                                
                                if (match) {
                                    try {
                                        const result = match[1].split(',').map(term => term.trim());
                                        
                                        if (result.length < 2) {
                                            throw new Error(`Invalid tref format. Expected: [[tref:spec,term]], got: ${match[0]}`);
                                        }
                                        
                                        const localXTrefContent = getLocalXTrefContent(result[0], result[1]);
                                        
                                        // Skip processing if essential data is missing
                                        if (!localXTrefContent) {
                                            console.warn(`Warning: No content found for ${result[0]}, ${result[1]}`);
                                            continue;
                                        }
                                        
                                        const defPart = /\[\[def: ([^,]+),.*?\]\]/g;
                                        if (localXTrefContent.content) {
                                            localXTrefContent.content = localXTrefContent.content.replace(defPart, '');
                                        }

                                        const readyForWrite = dedent`
${match[0]}
| Property | Value |
| -------- | ----- |
| Owner | ${localXTrefContent.avatarUrl ? `![avatar](${localXTrefContent.avatarUrl})` : ''} ${localXTrefContent.owner} |
| Repo | [${localXTrefContent.repo}](${localXTrefContent.repoUrl}) |
| Commit hash | ${localXTrefContent.commitHash} |

${localXTrefContent.content}
${spanMarker}

${contentAfterSpan}

`;

                                        fs.writeFileSync(itemPath, readyForWrite, 'utf8');
                                    } catch (err) {
                                        console.error(`Error processing tref: ${err}`);
                                        fs.writeFileSync(itemPath, currentTref + '\n\n' + '\n\nError processing reference: ' + err.message, 'utf8');
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        console.error(`Error processing file ${itemPath}: ${err}`);
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