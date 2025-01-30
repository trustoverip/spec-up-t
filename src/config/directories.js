const path = require('path');
const directories = {};

// How to require:
// const { addDirectory, getDirectory, getAllDirectories } = require('./config/directories');

// // Example usage
// addDirectory('exampleDir', '/path/to/exampleDir');
// console.log(getDirectory('exampleDir'));
// console.log(getAllDirectories());

// Add directories
directories['output-local-terms'] = path.resolve('output', 'local-terms-dir');

module.exports = {
    /**
     * Adds a directory to the directories object.
     * @param {string} name - The name of the directory.
     * @param {string} dir - The path of the directory.
     */
    addDirectory: (name, dir) => {
        directories[name] = path.resolve(dir);
    },
    /**
     * Gets the resolved path of a directory by its name.
     * @param {string} name - The name of the directory.
     * @returns {string|null} The resolved path of the directory or null if not found.
     */
    getDirectory: (name) => {
        return directories[name] ? path.resolve(directories[name]) : null;
    },
    /**
     * Gets all directories with their resolved paths.
     * @returns {Object} An object containing all directories with their resolved paths.
     */
    getAllDirectories: () => {
        const resolvedDirectories = {};
        for (const [name, dir] of Object.entries(directories)) {
            resolvedDirectories[name] = path.resolve(dir);
        }
        return resolvedDirectories;
    },
};