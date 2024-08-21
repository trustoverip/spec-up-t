/**
 * @file This file contains a function that adds a blank line at the end of all markdown files in a directory and its subdirectories, only if the blank line is missing.
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-08-20
 */

const fs = require('fs');
const path = require('path');

// Function to process markdown files in a directory recursively
function processMarkdownFiles(directory) {
    // Helper function to process a directory
    function processDirectory(directory) {
        // Read the contents of the directory
        fs.readdir(directory, { withFileTypes: true }, (err, items) => {
            if (err) {
                console.error(`Error reading directory: ${err}`);
                return;
            }

            // Loop through each item in the directory
            items.forEach(item => {
                const itemPath = path.join(directory, item.name);
                if (item.isDirectory()) {
                    // If the item is a directory, call processDirectory recursively
                    processDirectory(itemPath);
                } else if (item.isFile() && path.extname(item.name) === '.md') {
                    // If the item is a markdown file, process it
                    fs.readFile(itemPath, 'utf8', (err, data) => {
                        if (err) {
                            console.error(`Error reading file ${item.name}: ${err}`);
                            return;
                        }

                        // Check if the file ends with a blank line
                        if (!data.endsWith('\n')) {
                            // If not, add a blank line at the end
                            data += '\n';
                            // Write the modified content back to the file
                            fs.writeFile(itemPath, data, 'utf8', err => {
                                if (err) {
                                    console.error(`Error writing file ${item.name}: ${err}`);
                                } else {
                                    console.log(`Added blank line to ${item.name}`);
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    // Start processing from the given directory
    processDirectory(directory);
}

const directoryPath = './spec';
processMarkdownFiles(directoryPath);

module.exports = {
    processMarkdownFiles
}