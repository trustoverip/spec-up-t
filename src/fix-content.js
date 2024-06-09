/**
 * @file This file processes the glossary file, ensuring that there is a blank line after each definition and adding a '~' prefix to any lines that do not start with '[[def:' and are not empty.
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-06-09
 */

const fs = require('fs');
const path = require('path');

module.exports = {
  fixGlossaryFile: function (glossaryFileToBeFixed) {

    /* CONFIG */
    // const glossaryFileToBeFixed = './spec/terms_and_definitions.md';
    /* END CONFIG */

    let glossaryFileContent = fs.readFileSync(glossaryFileToBeFixed, 'utf8');

    let lines = glossaryFileContent.split('\n');
    let newLines = [];
    let previousLine = '';

    /**
     * Processes the lines of a glossary file, ensuring that there is a blank line after each definition.
     */
    for (let i = 0; i < lines.length; i++) {
      if (previousLine.startsWith('[[def:')) {
        if (lines[i].trim() !== '') {
          newLines.push('');
        }
      }
      newLines.push(lines[i]);
      previousLine = lines[i];
    }

    glossaryFileContent = newLines.join('\n');

    fs.writeFileSync(glossaryFileToBeFixed, glossaryFileContent);

    lines = glossaryFileContent.split('\n');
    newLines = [];

    /**
     * Processes the lines in the glossary file, adding a '~' prefix to any lines that do not start with '[[def:' and are not empty.
     */
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith('[[def:') && lines[i].trim() !== '' && !lines[i].startsWith('~')) {
        newLines.push('~ ' + lines[i]);
      } else {
        newLines.push(lines[i]);
      }
    }

    glossaryFileContent = newLines.join('\n');

    fs.writeFileSync(glossaryFileToBeFixed, glossaryFileContent);
  }
}
