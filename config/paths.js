const path = require('path');
const paths = {};

// A path can be a directory or a file
//
// How to require:
// const { addPath, getPath, getAllPaths } = require('./config/paths');
//
// // Example usage
// addPath('exampleDir', '/path/to/examplePath');
// console.log(getPath('examplePath'));
// console.log(getAllPaths());

// Add paths
paths['output-local-terms'] = path.resolve('.cache', 'local-terms-dir');
paths['specsjson'] = path.resolve('specs.json');
paths['githubcache'] = path.resolve('.cache', 'github-cache');

module.exports = {
    /**
     * Adds a directory or file to the directories object.
     * @param {string} name - The name of the directory.
     * @param {string} dir - The path of the directory.
     */
    addPath: (name, dir) => {
        paths[name] = path.resolve(dir);
    },
    /**
     * Gets the resolved path of a directory or file by its name.
     * @param {string} name - The name of the directory.
     * @returns {string|null} The resolved path of the directory or null if not found.
     */
    getPath: (name) => {
        return paths[name] ? path.resolve(paths[name]) : null;
    },
    /**
     * Gets all directories or files with their resolved paths.
     * @returns {Object} An object containing all directories with their resolved paths.
     */
    getAllPaths: () => {
        const resolvedPaths = {};
        for (const [name, dir] of Object.entries(paths)) {
            resolvedPaths[name] = path.resolve(dir);
        }
        return resolvedPaths;
    },
};