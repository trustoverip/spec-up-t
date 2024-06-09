/**
 * @file This file:
 * This file 
    - splits terms and definitions into separate files based on the term.
    - This is done by creating a file for each term.
    - The file name is based on the term. The content of the file is one term plus the definition of the term.
    - The file path is added to the specs.json file so it is included in the index.html after render.
    - The original glossary file is not changed, but is removed as an entry from the specs.json.
    - If not exists the specs.json file is copied to specs.unsplit.json (one time back-up of `specs.json`).
    - The `spec.json file will have multiple new entries, one entry per defined term. The file can grow large.
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-05-16
 */

//TODO: specs.specs[0] should be replaced with code that loops through all specs

const fs = require('fs');
const path = require('path');
const fixContent = require('./fix-content.js');

// Get the current working directory
const projectRoot = process.cwd();

// if “specs.unsplit.json” does not yet exist, copy “specs.json” to “specs.unsplit.json” so we have a backup
if (!fs.existsSync('specs.unsplit.json')) {
  fs.copyFileSync('specs.json', 'specs.unsplit.json');
}

// Restore original
fs.copyFileSync('specs.unsplit.json', 'specs.json');

// Load the original specs.json file before changes
const specs = require('../specs.json');

/* CONFIG */
const config = {
  termsFileToBeSplit: 'terms_and_definitions.md', // This is the file that will be split up
  termFilesDir: specs.specs[0].spec_terms_directory,
  definitionStringHead: '[[def:' // This is the string that indicates the start of a definition and is used as a divider to split up the files
};
/* END CONFIG */

// Path to directory with the markdown file to be split up
const pathToTermsFileToBeSplit = path.join(projectRoot, "/", specs.specs[0].spec_directory, "/", config.termsFileToBeSplit)

// Path to directory with the resulting files (one term per file)
const pathToTermFilesDir = path.join(projectRoot, "/", specs.specs[0].spec_directory, "/", config.termFilesDir);

// First testing, continue or not?
// Test if a directory exists at the pathToTermFilesDir path
console.log(`Only split if ${pathToTermFilesDir} directory does not exist, or has no markdown files. Otherwise, stop.`);
if (!fs.existsSync(pathToTermFilesDir)) {
  console.log('Directory does not exist. Ok to proceed');
} else {
  console.log('Directory exists');
  const files = fs.readdirSync(pathToTermFilesDir);
  const mdFilesCount = files.filter(file => file.endsWith('.md')).length;

  //test if number of files with extension “.md” is higher than zero
  if (mdFilesCount > 0) {
    console.log('There are .md files in the directory. Stopping.');
    return;
  } else {
    console.log('There are no .md files in the directory. Ok to proceed');
  }
}

// Array that holds markdown filenames in the desired order
const arrMarkdownFileNamesAndFileOrder = specs.specs[0].markdown_paths;

// Position in arrMarkdownFileNamesAndFileOrder where to insert new filenames
let numMarkdownFileNamesAndOrderInsertPosition = arrMarkdownFileNamesAndFileOrder.indexOf(config.termsFileToBeSplit);

/**
 * Inserts the given string into the specified array at the current insert position.
 * @param {Array} markdownFileNamesAndFileOrder - The array to insert the string into.
 * @param {string} termFileName - The string to be inserted.
 */
function insertGlossaryFileNameInSpecsJSON(markdownFileNamesAndFileOrder, termFileName) {
  // Insert the new file name (termFileName) at the current insert position (arrMarkdownFileNamesAndOrderInsertPosition), do not remove anything (0)
  markdownFileNamesAndFileOrder.splice(numMarkdownFileNamesAndOrderInsertPosition, 0, termFileName);

  // The next file should be added one position further:
  numMarkdownFileNamesAndOrderInsertPosition++;
}

// The original filename that points to the file that holds all terms and definitions, and that is going to be split up, is removed from the array that holds the filenames in the desired order
arrMarkdownFileNamesAndFileOrder.splice(numMarkdownFileNamesAndOrderInsertPosition, 1);

// Variable that holds the file content, read from disk
const glossaryFileContent = fs.readFileSync(pathToTermsFileToBeSplit, 'utf8');

// Perform a few basic fixes on the source file
fixContent.fixGlossaryFile(pathToTermsFileToBeSplit);


// Remove directory with the splitted files if it exists
if (fs.existsSync(pathToTermFilesDir)) {
  fs.rmdirSync(pathToTermFilesDir, { recursive: true });
}

// Create directory that is going to hold splitted files if it doesn't exist
if (!fs.existsSync(pathToTermFilesDir)) {
  fs.mkdirSync(pathToTermFilesDir, { recursive: true });
}

// Find the terms by looking at the predictable string that indicates the start of a definition
const termsRegex = /\[\[def: (.*?)\]\]/g;

// Create array with the terms and also meta information about the terms
const matches = [...glossaryFileContent.matchAll(termsRegex)];

// Extract terms. We don't need the meta info, we only need the term, the second element of the match array
const terms = matches.map(match => match[1]);

// Create filenames from terms
let fileNames = terms.map(term => {
  // if there are comma's take the part before the first comma
  let termWithoutComma = term.split(",")[0];

  return `${termWithoutComma.replace(/,/g, '').replace(/\//g, '-').replace(/ /g, '-').toLowerCase()}`;
});

// Add the filename for the glossary introduction
insertGlossaryFileNameInSpecsJSON(arrMarkdownFileNamesAndFileOrder, "glossaryIntro.md");

const sections = glossaryFileContent.split(config.definitionStringHead).slice(1); // slice(1) to remove the first part before the first heading

sections.forEach((section, index) => {
  let filename = '';
  if (terms[index]) {
    filename = `${fileNames[index]}.md`;

    // Write separate files to disk
    fs.writeFileSync(
      // Where to write to:
      path.join(pathToTermFilesDir, "/", filename),
      // What to write:
      config.definitionStringHead + section
    );

    // Add file path to specs
    insertGlossaryFileNameInSpecsJSON(arrMarkdownFileNamesAndFileOrder, path.join(config.termFilesDir, '/', filename));
  }
});

// make string from specs for writing to file
const specsString = JSON.stringify(specs);
fs.writeFileSync("./specs.json", specsString);