const fs = require('fs');
const path = require('path');
const dedent = require('dedent');

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
                } else if (item.isFile() && path.extname(item.name) === '.md') {
                    try {
                        // Read the file synchronously
                        let data = fs.readFileSync(itemPath, 'utf8');

                        // Split the content into lines
                        let lines = data.split('\n');

                        // Variable to store content after the span or tref line
                        let contentAfterSpan = '';

                        const spanMarker = '- - -';
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

${spanMarker}


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