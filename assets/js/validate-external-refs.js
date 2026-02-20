/**
 * @fileoverview Validates external references (xrefs and trefs) by fetching live data from external gh-pages.
 * 
 * This script runs on page load and checks if external references are still valid:
 * - Checks if the referenced term still exists in the external specification
 * - Checks if the definition content has changed
 * - Displays visual indicators next to references when issues are detected
 * 
 * The validation works by:
 * 1. Collecting all unique external specifications from the page
 * 2. Fetching the live gh-page HTML for each external spec
 * 3. Extracting term definitions from the fetched HTML
 * 4. Comparing with the cached data in allXTrefs
 * 5. Adding visual indicators for missing or changed terms
 */

/**
 * Configuration object for the validator
 * @type {Object}
 */
const VALIDATOR_CONFIG = {
    // CSS classes for different validation states
    classes: {
        indicator: 'external-ref-validation-indicator',
        missing: 'external-ref-missing',
        changed: 'external-ref-changed',
        valid: 'external-ref-valid',
        error: 'external-ref-error'
    },
    // Text labels for indicators
    labels: {
        missing: '⚠️ Term not found',
        changed: '🔄 Definition changed',
        error: '❌ Could not verify',
        valid: '✓ Verified'
    },
    // Whether to show valid indicators (can be noisy)
    showValidIndicators: false,
    // Cache timeout in milliseconds (5 minutes)
    cacheTimeout: 5 * 60 * 1000,
    // Similarity threshold (0-1) - only show changed indicator if similarity is below this
    // 0.95 means content must be at least 95% similar to be considered unchanged
    // This prevents false positives from minor formatting differences
    similarityThreshold: 0.95,
    // Enable debug logging to console (set to true to see comparison details)
    debug: true
};

/**
 * Cache for fetched external specifications
 * Prevents redundant fetches for the same spec
 * @type {Map<string, {timestamp: number, data: Object}>}
 */
const fetchCache = new Map();

/**
 * Collector for validation results to populate the changes report
 * Each entry contains details about a changed or missing reference
 * @type {Array<Object>}
 */
const validationResults = [];

/**
 * Normalizes HTML content for comparison by extracting text and normalizing whitespace
 * This helps compare definitions that might have minor formatting differences
 * 
 * @param {string} html - The HTML content to normalize
 * @returns {string} - Normalized text content
 */
function normalizeContent(html) {
    if (!html) return '';
    
    // Create a temporary element to parse HTML and extract text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get text content and normalize whitespace
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Normalize the text
    text = text
        .toLowerCase()
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
        .replace(/\s+/g, ' ') // Collapse all whitespace to single spaces
        .replace(/\s*([.,;:!?])\s*/g, '$1 ') // Normalize punctuation spacing
        .trim();
    
    return text;
}

/**
 * Calculates the similarity between two text strings
 * Returns a value between 0 (completely different) and 1 (identical)
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score between 0 and 1
 */
function calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    // Calculate Levenshtein distance
    const editDistance = levenshteinDistance(shorter, longer);
    return (longer.length - editDistance) / longer.length;
}

/**
 * Calculates the Levenshtein distance between two strings
 * This measures the minimum number of single-character edits needed
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Edit distance
 */
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

/**
 * Extracts terms and their definitions from fetched HTML content
 * Parses the HTML structure used by Spec-Up-T specifications
 * 
 * @param {string} html - The full HTML of the fetched page
 * @returns {Map<string, {content: string, rawContent: string}>} - Map of term IDs to their definitions
 */
function extractTermsFromHtml(html) {
    const terms = new Map();
    
    // Create a DOM parser to work with the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find all dt elements in terms-and-definitions-list
    const termElements = doc.querySelectorAll('dl.terms-and-definitions-list dt');
    
    termElements.forEach(dt => {
        // Extract term ID from the span element
        const termSpan = dt.querySelector('[id^="term:"]');
        if (!termSpan) return;
        
        const termId = termSpan.id;
        // Extract just the term name (last part after the last colon)
        const termName = termId.split(':').pop();
        
        // Get the definition content from ALL following dd element(s)
        // NOTE: We collect ALL dd elements to match what's cached in allXTrefs
        // Terms can have multiple dd blocks for extended definitions
        const ddElements = [];
        let definitionContent = '';
        let rawContent = '';
        let sibling = dt.nextElementSibling;
        
        // Collect all consecutive dd elements, skipping meta-info wrappers
        while (sibling && sibling.tagName === 'DD') {
            // Skip meta-info wrapper elements for trefs
            if (!sibling.classList.contains('meta-info-content-wrapper')) {
                ddElements.push(sibling);
            }
            sibling = sibling.nextElementSibling;
        }
        
        if (ddElements.length > 0) {
            // Combine all dd elements' raw HTML
            rawContent = ddElements.map(dd => dd.outerHTML).join('\n');
            // Combine all dd elements' text content
            definitionContent = ddElements.map(dd => dd.textContent).join('\n');
        }
        
        terms.set(termName.toLowerCase(), {
            content: definitionContent.trim(),
            rawContent: rawContent,
            termId: termId
        });
    });
    
    return terms;
}

