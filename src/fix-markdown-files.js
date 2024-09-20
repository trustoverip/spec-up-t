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

                        // Iterate through the lines
                        for (let i = 0; i < lines.length; i++) {
                            // Check if the line starts with [[def:
                            if (lines[i].startsWith('[[def:')) {
                                // Check if the next line is not a blank line
                                if (i + 1 < lines.length && lines[i + 1].trim() !== '') {
                                    // Insert a blank line
                                    lines.splice(i + 1, 0, '');
                                    modified = true;
                                }
                            }
                        }

                        // Ensure there is an empty line between paragraphs
                        for (let i = 0; i < lines.length - 1; i++) {
                            if (lines[i].trim() !== '' && lines[i + 1].trim() !== '') {
                                lines.splice(i + 1, 0, '');
                                modified = true;
                            }
                        }

                        // Prepend `~ ` to lines that do not start with `[[def:` and are not blank lines, and do not already start with `~ `
                        for (let i = 0; i < lines.length; i++) {
                            if (!lines[i].startsWith('[[def:') && lines[i].trim() !== '' && !lines[i].startsWith('~ ')) {
                                lines[i] = `~ ${lines[i]}`;
                                modified = true;
                            }
                        }

                        // Join the lines back into a single string
                        if (modified) {
                            data = lines.join('\n');
                        }

                        // Ensure there is exactly one blank line at the end of the file
                        let trimmedData = data.trimEnd() + '\n';
                        if (data !== trimmedData) {
                            data = trimmedData;
                            modified = true;
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