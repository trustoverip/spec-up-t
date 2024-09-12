const fs = require('fs-extra');
const path = require('path');

// Read and parse the specs.json file
const config = fs.readJsonSync('specs.json');

// Extract the output_path from the specs.json file
const outputPath = config.specs[0].output_path;

// Define the source file path
const sourceFile = path.join(outputPath, 'index.html');

// Define the destination directory path
const destDir = path.join(outputPath, 'versions');

// Ensure the destination directory exists, create it if it doesn't
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Get all files in the destination directory
const files = fs.readdirSync(destDir);

// Initialize the highest version number to 0
let highestVersion = 0;

// Define the pattern to match versioned filenames
const versionPattern = /^index-v(\d+)\.html$/;

// Iterate over each file in the destination directory
files.forEach(file => {
    // Check if the file matches the version pattern
    const match = file.match(versionPattern);
    if (match) {
        // Extract the version number from the filename
        const version = parseInt(match[1], 10);
        // Update the highest version number if the current version is higher
        if (version > highestVersion) {
            highestVersion = version;
        }
    }
});

// Calculate the new version number
const newVersion = highestVersion + 1;

// Define the destination file path with the new version number
const destFile = path.join(destDir, `index-v${newVersion}.html`);

// Copy the source file to the destination file
fs.copyFileSync(sourceFile, destFile);

// Log a message indicating the file has been copied
console.log(`\n   SPEC-UP-T: Created a freezed specification version in ${destFile}\n`);