/**
 * Fetches the external specification page and extracts term definitions
 * Uses caching to prevent redundant fetches
 * 
 * @param {string} ghPageUrl - The URL of the external specification's gh-page
 * @param {string} specName - The name of the external specification (for logging)
 * @returns {Promise<Map<string, Object>|null>} - Map of terms or null if fetch fails
 */
async function fetchExternalSpec(ghPageUrl, specName) {
    // Check cache first
    const cached = fetchCache.get(ghPageUrl);
    if (cached && (Date.now() - cached.timestamp) < VALIDATOR_CONFIG.cacheTimeout) {
        return cached.data;
    }
    
    try {
        const response = await fetch(ghPageUrl, {
            mode: 'cors',
            headers: {
                'Accept': 'text/html'
            }
        });
        
        if (!response.ok) {
            console.warn(`[External Ref Validator] Failed to fetch ${specName}: ${response.status}`);
            return null;
        }
        
        const html = await response.text();
        const terms = extractTermsFromHtml(html);
        
        // Cache the result
        fetchCache.set(ghPageUrl, {
            timestamp: Date.now(),
            data: terms
        });
        
        return terms;
    } catch (error) {
        console.warn(`[External Ref Validator] Error fetching ${specName}:`, error.message);
        return null;
    }
}

/**
 * Finds and extracts the differences between two texts
 * Returns objects with the unique parts from each text
 * 
 * @param {string} text1 - First text (cached)
 * @param {string} text2 - Second text (live)
 * @returns {Object} - Object with oldUnique and newUnique properties
 */
function findTextDifferences(text1, text2) {
    // Split texts into lines for comparison
    const lines1 = text1.split(/\n+/).filter(line => line.trim());
    const lines2 = text2.split(/\n+/).filter(line => line.trim());
    
    // Find lines that are only in text1 (removed)
    const oldUnique = lines1.filter(line => !lines2.includes(line));
    
    // Find lines that are only in text2 (added)
    const newUnique = lines2.filter(line => !lines1.includes(line));
    
    return {
        oldUnique: oldUnique.length > 0 ? oldUnique.join('\n') : '(no removed content)',
        newUnique: newUnique.length > 0 ? newUnique.join('\n') : '(no added content)',
        hasDifferences: oldUnique.length > 0 || newUnique.length > 0
    };
}

/**
 * Creates a validation indicator element to display next to a reference
 * 
 * @param {string} type - The type of indicator: 'missing', 'changed', 'valid', or 'error'
 * @param {Object} details - Additional details to show in the indicator
 * @param {string} [details.message] - Custom message to display
 * @param {string} [details.oldContent] - The old/cached content
 * @param {string} [details.newContent] - The new/live content
 * @returns {HTMLElement} - The indicator element
 */
