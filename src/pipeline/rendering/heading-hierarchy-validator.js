/**
 * @fileoverview Validates heading hierarchy in rendered HTML.
 * 
 * Detects when heading levels skip (e.g., h3 followed by h5 without h4),
 * which violates W3C accessibility guidelines. Outputs warnings via Logger.
 */

/**
 * Regex to match opening heading tags and their text content in HTML.
 * Captures: (1) heading level number, (2) heading text content.
 * @type {RegExp}
 */
const HEADING_TAG_REGEX = /<h([1-6])[^>]*>([^<]*)/g;

/**
 * Checks rendered HTML for heading hierarchy violations and logs warnings.
 * 
 * A violation occurs when a heading level increases by more than one
 * compared to the previous heading (e.g., h3 directly followed by h5).
 * Going back up (e.g., h4 to h2) is always valid.
 * 
 * @param {string} html - The rendered HTML to validate
 * @param {Object} Logger - The Logger utility with a warn() method
 */
function warnOnHeadingHierarchyViolations(html, Logger) {
  const headings = [];
  let match;

  while ((match = HEADING_TAG_REGEX.exec(html)) !== null) {
    headings.push({
      level: Number.parseInt(match[1], 10),
      text: match[2].trim()
    });
  }

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1];
    const curr = headings[i];

    if (curr.level > prev.level + 1) {
      const skipped = curr.level - prev.level - 1;
      Logger.warn(
        `Heading hierarchy violation: h${curr.level} "${curr.text}" follows h${prev.level} "${prev.text}", skipping ${skipped} level${skipped > 1 ? 's' : ''}`,
        {
          hint: `Add an h${prev.level + 1} heading before this h${curr.level}, or change this heading to h${prev.level + 1}`,
          context: 'W3C accessibility: heading levels should not skip levels when increasing'
        }
      );
    }
  }
}

module.exports = { warnOnHeadingHierarchyViolations };
