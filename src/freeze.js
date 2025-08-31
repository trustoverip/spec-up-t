/**
 * @file freeze.js
 * @description This script reads the output path from a specs.json file, finds the highest versioned directory in the destination path, and copies the index.html file to a new versioned directory with an incremented version number.
 * 
 * @requires fs-extra - Module for file system operations with additional features.
 * @requires path - Module for handling and transforming file paths.
 * 
 * @example
 * // Assuming specs.json contains:
 * // {
 * //   "specs": [
 * //     {
 * //       "output_path": "path/to/output"
 * //     }
 * //   ]
 * // }
 * 
 * // And the directory structure is:
 * // path/to/output/versions/v1/index.html
 * // path/to/output/versions/v2/index.html
 * 
 * // Running this script will create:
 * // path/to/output/versions/v3/index.html
 * 
 * @version 1.0.0
 * @license MIT
 */

const fs = require('fs-extra'); // Import the fs-extra module for file system operations
const path = require('path'); // Import the path module for handling file paths
const Logger = require('./utils/logger');

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

// Get all directories in the destination directory
const dirs = fs.readdirSync(destDir).filter(file => fs.statSync(path.join(destDir, file)).isDirectory());

// Initialize the highest version number to 0
let highestVersion = 0;

// Define the pattern to match versioned directories
const versionPattern = /^v(\d+)$/;

// Iterate over each directory in the destination directory
dirs.forEach(dir => {
    // Check if the directory matches the version pattern
    const match = dir.match(versionPattern);
    if (match) {
        // Extract the version number from the directory name
        const version = parseInt(match[1], 10);
        // Update the highest version number if the latest version is higher
        if (version > highestVersion) {
            highestVersion = version;
        }
    }
});

// Calculate the new version number
const newVersion = highestVersion + 1;

// Define the new version directory path
const newVersionDir = path.join(destDir, `v${newVersion}`);

// Ensure the new version directory exists, create it if it doesn't
if (!fs.existsSync(newVersionDir)) {
    fs.mkdirSync(newVersionDir, { recursive: true });
}

// Define the destination file path within the new version directory
const destFile = path.join(newVersionDir, 'index.html');

// Copy the source file to the destination file
fs.copyFileSync(sourceFile, destFile);

// Log a message indicating the file has been copied
Logger.success(`Created a freezed specification version in ${destFile}`);