function createIndicator(type, details = {}) {
    const indicator = document.createElement('span');
    indicator.classList.add(
        VALIDATOR_CONFIG.classes.indicator,
        VALIDATOR_CONFIG.classes[type]
    );
    
    // Set the main label text
    const labelText = details.message || VALIDATOR_CONFIG.labels[type];
    indicator.setAttribute('title', labelText);
    
    // Create the visible indicator content
    const iconSpan = document.createElement('span');
    iconSpan.classList.add('indicator-icon');
    iconSpan.textContent = VALIDATOR_CONFIG.labels[type].split(' ')[0]; // Just the emoji
    indicator.appendChild(iconSpan);
    
    // For changed content, add a details popup
    if (type === 'changed' && details.oldContent && details.newContent) {
        indicator.classList.add('has-details');
        
        // Find the actual differences between old and new content
        const diff = findTextDifferences(details.oldContent, details.newContent);
        
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('validation-details');
        const similarityText = details.similarity ? `<div class="validation-similarity">Similarity: ${details.similarity}</div>` : '';
        
        // Show only the differences if they exist, otherwise show full content
        if (diff.hasDifferences) {
            detailsDiv.innerHTML = `
                <div class="validation-details-header">Definition Changed - Showing Differences</div>
                ${similarityText}
                <div class="validation-details-section">
                    <strong>Removed from cached version:</strong>
                    <div class="validation-content-old">${escapeHtml(truncateText(diff.oldUnique, 300))}</div>
                </div>
                <div class="validation-details-section">
                    <strong>Added in live version:</strong>
                    <div class="validation-content-new">${escapeHtml(truncateText(diff.newUnique, 300))}</div>
                </div>
                <div class="validation-details-footer">
                    <em>Rebuild the spec to update the definition</em>
                </div>
            `;
        } else {
            // Fallback to showing full content if diff detection fails
            detailsDiv.innerHTML = `
                <div class="validation-details-header">Definition Changed</div>
                ${similarityText}
                <div class="validation-details-section">
                    <strong>Cached (at build time):</strong>
                    <div class="validation-content-old">${escapeHtml(truncateText(details.oldContent, 500))}</div>
                </div>
                <div class="validation-details-section">
                    <strong>Current (live):</strong>
                    <div class="validation-content-new">${escapeHtml(truncateText(details.newContent, 500))}</div>
                </div>
                <div class="validation-details-footer">
                    <em>Rebuild the spec to update the definition</em>
                </div>
            `;
        }
        indicator.appendChild(detailsDiv);
    }
    
    // For missing terms, add a simple tooltip
    if (type === 'missing') {
        indicator.classList.add('has-details');
        
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('validation-details');
        detailsDiv.innerHTML = `
            <div class="validation-details-header">Term Not Found</div>
            <div class="validation-details-section">
                The term referenced here no longer exists in the external specification.
                It may have been renamed, moved, or removed.
            </div>
            <div class="validation-details-footer">
                <em>Check the external specification for updates</em>
            </div>
        `;
        indicator.appendChild(detailsDiv);
    }
    
    return indicator;
}

/**
 * Escapes HTML special characters to prevent XSS
 * 
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Truncates text to a maximum length with ellipsis
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
}

/**
 * Records a validation result for the changes report
 * 
 * @param {Object} result - The validation result to record
 * @param {string} result.type - 'changed', 'missing', or 'error'
 * @param {string} result.refType - 'xref' or 'tref'
 * @param {string} result.term - The term name
 * @param {string} result.externalSpec - The external specification name
 * @param {string} [result.similarity] - Similarity percentage (for changed)
 * @param {string} [result.oldContent] - Old cached content
 * @param {string} [result.newContent] - New live content
 * @param {HTMLElement} result.element - The DOM element
 */
function recordValidationResult(result) {
    validationResults.push(result);
}

/**
 * Validates a single xref element against live data
 * 
 * @param {HTMLElement} element - The xref anchor element
 * @param {Map<string, Map<string, Object>>} liveData - Map of spec URLs to their live term data
 * @param {Object} cachedXtref - The cached xtref data for this reference
 */
