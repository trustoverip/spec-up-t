/**
 * @file prepare-tref.js
 * @description This script contains functions to process and prepare term references (trefs) from markdown files.
 * It includes functionality to read local xtref content from a JSON file and process markdown files in a directory recursively. This script inserts the content of the local xtref (in JSON) into the markdown files. It also inserts a note that this content is temporary and can be removed.
 * 
 * @module prepareTref
 * @requires fs
 * @requires path
 */

const fs = require('fs');
const path = require('path');

function getLocalXTrefContent(externalSpec, term) {
    const filePath = path.join('output', 'xtrefs-data.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const xtrefs = data.xtrefs;

    for (const xtref of xtrefs) {
        if (xtref.externalSpec === externalSpec && xtref.term === term) {
            return {content: xtref.content, commitHash: xtref.commitHash};
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
                } else if (item.isFile() && path.extname(item.name) === '.md') {
                    try {
                        // Read the file synchronously
                        let data = fs.readFileSync(itemPath, 'utf8');

                        // Split the content into lines
                        let lines = data.split('\n');
                        let localXTrefContent = '';
                        // Handle specific functionality for `[[tref:` lines
                        for (let i = 0; i < lines.length; i++) {
                            if (lines[i].startsWith('[[tref:')) {

                                /*
                                    \[\[tref: matches the literal [[tref:.

                                    (.*?) captures everything lazily until the next part of the regex.

                                    \]\] matches the literal ]].

                                    match[1] contains the captured group, which is then split by , to form an array.

                                    The map function trims spaces from each entry in the resulting array.
                                */
                                const tref = /\[\[tref:(.*?)\]\]/;
                                const match = lines[i].match(tref);
                                if (match) {
                                    const result = match[1].split(',').map(term => term.trim());
                                    localXTrefContent = getLocalXTrefContent(result[0], result[1]);

                                    /* 

                                        Remove the `[[def: ...]]:` lines from the content.

                                        \[\[def: matches the literal [[def:
                                        
                                        .*? lazily matches any character(including commas) until the next part of the regex.
                                        
                                        \]\]: matches the literal ]]:.
                                        
                                        The g flag ensures that all occurrences in the string are replaced.
                                    */
                                    const defPart = /\[\[def: .*?\]\]:/g;
                                    localXTrefContent.content = localXTrefContent.content.replace(defPart, '');

                                    fs.writeFileSync(itemPath, match[0] + '\n\n' + '<!-- This is a copy of the saved remote text. Remove it if you like. It is automatically (re)generated --><span class="transcluded-xref-term">transcluded xref</span>' + '\n\n~ Commit Hash: ' + localXTrefContent.commitHash + '\n\n\n' + localXTrefContent.content, 'utf8');
                                }
                            }
                        }
                    } catch (err) {
                        // console.error(`\n   SPEC-UP-T: Error reading or writing file ${item.name}: ${err}` + "\n");
                    }
                }
            });
        } catch (err) {
            console.error(`\n   SPEC-UP-T: Error reading directory: ${err}` + "\n");
        }
    }

    // Start processing from the given directory
    processDirectory(directory);
}

module.exports = {
    prepareTref
};
