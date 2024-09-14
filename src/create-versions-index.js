/**
 * @file create-versions-index.js
 * @description This script reads the configuration from specs.json, checks for the existence of a versions directory, creates it if it doesn't exist, and generates an index.html file listing all HTML files in the directory.
 * 
 * @requires fs-extra - File system operations with extra methods.
 * @requires path - Utilities for working with file and directory paths.
 * 
 * @example
 * // To run this script, use the following command:
 * // node create-versions-index.js
 * 
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');

function createVersionsIndex() {
    // Read and parse the specs.json file
    const config = fs.readJsonSync('specs.json');

    // Extract the output_path from the specs.json file
    const outputPath = config.specs[0].output_path;

    // Directory containing the version files
    const versionsDir = path.join(outputPath, 'versions');

    // Check if the directory exists, if not create it
    if (!fs.existsSync(versionsDir)) {
        fs.mkdirSync(versionsDir, { recursive: true });
        console.log('Directory created:', versionsDir);
    }

    // Read the contents of the directory
    fs.readdir(versionsDir, (err, files) => {
        if (err) {
            return console.error('Unable to scan directory:', err);
        }

        // Filter to include only .html files
        const htmlFiles = files.filter(file => file.endsWith('.html'));

        // Generate HTML content
        let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spec-Up-T Snapshot Index</title>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400&display=swap" rel="stylesheet">
  <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { font-family: 'Heebo', Arial, sans-serif; background: #A9DDE0}
    ul { list-style-type: none; padding: 0; }
    li { margin: 10px 0; }
    a { text-decoration: none; color: #007BFF; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body class="container mt-5">
  <h1 class="mb-4">Spec-Up-T Snapshot Index</h1>
  <p>This page lists all available snapshots of this Spec-Up-T specification.</p>
  <ul class="list-group">
    <li class="list-group-item"><a href="../index.html">Current version</a></li>
`;

        if (htmlFiles.length === 0) {
            htmlContent += `    <li class="list-group-item">No versions available</li>\n`;
        } else {
            htmlFiles
                .filter(file => file !== 'index.html') // Exclude index.html
                .forEach(file => {
                    htmlContent += `    <li class="list-group-item"><a href="${file}">${file}</a></li>\n`;
                });
        }

        htmlContent += `
  </ul>
</body>
</html>
`;
        const outputPath = path.join(versionsDir, 'index.html');
        fs.writeFile(outputPath, htmlContent, err => {
            if (err) {
                return console.error('Error writing file:', err);
            }
            console.log('index.html has been created successfully.');
        });    });
}

// Export the function
module.exports = createVersionsIndex;

// If the script is run directly, execute the function
if (require.main === module) {
    createVersionsIndex();
}