function validateXref(element, liveData, cachedXtref) {
    if (!cachedXtref || !cachedXtref.ghPageUrl) {
        return; // No data to validate against
    }
    
    const liveTerms = liveData.get(cachedXtref.ghPageUrl);
    
    // Check if we could fetch the live data
    if (liveTerms === null) {
        const indicator = createIndicator('error');
        insertIndicatorAfterElement(element, indicator);
        recordValidationResult({
            type: 'error',
            refType: 'xref',
            term: cachedXtref.term,
            externalSpec: cachedXtref.externalSpec,
            element: element
        });
        return;
    }
    
    if (!liveTerms) {
        return; // Fetch is still pending or failed silently
    }
    
    const termKey = cachedXtref.term.toLowerCase();
    const liveTerm = liveTerms.get(termKey);
    
    // Check if term exists in live spec
    if (!liveTerm) {
        const indicator = createIndicator('missing');
        insertIndicatorAfterElement(element, indicator);
        recordValidationResult({
            type: 'missing',
            refType: 'xref',
            term: cachedXtref.term,
            externalSpec: cachedXtref.externalSpec,
            element: element
        });
        return;
    }
    
    // Compare content using similarity threshold to avoid false positives
    // Both cached and live content are reprocessed through markdown-it for consistency
    const cachedNormalized = normalizeContent(cachedXtref.content);
    const liveNormalized = normalizeContent(liveTerm.rawContent);
    
    // Debug logging if enabled
    if (VALIDATOR_CONFIG.debug) {
        console.log('[External Ref Validator] Comparing xref:', cachedXtref.term);
        console.log('  Cached length:', cachedNormalized.length, 'chars');
        console.log('  Live length:  ', liveNormalized.length, 'chars');
        console.log('  Cached:', cachedNormalized.substring(0, 100));
        console.log('  Live:  ', liveNormalized.substring(0, 100));
        if (cachedNormalized.length !== liveNormalized.length) {
            console.log('  Length diff:', Math.abs(cachedNormalized.length - liveNormalized.length), 'chars');
        }
    }
    
    // Calculate similarity between cached and live content
    const similarity = calculateSimilarity(cachedNormalized, liveNormalized);
    
    // Debug logging for similarity
    if (VALIDATOR_CONFIG.debug) {
        console.log('  Similarity:', (similarity * 100).toFixed(2) + '%');
    }
    
    // Only show changed indicator if similarity is below threshold (significant change)
    if (similarity < VALIDATOR_CONFIG.similarityThreshold) {
        const oldContent = cachedXtref.content ? extractTextFromHtml(cachedXtref.content) : 'No cached content';
        const newContent = liveTerm.content || 'No live content';
        const similarityPercent = (similarity * 100).toFixed(1) + '%';
        
        const indicator = createIndicator('changed', {
            oldContent: oldContent,
            newContent: newContent,
            similarity: similarityPercent
        });
        insertIndicatorAfterElement(element, indicator);
        
        // Record for the changes report
        recordValidationResult({
            type: 'changed',
            refType: 'xref',
            term: cachedXtref.term,
            externalSpec: cachedXtref.externalSpec,
            similarity: similarityPercent,
            oldContent: oldContent,
            newContent: newContent,
            element: element
        });
        return;
    }
    
    // Content is valid and unchanged
    if (VALIDATOR_CONFIG.showValidIndicators) {
        const indicator = createIndicator('valid');
        insertIndicatorAfterElement(element, indicator);
    }
}

/**
 * Validates a single tref element against live data
 * 
 * @param {HTMLElement} element - The tref dt element
 * @param {Map<string, Map<string, Object>>} liveData - Map of spec URLs to their live term data
 * @param {Object} cachedXtref - The cached xtref data for this reference
 */
