/**
 * @file This file creates a json and a js file with an an object that contains the relations between terms
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-06-22
 */

const fs = require('fs-extra');
const config = fs.readJsonSync('specs.json');
const specDirectories = config.specs.map(spec => spec.spec_directory + '/' + spec.spec_terms_directory);

// Create directory named “output” in the project root if it does not yet exist
if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
}

// Create a path for the output file in the project root
const outputPathJSON = path.join(config.specs[0].output_path, 'term-relations-data.json');
const outputPathJS = path.join(config.specs[0].output_path, 'term-relations-data.js');

function createTermRelations() {
    let allDefs = {};
    allDefs.defs = new Set();

    // Go through all directories that contain files with a term and definition
    console.log('All “spec_directory” found in specs.json: ', specDirectories);
    specDirectories.forEach(specDirectory => {
        // read directory
        fs.readdirSync(specDirectory).forEach(file => {
            // read file
            if (file.endsWith('.md')) {
                const markdown = fs.readFileSync(`${specDirectory}/${file}`, 'utf8');

                let regexDef = /\[\[def:.*?\]\]/g;
                let regexRef = /\[\[ref:.*?\]\]/g;
                let regexXref = /\[\[xref:.*?\]\]/g;

                let entry = {};

                if (regexDef.test(markdown)) {
                    const defs = markdown.match(regexDef);
                    let refs = markdown.match(regexRef);
                    let xrefs = markdown.match(regexXref);

                    defs.forEach(def => {
                        // remove “[[def:” from the beginning of every value in allMatches
                        def = def.replace(/\[\[def:/, '');

                        // remove “]]” from the end of every value in allMatches
                        def = def.replace(/\]\]/, '');

                        // trim every entry of allMatches
                        def = def.trim();

                        // Split the input on the first comma
                        let [term, rest] = def.split(/,(.+)/);

                        // Trim the term
                        term = term.trim();

                        entry.term = term;
                        // Split the rest into an array of synonyms if it exists, otherwise use a placeholder
                        let synonyms = rest ? rest.split(',').map(s => s.trim()) : [];
                        entry.synonyms = synonyms;
                    });

                    if (refs !== null) {
                        entry.refs = [];
                        refs.forEach(ref => {
                            // remove “[[ref:” from the beginning of every value in allMatches
                            ref = ref.replace(/\[\[ref:/, '');
                            // remove “]]” from the end of every value in allMatches
                            ref = ref.replace(/\]\]/, '');
                            // trim every entry of allMatches
                            ref = ref.trim();
                            entry.refs.push(ref);
                        });
                    }

                    if (xrefs !== null) {
                        entry.xrefs = [];
                        xrefs.forEach(xref => {
                            // remove “[[xref:” from the beginning of every value in allMatches
                            xref = xref.replace(/\[\[xref:/, '');
                            // remove “]]” from the end of every value in allMatches
                            xref = xref.replace(/\]\]/, '');
                            // trim every entry of allMatches
                            xref = xref.trim();
                            entry.xrefs.push(xref);
                        });
                    }
                }
                allDefs.defs.add(entry);
            }
        });
    })
    // Convert the Set back to an Array if needed
    allDefs.defs = Array.from(allDefs.defs);

    // Convert allXrefsStr to a JSON string with indentation
    const allDefsStr = JSON.stringify(allDefs, null, 2);

    // Write the JSON code to a .json file
    fs.writeFileSync(outputPathJSON, allDefsStr, 'utf8');


    // Create the JS code for the assignment
    const stringReadyForFileWrite = `const allTermRelations = ${allDefsStr};`;

    // Write the JS code to a .js file
    fs.writeFileSync(outputPathJS, stringReadyForFileWrite, 'utf8');
}

module.exports = {
    createTermRelations
}