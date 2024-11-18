const fs = require('fs');
const path = require('path');

// Function to process markdown files in a directory recursively
function processMarkdownFiles(directory) {
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
                        let modified = false;

                        // Handle specific functionality for `[[def:` lines
                        for (let i = 0; i < lines.length; i++) {
                            if (lines[i].startsWith('[[def:')) {
                                // Ensure a blank line immediately follows `[[def:` lines
                                if (i + 1 < lines.length && lines[i + 1].trim() !== '') {
                                    lines.splice(i + 1, 0, ''); // Insert blank line
                                    modified = true;
                                }
                            }
                        }

                        // Ensure there is exactly one blank line between paragraphs
                        let newLines = [];
                        let previousLineWasEmpty = false;

                        for (let i = 0; i < lines.length; i++) {
                            const isCurrentLineEmpty = lines[i].trim() === '';

                            if (!isCurrentLineEmpty) {
                                newLines.push(lines[i]); // Add non-empty lines
                                previousLineWasEmpty = false;
                            } else if (!previousLineWasEmpty) {
                                newLines.push(''); // Add exactly one blank line
                                previousLineWasEmpty = true;
                            } else {
                                modified = true; // Skip additional blank lines
                            }
                        }

                        // Prepend `~ ` to lines that do not start with `[[def:` and are not blank, and do not already start with `~ `
                        for (let i = 0; i < newLines.length; i++) {
                            if (!newLines[i].startsWith('[[def:') && !newLines[i].startsWith('[[tref:') && newLines[i].trim() !== '' && !newLines[i].startsWith('~ ')) {
                                newLines[i] = `~ ${newLines[i]}`;
                                modified = true;
                            }
                        }

                        // Ensure there is exactly one blank line at the end of the file
                        if (newLines[newLines.length - 1] !== '') {
                            newLines.push('');
                            modified = true;
                        }

                        // Join the lines back into a single string
                        if (modified) {
                            data = newLines.join('\n');
                        }

                        // Write the modified content back to the file synchronously if there were any changes
                        if (modified) {
                            fs.writeFileSync(itemPath, data, 'utf8');
                            console.log(`\n   SPEC-UP-T: Modified ${item.name}` + "\n");
                        }
                    } catch (err) {
                        console.error(`\n   SPEC-UP-T: Error reading or writing file ${item.name}: ${err}` + "\n");
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
    processMarkdownFiles
};