function validateTref(element, liveData, cachedXtref) {
    if (!cachedXtref || !cachedXtref.ghPageUrl) {
        return; // No data to validate against
    }
    
    const liveTerms = liveData.get(cachedXtref.ghPageUrl);
    
    // Check if we could fetch the live data
    if (liveTerms === null) {
        const indicator = createIndicator('error');
        insertIndicatorIntoTref(element, indicator);
        recordValidationResult({
            type: 'error',
            refType: 'tref',
            term: cachedXtref.term,
            externalSpec: cachedXtref.externalSpec,
            element: element
        });
        return;
    }
    
    if (!liveTerms) {
        return; // Fetch is still pending or failed silently
    }
    
    const termKey = cachedXtref.term.toLowerCase();
    const liveTerm = liveTerms.get(termKey);
    
    // Check if term exists in live spec
    if (!liveTerm) {
        const indicator = createIndicator('missing');
        insertIndicatorIntoTref(element, indicator);
        recordValidationResult({
            type: 'missing',
            refType: 'tref',
            term: cachedXtref.term,
            externalSpec: cachedXtref.externalSpec,
            element: element
        });
        return;
    }
    
    // Compare content using similarity threshold to avoid false positives
    // Both cached and live content are reprocessed through markdown-it for consistency
    const cachedNormalized = normalizeContent(cachedXtref.content);
    const liveNormalized = normalizeContent(liveTerm.rawContent);
    
    // Debug logging if enabled
    if (VALIDATOR_CONFIG.debug) {
        console.log('[External Ref Validator] Comparing tref:', cachedXtref.term);
        console.log('  Cached length:', cachedNormalized.length, 'chars');
        console.log('  Live length:  ', liveNormalized.length, 'chars');
        console.log('  Cached:', cachedNormalized.substring(0, 100));
        console.log('  Live:  ', liveNormalized.substring(0, 100));
        if (cachedNormalized.length !== liveNormalized.length) {
            console.log('  Length diff:', Math.abs(cachedNormalized.length - liveNormalized.length), 'chars');
        }
    }
    
    // Calculate similarity between cached and live content
    const similarity = calculateSimilarity(cachedNormalized, liveNormalized);
    
    // Debug logging for similarity
    if (VALIDATOR_CONFIG.debug) {
        console.log('  Similarity:', (similarity * 100).toFixed(2) + '%');
    }
    
    // Only show changed indicator if similarity is below threshold (significant change)
    if (similarity < VALIDATOR_CONFIG.similarityThreshold) {
        const oldContent = cachedXtref.content ? extractTextFromHtml(cachedXtref.content) : 'No cached content';
        const newContent = liveTerm.content || 'No live content';
        const similarityPercent = (similarity * 100).toFixed(1) + '%';
        
        const indicator = createIndicator('changed', {
            oldContent: oldContent,
            newContent: newContent,
            similarity: similarityPercent
        });
        insertIndicatorIntoTref(element, indicator);
        
        // Record for the changes report
        recordValidationResult({
            type: 'changed',
            refType: 'tref',
            term: cachedXtref.term,
            externalSpec: cachedXtref.externalSpec,
            similarity: similarityPercent,
            oldContent: oldContent,
            newContent: newContent,
            element: element
        });
        return;
    }
    
    // Content is valid and unchanged
    if (VALIDATOR_CONFIG.showValidIndicators) {
        const indicator = createIndicator('valid');
        insertIndicatorIntoTref(element, indicator);
    }
}

/**
 * Extracts plain text from HTML content
 * 
 * @param {string} html - HTML content
 * @returns {string} - Plain text
 */
function extractTextFromHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || '';
}

/**
 * Inserts an indicator element after an xref anchor
 * 
 * @param {HTMLElement} element - The anchor element
 * @param {HTMLElement} indicator - The indicator to insert
 */
function insertIndicatorAfterElement(element, indicator) {
    // Check if indicator already exists
    if (element.nextElementSibling?.classList.contains(VALIDATOR_CONFIG.classes.indicator)) {
        return; // Already has an indicator
    }
    element.insertAdjacentElement('afterend', indicator);
    // Attach click handler if this indicator has details
    attachClickHandler(indicator);
}

/**
 * Inserts an indicator element into a tref dt element
 * 
 * @param {HTMLElement} dtElement - The dt element
 * @param {HTMLElement} indicator - The indicator to insert
 */
function insertIndicatorIntoTref(dtElement, indicator) {
    // Find the span with the term text
    const termSpan = dtElement.querySelector('span.term-external');
    if (!termSpan) {
        return;
    }
    
    // Check if indicator already exists
    if (termSpan.querySelector('.' + VALIDATOR_CONFIG.classes.indicator)) {
        return; // Already has an indicator
    }
    
    termSpan.appendChild(indicator);
    // Attach click handler if this indicator has details
    attachClickHandler(indicator);
}

/**
 * Attaches click handlers to validation indicators for toggling details visibility
 * Closes details when clicking outside the indicator
 * 
 * @param {HTMLElement} indicator - The indicator element with details
 */
function attachClickHandler(indicator) {
    if (!indicator.classList.contains('has-details')) {
        return; // Only attach handlers to indicators with details
    }
    
    /**
     * Toggle the active state when clicking the indicator
     */
    indicator.addEventListener('click', (event) => {
        event.stopPropagation();
        // Close all other open indicators
        const allActive = document.querySelectorAll('.external-ref-validation-indicator.active');
        for (const el of allActive) {
            if (el !== indicator) {
                el.classList.remove('active');
            }
        }
        // Toggle this indicator
        indicator.classList.toggle('active');
    });
}

/**
 * Close all open indicator details when clicking anywhere on the document
 */
document.addEventListener('click', () => {
    const allActive = document.querySelectorAll('.external-ref-validation-indicator.active');
    for (const indicator of allActive) {
        indicator.classList.remove('active');
    }
});

/**
 * Collects all unique external specifications from the page
 * by examining xref and tref elements
 * 
 * @returns {Map<string, {url: string, specName: string}>} - Map of ghPageUrls to spec info
 */
