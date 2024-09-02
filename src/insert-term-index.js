/**
 * Inserts term index into the specification.
 *
 * This function inserts the entries in term-index.json 
 * term directories, and updates the specification with the term index.
 *
 * @function
 * @name insertTermIndex
 * @returns {void}
 * @file src/insert-term-index.js
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-09-02
 */

function insertTermIndex() {
    const fs = require('fs-extra');
    const path = require('path');
    const config = fs.readJsonSync('./specs.json');
    const terms = fs.readJsonSync('./term-index.json');
    const outputPathJSON = path.join('output', 'specs-generated.json');
    let specGenerated = config;
    let markdownPaths = specGenerated.specs[0].markdown_paths;

    const index = markdownPaths.indexOf('terms-and-definitions-intro.md');
    if (index !== -1) {
        // Insert the items of the "terms" array after the found index
        markdownPaths.splice(index + 1, 0, ...terms);
    }

    // Save the updated specGenerated object back to the JSON file
    fs.writeJsonSync(outputPathJSON, specGenerated, { spaces: 2 });

    // Create directory named “output” in the project root if it does not yet exist
    if (!fs.existsSync('output')) {
        fs.mkdirSync('output');
    }

    fs.writeJsonSync(outputPathJSON, specGenerated, { spaces: 2 });
}

module.exports = {
    insertTermIndex
}