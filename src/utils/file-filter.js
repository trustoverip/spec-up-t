/**
 * @file Utility functions for filtering files consistently across the codebase
 */

/**
 * Checks if a file is a Markdown file (ends with .md)
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if the file is a Markdown file, false otherwise
 */
function isMarkdownFile(filename) {
    return filename.endsWith('.md');
}

/**
 * Checks if a file is hidden/excluded (starts with underscore)
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if the file is hidden/excluded, false otherwise
 */
function isNotHiddenFile(filename) {
    return !filename.startsWith('_');
}

/**
 * Checks if a file should be processed (is a Markdown file and not hidden)
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if the file should be processed, false otherwise
 */
function shouldProcessFile(filename) {
    return isMarkdownFile(filename) && isNotHiddenFile(filename);
}

module.exports = {
    isMarkdownFile,
    isNotHiddenFile,
    shouldProcessFile
};