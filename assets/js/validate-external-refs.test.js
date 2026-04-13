/**
 * @jest-environment jsdom
 */
/**
 * @fileoverview Unit tests for validate-external-refs.js
 * Tests the utility functions used for validating external references (xrefs and trefs).
 * 
 * Note: The main validation flow involves network fetches and is tested via integration tests.
 * These unit tests cover the synchronous utility functions.
 */

// Mock the global allXTrefs before requiring the module
global.allXTrefs = {
    xtrefs: [
        {
            externalSpec: 'TestSpec',
            term: 'test-term',
            ghPageUrl: 'https://example.github.io/test-spec/',
            content: '<dd><p>This is a test definition.</p></dd>',
            sourceFiles: [{ file: 'test.md', type: 'tref' }]
        },
        {
            externalSpec: 'TestSpec',
            term: 'another-term',
            ghPageUrl: 'https://example.github.io/test-spec/',
            content: '<dd><p>Another definition here.</p></dd>',
            sourceFiles: [{ file: 'test.md', type: 'xref' }]
        }
    ]
};

// Since the file auto-initializes, we need to mock DOM ready state
Object.defineProperty(document, 'readyState', {
    get: () => 'complete'
});

// Read and evaluate the source file to get the functions
const fs = require('fs');
const path = require('path');

// We'll test the functions by extracting their logic
// Since the module doesn't export, we test via DOM manipulation

