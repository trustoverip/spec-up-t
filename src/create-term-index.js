/**
 * Steps:
 * 1. Reads the configuration from 'specs.json'.
 * 2. Extracts the directories containing the specifications and terms.
 * 3. Lists all file names in the specified terms directory.
 * 4. Joins each file name with the terms directory path.
 * 5. Creates an 'output' directory in the project root if it does not exist.
 * 6. Writes the list of file paths to 'term-index.json' in the project root.
 *
 * @requires fs-extra - File system operations with extra methods.
 * @requires path - Utilities for working with file and directory paths.
 * @file src/create-term-index.js
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-09-02
 */

function createTermIndex() {
    const fs = require('fs-extra');
    const path = require('path');
    const config = fs.readJsonSync('specs.json');
    const specDirectories = config.specs.map(spec => spec.spec_directory);
    const specTermDirectoryName = config.specs.map(spec => spec.spec_terms_directory);
    const outputPathJSON = path.join('output', 'term-index.json');
    const files = fs.readdirSync(path.join(specDirectories[0], specTermDirectoryName[0]))
        .filter(file => !file.startsWith('_') && file.endsWith('.md'));

    const filePaths = files.map(file => specTermDirectoryName[0] + '/' + file);

    if (!fs.existsSync('output')) {
        fs.mkdirSync('output');
    }

    fs.writeJsonSync(outputPathJSON, filePaths, { spaces: 2 });
    
    console.log(`✅ The new terms were added. All done.`);
}

module.exports = {
    createTermIndex
}