function collectExternalSpecs() {
    const specs = new Map();
    
    // Check if allXTrefs is available
    if (typeof allXTrefs === 'undefined' || !allXTrefs?.xtrefs) {
        console.warn('[External Ref Validator] allXTrefs data not available');
        return specs;
    }
    
    // Collect unique specs from allXTrefs
    allXTrefs.xtrefs.forEach(xtref => {
        if (xtref.ghPageUrl && !specs.has(xtref.ghPageUrl)) {
            specs.set(xtref.ghPageUrl, {
                url: xtref.ghPageUrl,
                specName: xtref.externalSpec
            });
        }
    });
    
    return specs;
}

/**
 * Finds the cached xtref data for an xref element
 * 
 * @param {HTMLElement} element - The xref anchor element
 * @returns {Object|null} - The cached xtref data or null
 */
function findCachedXtrefForXref(element) {
    if (typeof allXTrefs === 'undefined' || !allXTrefs?.xtrefs) {
        return null;
    }
    
    // Extract spec and term from data-local-href (format: #term:specName:termName)
    const localHref = element.getAttribute('data-local-href') || '';
    const match = localHref.match(/#term:([^:]+):(.+)/);
    
    if (!match) {
        return null;
    }
    
    const [, specName, termName] = match;
    
    // Find matching xtref
    return allXTrefs.xtrefs.find(x => 
        x.externalSpec === specName && 
        x.term.toLowerCase() === termName.toLowerCase()
    );
}

/**
 * Finds the cached xtref data for a tref element
 * 
 * @param {HTMLElement} element - The tref dt element or its inner span
 * @returns {Object|null} - The cached xtref data or null
 */
function findCachedXtrefForTref(element) {
    if (typeof allXTrefs === 'undefined' || !allXTrefs?.xtrefs) {
        return null;
    }
    
    // Get the original term from data attribute
    const termSpan = element.querySelector('[data-original-term]') || 
                     element.closest('[data-original-term]');
    
    if (!termSpan) {
        return null;
    }
    
    const originalTerm = termSpan.dataset.originalTerm;
    
    // Find matching xtref that has a tref source file
    return allXTrefs.xtrefs.find(x => 
        x.term.toLowerCase() === originalTerm.toLowerCase() &&
        x.sourceFiles?.some(sf => sf.type === 'tref')
    );
}

/**
 * Main validation function that orchestrates the entire validation process
 * Called after DOM is loaded and trefs are inserted
 */
async function validateExternalRefs() {
    console.log('[External Ref Validator] Starting validation...');
    
    // Collect unique external specs
    const specs = collectExternalSpecs();
    
    if (specs.size === 0) {
        console.log('[External Ref Validator] No external specifications to validate');
        return;
    }
    
    console.log(`[External Ref Validator] Found ${specs.size} external specification(s) to validate`);
    
    // Fetch all external specs in parallel
    const fetchPromises = Array.from(specs.entries()).map(async ([url, spec]) => {
        const terms = await fetchExternalSpec(url, spec.specName);
        return [url, terms];
    });
    
    const fetchResults = await Promise.all(fetchPromises);
    const liveData = new Map(fetchResults);
    
    // Validate all xref elements
    const xrefElements = document.querySelectorAll('a.x-term-reference');
    xrefElements.forEach(element => {
        const cachedXtref = findCachedXtrefForXref(element);
        if (cachedXtref) {
            validateXref(element, liveData, cachedXtref);
        }
    });
    
    // Validate all tref elements
    const trefElements = document.querySelectorAll('dt.term-external');
    trefElements.forEach(element => {
        const cachedXtref = findCachedXtrefForTref(element);
        if (cachedXtref) {
            validateTref(element, liveData, cachedXtref);
        }
    });
    
    console.log('[External Ref Validator] Validation complete');
    
    // Populate the changes report in the slide-in menu
    populateChangesReport();
    
    // Dispatch event to signal validation is complete
    document.dispatchEvent(new CustomEvent('external-refs-validated', {
        detail: {
            specsValidated: specs.size,
            xrefsValidated: xrefElements.length,
            trefsValidated: trefElements.length,
            issuesFound: validationResults.length
        }
    }));
}

/**
 * Populates the external reference changes report in the slide-in settings menu
 * Creates an accessible table showing all changed, missing, or error references
 */
function populateChangesReport() {
    const section = document.getElementById('external-ref-changes-section');
    const container = document.getElementById('external-ref-changes-container');
    const badge = document.getElementById('external-ref-changes-badge');
    const status = document.getElementById('external-ref-validation-status');
    const divider = document.getElementById('external-ref-changes-divider');
    
    // If elements don't exist, skip (template may not include them)
    if (!section || !container) {
        console.log('[External Ref Validator] Changes report section not found in template');
        return;
    }
    
    // Show the section
    section.style.display = 'block';
    if (divider) {
        divider.style.display = 'block';
    }
    
    // Update status
    if (status) {
        if (validationResults.length === 0) {
            status.innerHTML = '<i class="bi bi-check-circle-fill text-success me-1"></i>All external references are up to date';
        } else {
            status.innerHTML = `<i class="bi bi-exclamation-triangle-fill text-warning me-1"></i>${validationResults.length} issue(s) found`;
        }
    }
    
    // Update badge
    if (badge) {
        badge.textContent = validationResults.length;
        if (validationResults.length === 0) {
            badge.classList.remove('bg-warning', 'bg-danger');
            badge.classList.add('bg-success');
        } else {
            const hasErrors = validationResults.some(r => r.type === 'missing' || r.type === 'error');
            badge.classList.remove('bg-success', hasErrors ? 'bg-warning' : 'bg-danger');
            badge.classList.add(hasErrors ? 'bg-danger' : 'bg-warning');
        }
    }
    
    // If no issues, show a simple message
    if (validationResults.length === 0) {
        container.innerHTML = '<p class="small text-success mb-0"><i class="bi bi-check-circle me-1"></i>No changes detected</p>';
        return;
    }
    
    // Build an accessible table with the results
    const table = buildChangesTable(validationResults);
    container.innerHTML = '';
    container.appendChild(table);
}

/**
 * Builds an accessible HTML table from the validation results
 * 
 * @param {Array<Object>} results - The validation results to display
 * @returns {HTMLElement} - The table element
 */
function buildChangesTable(results) {
    const table = document.createElement('table');
    table.classList.add('table', 'table-sm', 'table-hover', 'external-ref-changes-table');
    table.setAttribute('role', 'table');
    table.setAttribute('aria-label', 'External reference changes report');
    
    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th scope="col" class="col-status">Status</th>
            <th scope="col" class="col-term">Term</th>
            <th scope="col" class="col-spec">Source</th>
            <th scope="col" class="col-similarity">Match</th>
            <th scope="col" class="col-action">Action</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Table body
    const tbody = document.createElement('tbody');
    
    results.forEach((result, index) => {
        const row = createResultRow(result, index);
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    return table;
}

/**
 * Creates a table row for a single validation result
 * 
 * @param {Object} result - The validation result
 * @param {number} index - Row index for accessibility
 * @returns {HTMLTableRowElement} - The table row element
 */
function createResultRow(result, index) {
    const row = document.createElement('tr');
    row.classList.add(`result-${result.type}`);
    row.setAttribute('data-result-index', index);
    
    // Status cell with icon
    const statusCell = document.createElement('td');
    statusCell.classList.add('col-status');
    statusCell.innerHTML = getStatusIcon(result.type);
    statusCell.setAttribute('title', getStatusTitle(result.type));
    row.appendChild(statusCell);
    
    // Term cell
    const termCell = document.createElement('td');
    termCell.classList.add('col-term');
    termCell.innerHTML = `<span class="term-name">${escapeHtml(result.term)}</span>`;
    row.appendChild(termCell);
    
    // Source/spec cell
    const specCell = document.createElement('td');
    specCell.classList.add('col-spec');
    specCell.innerHTML = `<span class="spec-badge">${escapeHtml(result.externalSpec)}</span>`;
    row.appendChild(specCell);
    
    // Similarity cell (for changed items)
    const similarityCell = document.createElement('td');
    similarityCell.classList.add('col-similarity');
    if (result.type === 'changed' && result.similarity) {
        similarityCell.innerHTML = `<span class="similarity-value">${result.similarity}</span>`;
    } else {
        similarityCell.innerHTML = '<span class="similarity-na">—</span>';
    }
    row.appendChild(similarityCell);
    
    // Action cell with button to scroll to the element
    const actionCell = document.createElement('td');
    actionCell.classList.add('col-action');
    const goButton = document.createElement('button');
    goButton.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'go-to-ref-btn');
    goButton.innerHTML = '<i class="bi bi-arrow-right-circle"></i>';
    goButton.setAttribute('title', 'Go to reference');
    goButton.setAttribute('aria-label', `Go to ${result.term} reference`);
    goButton.addEventListener('click', () => scrollToElement(result.element));
    actionCell.appendChild(goButton);
    row.appendChild(actionCell);
    
    return row;
}

/**
 * Returns the appropriate status icon HTML for a result type
 * 
 * @param {string} type - The result type: 'changed', 'missing', or 'error'
 * @returns {string} - HTML string for the icon
 */
function getStatusIcon(type) {
    switch (type) {
        case 'changed':
            return '<span class="status-icon status-changed" aria-label="Changed">🔄</span>';
        case 'missing':
            return '<span class="status-icon status-missing" aria-label="Missing">⚠️</span>';
        case 'error':
            return '<span class="status-icon status-error" aria-label="Error">❌</span>';
        default:
            return '<span class="status-icon" aria-label="Unknown">❓</span>';
    }
}

/**
 * Returns the status title for a result type
 * 
 * @param {string} type - The result type
 * @returns {string} - Human-readable status title
 */
function getStatusTitle(type) {
    switch (type) {
        case 'changed':
            return 'Definition has changed in the external specification';
        case 'missing':
            return 'Term no longer exists in the external specification';
        case 'error':
            return 'Could not fetch external specification for validation';
        default:
            return 'Unknown status';
    }
}

/**
 * Scrolls to the element in the document and highlights it temporarily
 * Also closes the offcanvas menu
 * 
 * @param {HTMLElement} element - The element to scroll to
 */
function scrollToElement(element) {
    if (!element) return;
    
    // Close the offcanvas settings panel
    const offcanvas = document.getElementById('offcanvasSettings');
    if (offcanvas) {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
        if (bsOffcanvas) {
            bsOffcanvas.hide();
        }
    }
    
    // Small delay to let the offcanvas close
    setTimeout(() => {
        // Scroll to the element
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add a temporary highlight effect
        element.classList.add('highlight-ref');
        setTimeout(() => {
            element.classList.remove('highlight-ref');
        }, 2000);
    }, 300);
}

/**
 * Initialize the validator when DOM and trefs are ready
 * We wait for the 'trefs-inserted' event to ensure all content is in place
 */
function initializeValidator() {
    // Wait for trefs to be inserted first
    document.addEventListener('trefs-inserted', () => {
        // Small delay to ensure DOM is fully updated
        setTimeout(validateExternalRefs, 100);
    });
    
    // Fallback: if trefs-inserted doesn't fire within 3 seconds, run anyway
    setTimeout(() => {
        // Check if we've already validated
        if (document.querySelector('.' + VALIDATOR_CONFIG.classes.indicator)) {
            return; // Already ran
        }
        console.warn('[External Ref Validator] trefs-inserted event not received, validating anyway');
        validateExternalRefs();
    }, 3000);
}

/** localStorage key used to persist the external-ref validation toggle state */
const VALEXTREF_STORAGE_KEY = 'spec-up-t:valextref';

/**
 * Checks if external reference validation is enabled via localStorage.
 *
 * @returns {boolean} - True if validation should run
 */
function isExternalRefValidationEnabled() {
    return localStorage.getItem(VALEXTREF_STORAGE_KEY) === 'true';
}

/**
 * Initialises the Experimental toggle in the slide-in settings menu.
 * Reads persisted state from localStorage and reflects it in the checkbox.
 * On change: saves the new state to localStorage and reloads the page.
 */
function initExperimentalToggle() {
    const toggle = document.getElementById('toggle-valextref');
    if (!toggle) return;

    // Reflect the current enabled state in the checkbox
    toggle.checked = isExternalRefValidationEnabled();

    toggle.addEventListener('change', () => {
        localStorage.setItem(VALEXTREF_STORAGE_KEY, toggle.checked ? 'true' : 'false');
        window.location.reload();
    });
}

// Always wire up the toggle so users can change the setting regardless of current state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExperimentalToggle);
} else {
    initExperimentalToggle();
}

// Only run the actual validation when the feature is enabled
if (isExternalRefValidationEnabled()) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeValidator);
    } else {
        initializeValidator();
    }
}
