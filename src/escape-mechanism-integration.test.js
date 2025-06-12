const fs = require('fs');
const path = require('path');
const { processEscapedTags, restoreEscapedTags } = require('./escape-mechanism.js');

// Test the escape mechanism integration
describe('Escape Mechanism Integration Tests', () => {

    const mockApplyReplacers = (doc) => {
        // Simplified version of applyReplacers for testing
        const replacerRegex = /\[\[\s*([^\s\[\]:]+)(?::(?:\s*([^\]\n]+))?)?\]\]/img;
        
        // Helper function to process terms consistently
        const processTerm = (term) => (term ? term.trim() : 'unknown').replace(/\s+/g, '-').toLowerCase();
        
        return doc.replace(replacerRegex, function (match, type, args) {
            const term = args ? args.trim() : 'unknown';
            const termId = processTerm(term);
            
            if (type === 'def') {
                return `<span id="term:${termId}">${term}</span>`;
            } else if (type === 'ref') {
                return `<a class="term-reference" href="#term:${termId}">${term}</a>`;
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

    // Helper function to run standard processing and test expectations
    const runTagTest = (testCase) => {
        const { input, expectedContains = [], expectedNotContains = [] } = testCase;
        const result = fullProcessingPipeline(input);
        
        expectedContains.forEach(text => {
            expect(result).toContain(text);
        });
        
        expectedNotContains.forEach(text => {
            expect(result).not.toContain(text);
        });
        
        // Always ensure placeholders are removed
        expect(result).not.toContain('__SPEC_UP_ESCAPED_TAG__');
        
        return result;
    };
    
    it('should escape def tags correctly in full pipeline', () => {
        runTagTest({
            input: 'Normal [[def: test]] and escaped \\[[def: escaped]] tags.',
            expectedContains: ['<span id="term:test">test</span>', '[[def: escaped]]']
        });
    });

    it('should handle mixed escaped and normal tags', () => {
        runTagTest({
            input: 'Text \\[[def: escaped]] and [[def: normal]] and [[ref: normal]] more text',
            expectedContains: [
                '[[def: escaped]]', 
                '<span id="term:normal">normal</span>', 
                '<a class="term-reference" href="#term:normal">normal</a>'
            ]
        });
    });

    it('should handle multiple escaped tags in one line', () => {
        runTagTest({
            input: 'Multiple: \\[[def: first]] and \\[[ref: second]] tags.',
            expectedContains: ['[[def: first]]', '[[ref: second]]'],
            expectedNotContains: ['<span id="term:first">', '<a class="term-reference"']
        });
    });

    it('should not interfere with non-substitution bracket patterns', () => {
        runTagTest({
            input: 'Array [0] and [[not-a-substitution]] should be unchanged.',
            expectedContains: ['Array [0]', '[[not-a-substitution]]']
        });
    });

    it('should handle edge case of escaped tag without space after colon', () => {
        runTagTest({
            input: 'No space \\[[def:nospace]] after colon.',
            expectedContains: ['[[def:nospace]]']
        });
    });

    it('should handle complex document with all escape patterns', () => {
        const markdown = `# Test Document

Normal definition: [[def: normal]]

Escaped definition: \\[[def: escaped]]

Reference to normal: [[ref: normal]]

Escaped reference: \\[[ref: escaped]]

Mixed line: \\[[def: escaped1]] and [[def: normal2]] and \\[[ref: escaped2]]
`;
        
        runTagTest({
            input: markdown,
            expectedContains: [
                // Normal processing
                '<span id="term:normal">normal</span>',
                '<span id="term:normal2">normal2</span>',
                '<a class="term-reference" href="#term:normal">normal</a>',
                
                // Escaped tags
                '[[def: escaped]]',
                '[[ref: escaped]]',
                '[[def: escaped1]]',
                '[[ref: escaped2]]'
            ]
        });
    });

    describe('Tref-specific escape handling', () => {
        // Note: In the actual implementation, tref tags are processed differently
        // through the replacers array, but they should still respect escaping
        
        it('should escape tref tags correctly', () => {
            runTagTest({
                input: 'Normal [[tref: spec, term]] and escaped \\[[tref: spec, escaped]] tags.',
                expectedContains: ['[[tref: spec, escaped]]']
                // The normal tref would be processed by the actual tref replacer
                // but in our mock it stays as-is since we didn't implement tref processing
            });
        });
    });
});
