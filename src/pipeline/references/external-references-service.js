const cheerio = require("cheerio");
const axios = require('axios').default;
const fs = require('fs-extra');
const Logger = require('../../utils/logger.js');

const spaceRegex = /\s+/g;

function validateReferences(references, definitions, render) {
  const unresolvedRefs = [];
  [...new Set(references)].forEach(
    ref => {
      if (render.includes(`id="term:${ref.replace(spaceRegex, '-').toLowerCase()}"`)) {
        // Reference is resolved
      } else {
        unresolvedRefs.push(ref);
      }
    }
  );
  if (unresolvedRefs.length > 0) {
    Logger.warn(`Unresolved References: ${unresolvedRefs.join(',')}`);
  }

  const danglingDefs = [];
  definitions.forEach(def => {
    // Handle both old array format and new object format
    if (Array.isArray(def)) {
      let found = def.some(term => render.includes(`href="#term:${term.replace(spaceRegex, '-').toLowerCase()}"`))
      if (!found) {
        danglingDefs.push(def[0]);
      }
    } else if (def.term) {
      // New object format
      const terms = [def.term, def.alias].filter(Boolean);
      let found = terms.some(term => render.includes(`href="#term:${term.replace(spaceRegex, '-').toLowerCase()}"`))
      if (!found) {
        danglingDefs.push(def.term);
      }
    }
  })
  if (danglingDefs.length > 0) {
    Logger.warn(`Dangling Definitions: ${danglingDefs.join(',')}`);
  }
}

function findExternalSpecByKey(config, key) {
  if (!config || !config.specs) return null;
  for (const spec of config.specs) {
    if (spec.external_specs) {
      for (const externalSpec of spec.external_specs) {
        if (externalSpec.external_spec === key) {
          return externalSpec;
        }
      }
    }
  }
  return null;
}

async function fetchExternalSpecs(spec) {
  try {
    let results = await Promise.all(
      spec.external_specs.map(s => {
        const url = s["gh_page"];
        return axios.get(url).catch(error => ({ error, url }));
      })
    );

    const failed = results.filter(r => r && r.error);
    if (failed.length > 0) {
      failed.forEach(f => {
        const msg = f.error.response
          ? `HTTP ${f.error.response.status} for ${f.url}`
          : `Network error for ${f.url}: ${f.error.message}`;
        Logger.error("External spec fetch failed:", msg);
      });
    }

    // Map results to extract terms instead of creating DOM HTML
    const extractedTerms = [];

    results
      .map((r, index) =>
        r && r.status === 200
          ? { externalSpec: spec.external_specs[index].external_spec, data: r.data }
          : null
      )
      .filter(r => r) // Remove null values (failed fetches)
      .forEach(r => {
        // Extract terms from each external spec's HTML
        const termsFromSpec = extractTermsFromHtml(r.externalSpec, r.data);
        extractedTerms.push(...termsFromSpec);
      });

    return extractedTerms;
  } catch (e) {
    Logger.error("Unexpected error in fetchExternalSpecs:", e);
    return [];
  }
}


/**
 * Merges xref terms from external specs into the allXTrefs structure
 * @param {Array} xrefTerms - Array of xref term objects from fetchExternalSpecs
 * @param {string} outputPathJSON - Path to the xtrefs-data.json file
 * @param {string} outputPathJS - Path to the xtrefs-data.js file
 * @returns {Promise<void>}
 */
async function mergeXrefTermsIntoAllXTrefs(xrefTerms, outputPathJSON, outputPathJS) {
  try {
    let allXTrefs = { xtrefs: [] };

    // Load existing xtrefs data if it exists
    if (fs.existsSync(outputPathJSON)) {
      allXTrefs = fs.readJsonSync(outputPathJSON);
    }

    // Add xref terms to the allXTrefs structure
    // Mark them with source: 'xref' to distinguish from tref entries
    // Track how many terms were matched vs skipped for logging purposes
    let matchedCount = 0;
    let skippedCount = 0;

    xrefTerms.forEach(xrefTerm => {
      // Check if this term already exists (match by externalSpec and term only)
      // Don't filter by source because entries from markdown scanning don't have source field
      const existingIndex = allXTrefs.xtrefs.findIndex(existing =>
        existing.externalSpec === xrefTerm.externalSpec &&
        existing.term === xrefTerm.term
      );

      if (existingIndex >= 0) {
        // Get the existing entry to check if it's a tref
        const existingXtref = allXTrefs.xtrefs[existingIndex];
        
        // Update existing entry - preserve the existing metadata but add/update content
        allXTrefs.xtrefs[existingIndex] = {
          ...existingXtref,
          content: xrefTerm.content,  // Update the content from fetched HTML
          classes: xrefTerm.classes || [], // Update classes from dt element
          source: xrefTerm.source,     // Add source field
          termId: xrefTerm.termId,     // Add termId if not present
          lastUpdated: new Date().toISOString()
        };

        // Check if this is a tref to an external tref (nested tref)
        // A term with 'term-external' class means it's transcluded from another spec
        const isExternalTref = xrefTerm.classes && xrefTerm.classes.includes('term-external');
        const isTref = existingXtref.sourceFiles && existingXtref.sourceFiles.some(sf => sf.type === 'tref');

        if (isExternalTref && isTref) {
          // Build a readable list of source files for the error message
          const sourceFilesList = existingXtref.sourceFile 
            ? existingXtref.sourceFile 
            : (existingXtref.sourceFiles || []).map(sf => sf.file).join(', ');
          
          // Construct the external repository URL
          const externalRepoUrl = existingXtref.ghPageUrl || existingXtref.repoUrl || `https://github.com/${existingXtref.owner}/${existingXtref.repo}`;
          
          Logger.error(`Origin: ${sourceFilesList} 👉 NESTED TREF DETECTED: Term "${existingXtref.term}" in ${existingXtref.externalSpec} is itself a tref (transcluded from another spec). This creates a chain of external references. Consider using [[xref:${existingXtref.externalSpec},${existingXtref.term}]] instead. (${externalRepoUrl})`);
        }

        matchedCount++;
      } else {
        // Skip terms that are not referenced in the local markdown files
        // This prevents bloating the xtrefs-data.json with unreferenced terms
        skippedCount++;
      }
    });

    // Write the updated data back to files
    const allXTrefsStr = JSON.stringify(allXTrefs, null, 2);
    fs.writeFileSync(outputPathJSON, allXTrefsStr, 'utf8');

    const stringReadyForFileWrite = `const allXTrefs = ${allXTrefsStr};`;
    fs.writeFileSync(outputPathJS, stringReadyForFileWrite, 'utf8');

    Logger.success(`Merged xref terms: ${matchedCount} matched, ${skippedCount} skipped (not referenced). Total entries: ${allXTrefs.xtrefs.length}`);

  } catch (error) {
    Logger.error('Error merging xref terms into allXTrefs:', error.message);
  }
}