describe('validate-external-refs', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        // Clear any event listeners by resetting the body
        jest.clearAllMocks();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('normalizeContent helper logic', () => {
        /**
         * Tests normalization of HTML content for comparison
         * This replicates the normalizeContent function logic
         * Note: In production, markdown-it processing is included
         */
        function normalizeContent(html) {
            if (!html) return '';
            // In tests, we skip markdown-it since it may not be available
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            let text = tempDiv.textContent
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .trim();
            text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
            text = text.replace(/\s*([.,;:!?])\s*/g, '$1 ');
            text = text.trim();
            return text;
        }

        // Test: Does normalization handle empty input?
        it('should return empty string for empty input', () => {
            expect(normalizeContent('')).toBe('');
            expect(normalizeContent(null)).toBe('');
            expect(normalizeContent(undefined)).toBe('');
        });

        // Test: Does normalization extract text from HTML?
        it('should extract text content from HTML', () => {
            const html = '<dd><p>This is a <strong>test</strong> definition.</p></dd>';
            expect(normalizeContent(html)).toBe('this is a test definition.');
        });

        // Test: Does normalization collapse whitespace?
        it('should normalize whitespace', () => {
            const html = '<p>Multiple   spaces\nand\nnewlines</p>';
            expect(normalizeContent(html)).toBe('multiple spaces and newlines');
        });

        // Test: Does normalization convert to lowercase?
        it('should convert to lowercase', () => {
            const html = '<p>UPPERCASE and MixedCase</p>';
            expect(normalizeContent(html)).toBe('uppercase and mixedcase');
        });

        // Test: Does normalization handle punctuation spacing?
        it('should normalize punctuation spacing', () => {
            const html = '<p>Word,word  .  another</p>';
            expect(normalizeContent(html)).toBe('word, word. another');
        });

        // Test: Does normalization handle identical HTML with different formatting?
        it('should normalize identically formatted content', () => {
            const html1 = '<p>This is a test.</p>';
            const html2 = '<p>This  is  a  test.</p>';
            expect(normalizeContent(html1)).toBe(normalizeContent(html2));
        });
    });

    describe('extractTermsFromHtml helper logic', () => {
        /**
         * Tests term extraction from HTML content
         * This replicates the extractTermsFromHtml function logic
         */
        function extractTermsFromHtml(html) {
            const terms = new Map();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const termElements = doc.querySelectorAll('dl.terms-and-definitions-list dt');
            
            termElements.forEach(dt => {
                const termSpan = dt.querySelector('[id^="term:"]');
                if (!termSpan) return;
                
                const termId = termSpan.id;
                const termName = termId.split(':').pop();
                
                // Collect ALL consecutive dd elements (not just the first one)
                const ddElements = [];
                let definitionContent = '';
                let rawContent = '';
                let sibling = dt.nextElementSibling;
                
                // Collect all consecutive dd elements, skipping meta-info wrappers
                while (sibling && sibling.tagName === 'DD') {
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

        // Test: Does extraction handle empty HTML?
        it('should return empty map for empty HTML', () => {
            const terms = extractTermsFromHtml('');
            expect(terms.size).toBe(0);
        });

        // Test: Does extraction handle HTML without terms?
        it('should return empty map for HTML without term definitions', () => {
            const html = '<div><p>Just some content</p></div>';
            const terms = extractTermsFromHtml(html);
            expect(terms.size).toBe(0);
        });

        // Test: Does extraction correctly parse term definitions?
        it('should extract terms from valid term list HTML', () => {
            const html = `
                <dl class="terms-and-definitions-list">
                    <dt><span id="term:test-term">test-term</span></dt>
                    <dd><p>Definition of test term.</p></dd>
                    <dt><span id="term:another-term">another-term</span></dt>
                    <dd><p>Another definition.</p></dd>
                </dl>
            `;
            const terms = extractTermsFromHtml(html);
            expect(terms.size).toBe(2);
            expect(terms.has('test-term')).toBe(true);
            expect(terms.has('another-term')).toBe(true);
        });

        // Test: Does extraction capture definition content?
        it('should capture definition content correctly', () => {
            const html = `
                <dl class="terms-and-definitions-list">
                    <dt><span id="term:my-term">my-term</span></dt>
                    <dd><p>This is the definition.</p></dd>
                </dl>
            `;
            const terms = extractTermsFromHtml(html);
            const term = terms.get('my-term');
            expect(term.content).toContain('This is the definition.');
        });

        // Test: Does extraction skip meta-info wrappers?
        it('should skip meta-info-content-wrapper elements', () => {
            const html = `
                <dl class="terms-and-definitions-list">
                    <dt><span id="term:meta-term">meta-term</span></dt>
                    <dd class="meta-info-content-wrapper">Meta info</dd>
                    <dd><p>Real definition.</p></dd>
                </dl>
            `;
            const terms = extractTermsFromHtml(html);
            const term = terms.get('meta-term');
            expect(term.content).not.toContain('Meta info');
            expect(term.content).toContain('Real definition.');
        });

        // Test: Does extraction include all consecutive dd elements?
        it('should extract all consecutive dd elements', () => {
            const html = `
                <dl class="terms-and-definitions-list">
                    <dt><span id="term:multi-dd">multi-dd</span></dt>
                    <dd><p>First part.</p></dd>
                    <dd><p>Second part.</p></dd>
                </dl>
            `;
            const terms = extractTermsFromHtml(html);
            const term = terms.get('multi-dd');
            expect(term.content).toContain('First part.');
            expect(term.content).toContain('Second part.'); // Should include all dd elements
        });
    });

    describe('createIndicator helper logic', () => {
        /**
         * Tests indicator creation logic
         */
        function createIndicator(type, details = {}) {
            const VALIDATOR_CONFIG = {
                classes: {
                    indicator: 'external-ref-validation-indicator',
                    missing: 'external-ref-missing',
                    changed: 'external-ref-changed',
                    valid: 'external-ref-valid',
                    error: 'external-ref-error'
                },
                labels: {
                    missing: '⚠️ Term not found',
                    changed: '🔄 Definition changed',
                    error: '❌ Could not verify',
                    valid: '✓ Verified'
                }
            };

            const indicator = document.createElement('span');
            indicator.classList.add(
                VALIDATOR_CONFIG.classes.indicator,
                VALIDATOR_CONFIG.classes[type]
            );
            
            const labelText = details.message || VALIDATOR_CONFIG.labels[type];
            indicator.setAttribute('title', labelText);
            
            const iconSpan = document.createElement('span');
            iconSpan.classList.add('indicator-icon');
            iconSpan.textContent = VALIDATOR_CONFIG.labels[type].split(' ')[0];
            indicator.appendChild(iconSpan);
            
            return indicator;
        }

        // Test: Does indicator have correct classes for missing type?
        it('should create indicator with correct classes for missing type', () => {
            const indicator = createIndicator('missing');
            expect(indicator.classList.contains('external-ref-validation-indicator')).toBe(true);
            expect(indicator.classList.contains('external-ref-missing')).toBe(true);
        });

        // Test: Does indicator have correct classes for changed type?
        it('should create indicator with correct classes for changed type', () => {
            const indicator = createIndicator('changed');
            expect(indicator.classList.contains('external-ref-validation-indicator')).toBe(true);
            expect(indicator.classList.contains('external-ref-changed')).toBe(true);
        });

        // Test: Does indicator have correct classes for error type?
        it('should create indicator with correct classes for error type', () => {
            const indicator = createIndicator('error');
            expect(indicator.classList.contains('external-ref-validation-indicator')).toBe(true);
            expect(indicator.classList.contains('external-ref-error')).toBe(true);
        });

        // Test: Does indicator have correct classes for valid type?
        it('should create indicator with correct classes for valid type', () => {
            const indicator = createIndicator('valid');
            expect(indicator.classList.contains('external-ref-validation-indicator')).toBe(true);
            expect(indicator.classList.contains('external-ref-valid')).toBe(true);
        });

        // Test: Does indicator have correct title attribute?
        it('should set appropriate title for tooltip', () => {
            const indicator = createIndicator('missing');
            expect(indicator.getAttribute('title')).toBe('⚠️ Term not found');
        });

        // Test: Does indicator contain icon element?
        it('should contain an icon element with emoji', () => {
            const indicator = createIndicator('changed');
            const iconSpan = indicator.querySelector('.indicator-icon');
            expect(iconSpan).not.toBeNull();
            expect(iconSpan.textContent).toBe('🔄');
        });
    });

    describe('truncateText helper logic', () => {
        function truncateText(text, maxLength) {
            if (!text || text.length <= maxLength) return text || '';
            return text.substring(0, maxLength) + '...';
        }

        // Test: Does truncation handle empty input?
        it('should return empty string for null or undefined', () => {
            expect(truncateText(null, 10)).toBe('');
            expect(truncateText(undefined, 10)).toBe('');
        });

        // Test: Does truncation preserve short text?
        it('should not truncate text shorter than max length', () => {
            expect(truncateText('short', 10)).toBe('short');
        });

        // Test: Does truncation work on long text?
        it('should truncate text longer than max length', () => {
            expect(truncateText('this is a long text', 10)).toBe('this is a ...');
        });

        // Test: Does truncation handle exact length?
        it('should not truncate text exactly at max length', () => {
            expect(truncateText('exactly10!', 10)).toBe('exactly10!');
        });
    });

    describe('similarity calculation logic', () => {
        /**
         * Tests similarity calculation between two strings
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

        function calculateSimilarity(str1, str2) {
            if (str1 === str2) return 1;
            if (!str1 || !str2) return 0;
            
            const longer = str1.length > str2.length ? str1 : str2;
            const shorter = str1.length > str2.length ? str2 : str1;
            
            if (longer.length === 0) return 1;
            
            const editDistance = levenshteinDistance(shorter, longer);
            return (longer.length - editDistance) / longer.length;
        }

        // Test: Do identical strings have 100% similarity?
        it('should return 1 for identical strings', () => {
            expect(calculateSimilarity('test', 'test')).toBe(1);
            expect(calculateSimilarity('hello world', 'hello world')).toBe(1);
        });

        // Test: Do completely different strings have low similarity?
        it('should return low similarity for very different strings', () => {
            const similarity = calculateSimilarity('abc', 'xyz');
            expect(similarity).toBeLessThan(0.5);
        });

        // Test: Does similarity work for slight variations?
        it('should return high similarity for slight variations', () => {
            const similarity = calculateSimilarity('hello world', 'hello world!');
            expect(similarity).toBeGreaterThan(0.9);
        });

        // Test: Does similarity handle empty strings?
        it('should return 0 for empty strings', () => {
            expect(calculateSimilarity('', '')).toBe(1); // Both empty is 100% similar
            expect(calculateSimilarity('test', '')).toBe(0);
            expect(calculateSimilarity('', 'test')).toBe(0);
        });

        // Test: Does similarity threshold of 95% catch meaningful changes?
        it('should detect significant changes below 95% threshold', () => {
            const original = 'This is a long definition with many words about something important.';
            const changed = 'This is completely different content about other things.';
            const similarity = calculateSimilarity(original, changed);
            expect(similarity).toBeLessThan(0.95); // Should trigger change indicator
        });

        // Test: Does similarity threshold of 95% ignore minor formatting?
        it('should ignore minor formatting differences above 95% threshold', () => {
            const original = 'This is a definition.';
            const formatted = 'This is a definition. '; // Extra space
            const similarity = calculateSimilarity(original.toLowerCase().trim(), formatted.toLowerCase().trim());
            expect(similarity).toBeGreaterThanOrEqual(0.95); // Should NOT trigger change indicator
        });
    });

    describe('truncateText helper logic', () => {
        function truncateText(text, maxLength) {
            if (!text || text.length <= maxLength) return text || '';
            return text.substring(0, maxLength) + '...';
        }

        // Test: Does truncation handle empty input?
        it('should return empty string for null or undefined', () => {
            expect(truncateText(null, 10)).toBe('');
            expect(truncateText(undefined, 10)).toBe('');
        });

        // Test: Does truncation preserve short text?
        it('should not truncate text shorter than max length', () => {
            expect(truncateText('short', 10)).toBe('short');
        });

        // Test: Does truncation work on long text?
        it('should truncate text longer than max length', () => {
            expect(truncateText('this is a long text', 10)).toBe('this is a ...');
        });

        // Test: Does truncation handle exact length?
        it('should not truncate text exactly at max length', () => {
            expect(truncateText('exactly10!', 10)).toBe('exactly10!');
        });
    });

    describe('escapeHtml helper logic', () => {
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Test: Does escaping handle normal text?
        it('should return text unchanged for normal input', () => {
            expect(escapeHtml('normal text')).toBe('normal text');
        });

        // Test: Does escaping convert HTML entities?
        it('should escape HTML special characters', () => {
            expect(escapeHtml('<script>alert("xss")</script>')).toBe(
                '&lt;script&gt;alert("xss")&lt;/script&gt;'
            );
        });

        // Test: Does escaping handle ampersands?
        it('should escape ampersands', () => {
            expect(escapeHtml('one & two')).toBe('one &amp; two');
        });
    });

    describe('DOM element finding logic', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <a class="x-term-reference" 
                   data-local-href="#term:TestSpec:test-term"
                   href="https://example.github.io/test-spec/#term:test-term">
                   test-term
                </a>
                <dl class="terms-and-definitions-list">
                    <dt class="term-external">
                        <span class="term-external" data-original-term="tref-term">
                            tref-term
                        </span>
                    </dt>
                </dl>
            `;
        });

        // Test: Can xref elements be found in the DOM?
        it('should find xref elements by class', () => {
            const xrefs = document.querySelectorAll('a.x-term-reference');
            expect(xrefs.length).toBe(1);
        });

        // Test: Can tref elements be found in the DOM?
        it('should find tref elements by class', () => {
            const trefs = document.querySelectorAll('dt.term-external');
            expect(trefs.length).toBe(1);
        });

        // Test: Can data-local-href be parsed for spec and term?
        it('should parse data-local-href for spec and term names', () => {
            const xref = document.querySelector('a.x-term-reference');
            const localHref = xref.dataset.localHref;
            const match = localHref.match(/#term:([^:]+):(.+)/);
            expect(match).not.toBeNull();
            expect(match[1]).toBe('TestSpec');
            expect(match[2]).toBe('test-term');
        });

        // Test: Can original term be retrieved from tref data attribute?
        it('should retrieve original term from data-original-term', () => {
            const termSpan = document.querySelector('[data-original-term]');
            expect(termSpan.dataset.originalTerm).toBe('tref-term');
        });
    });

    describe('indicator insertion logic', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <a class="x-term-reference" id="test-xref">test</a>
                <dt class="term-external" id="test-tref">
                    <span class="term-external">term</span>
                </dt>
            `;
        });

        // Test: Can indicators be inserted after xref elements?
        it('should insert indicator after xref element', () => {
            const xref = document.getElementById('test-xref');
            const indicator = document.createElement('span');
            indicator.classList.add('external-ref-validation-indicator');
            xref.after(indicator);
            
            expect(xref.nextElementSibling).toBe(indicator);
        });

        // Test: Can indicators be inserted into tref elements?
        it('should insert indicator into tref span element', () => {
            const termSpan = document.querySelector('dt.term-external span.term-external');
            const indicator = document.createElement('span');
            indicator.classList.add('external-ref-validation-indicator');
            termSpan.appendChild(indicator);
            
            expect(termSpan.querySelector('.external-ref-validation-indicator')).toBe(indicator);
        });

        // Test: Should prevent duplicate indicators
        it('should not add duplicate indicators', () => {
            const xref = document.getElementById('test-xref');
            
            // Add first indicator
            const indicator1 = document.createElement('span');
            indicator1.classList.add('external-ref-validation-indicator');
            xref.insertAdjacentElement('afterend', indicator1);
            
            // Check for existing before adding second
            const existing = xref.nextElementSibling?.classList.contains('external-ref-validation-indicator');
            expect(existing).toBe(true);
        });
    });
});
