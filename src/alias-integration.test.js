/**
 * Integration test to verify that aliases work correctly in the full workflow
 */

const fs = require('fs');
const path = require('path');

describe('External Reference Collection - Alias Integration', () => {
    const { processXTref, addNewXTrefsFromMarkdown, isXTrefInMarkdown } = require('./collect-external-references');

    it('should create external reference using original term even when alias is provided', () => {
        // Test the processXTref function specifically for alias handling
        const xtrefWithAlias = '[[tref:vlei1, vlei-ecosystem-governance-framework, vEGF]]';
        const result = processXTref(xtrefWithAlias);
        
        expect(result.externalSpec).toBe('vlei1');
        expect(result.term).toBe('vlei-ecosystem-governance-framework'); // Original term should be used for external lookup
        expect(result.alias).toBe('vEGF'); // Alias should be stored separately
    });

    it('should create only one external reference for multiple aliases of same term', () => {
        const markdownContent = `
            First reference: [[tref:vlei1, vlei-ecosystem-governance-framework, vEGF]]
            Second reference: [[tref:vlei1, vlei-ecosystem-governance-framework, VEGF]]
            Third reference: [[tref:vlei1, vlei-ecosystem-governance-framework]]
        `;
        
        const allXTrefs = { xtrefs: [] };
        const result = addNewXTrefsFromMarkdown(markdownContent, allXTrefs);
        
        // Should create only one external reference despite multiple aliases
        expect(result.xtrefs.length).toBe(1);
        expect(result.xtrefs[0].externalSpec).toBe('vlei1');
        expect(result.xtrefs[0].term).toBe('vlei-ecosystem-governance-framework');
        // The alias from the first occurrence should be stored
        expect(result.xtrefs[0].alias).toBe('vEGF');
    });

    it('should match existing external references when checking markdown content with aliases', () => {
        const xtref = { externalSpec: 'vlei1', term: 'vlei-ecosystem-governance-framework' };
        
        // All these markdown patterns should match the same external reference
        const markdownPatterns = [
            '[[tref:vlei1, vlei-ecosystem-governance-framework]]',
            '[[tref:vlei1, vlei-ecosystem-governance-framework, vEGF]]',
            '[[tref:vlei1, vlei-ecosystem-governance-framework, VEGF]]',
            '[[xref:vlei1, vlei-ecosystem-governance-framework, someAlias]]'
        ];
        
        markdownPatterns.forEach(markdown => {
            expect(isXTrefInMarkdown(xtref, markdown)).toBe(true);
        });
    });

    it('should not match when external spec or term differs', () => {
        const xtref = { externalSpec: 'vlei1', term: 'vlei-ecosystem-governance-framework' };
        
        const nonMatchingPatterns = [
            '[[tref:vlei2, vlei-ecosystem-governance-framework, vEGF]]', // Different spec
            '[[tref:vlei1, different-term, vEGF]]', // Different term
            '[[tref:vlei1, vlei-ecosystem-governance-frameworkX]]' // Slightly different term
        ];
        
        nonMatchingPatterns.forEach(markdown => {
            expect(isXTrefInMarkdown(xtref, markdown)).toBe(false);
        });
    });
});