/**
 * Extracts terms and their definitions from HTML and returns them as structured data
 * @param {string} externalSpec - The external spec identifier
 * @param {string} html - The HTML content to parse
 * @returns {Array} Array of term objects suitable for the allXTrefs structure
 */
function extractTermsFromHtml(externalSpec, html) {
  try {
    const $ = cheerio.load(html);
    const terms = [];

    const termElements = $('dl.terms-and-definitions-list dt');
    Logger.highlight(`Found ${termElements.length} term elements in ${externalSpec} (HTML size: ${Math.round(html.length / 1024)}KB)`);

    // Process terms in batches to prevent stack overflow with large datasets
    const BATCH_SIZE = 100;
    const totalElements = termElements.length;

    for (let i = 0; i < totalElements; i += BATCH_SIZE) {
      const batch = termElements.slice(i, i + BATCH_SIZE);

      batch.each((index, termElement) => {
        try {
          const $termElement = $(termElement);
          
          // The id can be on the dt element itself OR on span(s) inside it
          // Some terms have multiple nested spans with different IDs (e.g., aliases)
          // We need to extract ALL term IDs from the dt element
          const termIds = [];
          
          // First check if dt itself has an id
          const dtId = $termElement.attr('id');
          if (dtId && dtId.includes('term:')) {
            termIds.push(dtId.replace('term:', ''));
          }
          
          // Then find all spans with ids that contain 'term:'
          $termElement.find('span[id*="term:"]').each((i, span) => {
            const spanId = $(span).attr('id');
            if (spanId && spanId.includes('term:')) {
              const termName = spanId.replace('term:', '');
              if (!termIds.includes(termName)) {
                termIds.push(termName);
              }
            }
          });
          
          // Skip if no valid term IDs found
          if (termIds.length === 0) {
            return;
          }

          // Extract classes from the <dt> element to determine if it's a local or external term.
          // This helps identify if a tref to an external resource is itself a tref (term-external).
          const dtClasses = $termElement.attr('class');
          const classArray = dtClasses ? dtClasses.split(/\s+/).filter(Boolean) : [];
          const termClasses = classArray.filter(cls => cls === 'term-local' || cls === 'term-external');
          
          const dd = $termElement.next('dd');

          if (dd.length > 0) {
            const ddContent = $.html(dd); // Store the complete DD content once
            
            // Create a term object for each ID found in this dt element
            // This handles cases where one term definition has multiple aliases
            termIds.forEach(termName => {
              const termObj = {
                externalSpec: externalSpec,
                term: termName,
                content: ddContent,
                classes: termClasses, // CSS classes from dt element (term-local or term-external)
                // Add metadata for consistency with tref structure
                source: 'xref', // Distinguish from tref entries
                termId: `term:${termName}`, // Term ID matches the actual HTML anchor format
              };

              terms.push(termObj);
            });
          }
        } catch (termError) {
          Logger.warn(`Error processing term in ${externalSpec}:`, termError.message);
        }
      });

      // Log progress for very large datasets
      if (totalElements > 1000 && i % (BATCH_SIZE * 10) === 0) {
        Logger.progress(Math.min(i + BATCH_SIZE, totalElements), totalElements, `Processing terms from ${externalSpec}`);
      }
    }

    Logger.success(`Extracted ${terms.length} terms from external spec: ${externalSpec}`);
    return terms;

  } catch (error) {
    Logger.error(`Error extracting terms from external spec '${externalSpec}':`, error.message);
    return [];
  }
}

module.exports = {
  findExternalSpecByKey,
  validateReferences,
  fetchExternalSpecs,
  extractTermsFromHtml,
  mergeXrefTermsIntoAllXTrefs
}
