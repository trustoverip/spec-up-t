const fs = require('fs');
const path = require('path');
const { processEscapedTags, restoreEscapedTags } = require('./escape-mechanism.js');

// Test the escape mechanism integration
describe('Escape Mechanism Integration Tests', () => {

    const mockApplyReplacers = (doc) => {
        // Simplified version of applyReplacers for testing
        const replacerRegex = /\[\[\s*([^\s\[\]:]+)(?::(?:\s*([^\]\n]+))?)?\]\]/img;
        return doc.replace(replacerRegex, function (match, type, args) {
            if (type === 'def') {
                const term = args ? args.trim() : 'unknown';
                return `<span id="term:${term.replace(/\s+/g, '-').toLowerCase()}">${term}</span>`;
            } else if (type === 'ref') {
                const term = args ? args.trim() : 'unknown';
                return `<a class="term-reference" href="#term:${term.replace(/\s+/g, '-').toLowerCase()}">${term}</a>`;
            }
            return match; // Return unchanged for other types
        });
    };

    const fullProcessingPipeline = (markdown) => {
        // Phase 1: Pre-processing
        let doc = processEscapedTags(markdown);
        
        // Phase 2: Tag Processing  
        doc = mockApplyReplacers(doc);
        
        // Phase 3: Post-processing
        return restoreEscapedTags(doc);
    };

    it('should escape def tags correctly in full pipeline', () => {
        const input = 'Normal [[def: test]] and escaped \\[[def: escaped]] tags.';
        const result = fullProcessingPipeline(input);
        
        expect(result).toContain('<span id="term:test">test</span>');
        expect(result).toContain('[[def: escaped]]');
        expect(result).not.toContain('__SPEC_UP_ESCAPED_TAG__');
    });

    it('should handle mixed escaped and normal tags', () => {
        const input = 'Text \\[[def: escaped]] and [[def: normal]] and [[ref: normal]] more text';
        const result = fullProcessingPipeline(input);
        
        expect(result).toContain('[[def: escaped]]');
        expect(result).toContain('<span id="term:normal">normal</span>');
        expect(result).toContain('<a class="term-reference" href="#term:normal">normal</a>');
    });

    it('should handle multiple escaped tags in one line', () => {
        const input = 'Multiple: \\[[def: first]] and \\[[ref: second]] tags.';
        const result = fullProcessingPipeline(input);
        
        expect(result).toContain('[[def: first]]');
        expect(result).toContain('[[ref: second]]');
        expect(result).not.toContain('<span id="term:first">');
        expect(result).not.toContain('<a class="term-reference"');
    });

    it('should not interfere with non-substitution bracket patterns', () => {
        const input = 'Array [0] and [[not-a-substitution]] should be unchanged.';
        const result = fullProcessingPipeline(input);
        
        expect(result).toContain('Array [0]');
        expect(result).toContain('[[not-a-substitution]]');
    });

    it('should handle edge case of escaped tag without space after colon', () => {
        const input = 'No space \\[[def:nospace]] after colon.';
        const result = fullProcessingPipeline(input);
        
        expect(result).toContain('[[def:nospace]]');
    });

    it('should handle complex document with all escape patterns', () => {
        const markdown = `# Test Document

Normal definition: [[def: normal]]

Escaped definition: \\[[def: escaped]]

Reference to normal: [[ref: normal]]

Escaped reference: \\[[ref: escaped]]

Mixed line: \\[[def: escaped1]] and [[def: normal2]] and \\[[ref: escaped2]]
`;
        
        const result = fullProcessingPipeline(markdown);
        
        // Check normal processing
        expect(result).toContain('<span id="term:normal">normal</span>');
        expect(result).toContain('<span id="term:normal2">normal2</span>');
        expect(result).toContain('<a class="term-reference" href="#term:normal">normal</a>');
        
        // Check escaped tags are literal
        expect(result).toContain('[[def: escaped]]');
        expect(result).toContain('[[ref: escaped]]');
        expect(result).toContain('[[def: escaped1]]');
        expect(result).toContain('[[ref: escaped2]]');
        
        // Ensure no placeholders remain
        expect(result).not.toContain('__SPEC_UP_ESCAPED_TAG__');
    });

    describe('Tref-specific escape handling', () => {
        // Note: In the actual implementation, tref tags are processed differently
        // through the replacers array, but they should still respect escaping
        
        it('should escape tref tags correctly', () => {
            const input = 'Normal [[tref: spec, term]] and escaped \\[[tref: spec, escaped]] tags.';
            const result = fullProcessingPipeline(input);
            
            expect(result).toContain('[[tref: spec, escaped]]');
            // The normal tref would be processed by the actual tref replacer
            // but in our mock it stays as-is since we didn't implement tref processing
        });
    });
});
