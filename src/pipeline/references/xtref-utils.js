/**
 * @file Utility helpers for identifying, parsing, and aggregating external term references (xref/tref).
 *
 * These functions were previously embedded in the monolithic `collect-external-references` module.
 * Splitting them into a dedicated utility keeps the collection pipeline focused on orchestration
 * and makes the primitives easier to reuse in other reference-aware stages.
 */

const { externalReferences, utils } = require('../../utils/regex-patterns');

/**
 * Checks if a specific xtref is present in the markdown content.
 *
 * @param {{ externalSpec: string, term: string }} xtref - Reference descriptor.
 * @param {string} markdownContent - Markdown text to inspect.
 * @returns {boolean} True when the reference is found.
 */
function isXTrefInMarkdown(xtref, markdownContent) {
    const regexTerm = utils.createXTrefRegex(xtref.externalSpec, xtref.term);
    return regexTerm.test(markdownContent);
}

/**
 * Finds a reference across multiple markdown files.
 *
 * @param {{ externalSpec: string, term: string }} xtref - Reference descriptor.
 * @param {Map<string, string>} fileContents - Markdown contents keyed by filename.
 * @returns {boolean} True when the reference is found in any file.
 */
function isXTrefInAnyFile(xtref, fileContents) {
    for (const content of fileContents.values()) {
        if (isXTrefInMarkdown(xtref, content)) {
            return true;
        }
    }
    return false;
}

/**
 * Parses an `[[xref:...]]` or `[[tref:...]]` string into a structured object.
 *
 * @param {string} xtref - Raw reference markup including brackets and prefix.
 * @returns {{ externalSpec: string, term: string, referenceType: string, alias?: string }}
 */
function processXTref(xtref) {
    const referenceTypeMatch = xtref.match(externalReferences.referenceType);
    const referenceType = referenceTypeMatch ? referenceTypeMatch[1] : 'unknown';

    const parts = xtref
        .replace(externalReferences.openingTag, '')
        .replace(externalReferences.closingTag, '')
        .trim()
        .split(externalReferences.argsSeparator);

    const xtrefObject = {
        externalSpec: parts[0].trim(),
        term: parts[1].trim(),
        referenceType
    };

    if (parts.length > 2 && parts[2].trim()) {
        xtrefObject.alias = parts[2].trim();
    }

    return xtrefObject;
}

/**
 * Adds new references discovered in markdown to an aggregated collection.
 *
 * @param {string} markdownContent - Markdown text to scan.
 * @param {{ xtrefs: Array<object> }} allXTrefs - Aggregated reference collection.
 * @param {string|null} filename - Originating filename for bookkeeping.
 * @returns {{ xtrefs: Array<object> }} Mutated reference collection.
 */
function addNewXTrefsFromMarkdown(markdownContent, allXTrefs, filename = null) {
    const regex = externalReferences.allXTrefs;

    if (!regex.test(markdownContent)) {
        return allXTrefs;
    }

    const xtrefs = markdownContent.match(regex) || [];

    xtrefs.forEach(rawXtref => {
        const newXTrefObj = processXTref(rawXtref);
        const referenceType = newXTrefObj.referenceType;
        delete newXTrefObj.referenceType;

        const existingIndex = allXTrefs?.xtrefs?.findIndex(existingXTref =>
            existingXTref.term === newXTrefObj.term &&
            existingXTref.externalSpec === newXTrefObj.externalSpec
        );

        if (existingIndex === -1) {
            if (filename) {
                newXTrefObj.sourceFiles = [{ file: filename, type: referenceType }];
            }
            allXTrefs.xtrefs.push(newXTrefObj);
            return;
        }

        if (!filename) {
            return;
        }

        const existingXTref = allXTrefs.xtrefs[existingIndex];
        if (!existingXTref.sourceFiles) {
            existingXTref.sourceFiles = [];
        }

        const newEntry = { file: filename, type: referenceType };
        const alreadyTracked = existingXTref.sourceFiles.some(entry =>
            entry.file === filename && entry.type === referenceType
        );

        if (!alreadyTracked) {
            existingXTref.sourceFiles.push(newEntry);
        }
    });

    return allXTrefs;
}

module.exports = {
    isXTrefInMarkdown,
    isXTrefInAnyFile,
    processXTref,
    addNewXTrefsFromMarkdown
};
