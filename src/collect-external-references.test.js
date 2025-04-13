describe('isXTrefInMarkdown function', () => {
    const isXTrefInMarkdown = require('./collect-external-references').isXTrefInMarkdown;

    const testCases = [
        {
            name: 'basic xref format',
            xtref: { externalSpec: 'kmg-1', term: 'authentic-chained-data-container' },
            markdown: '[[xref:kmg-1,authentic-chained-data-container]]',
            shouldMatch: true
        },
        {
            name: 'basic tref format',
            xtref: { externalSpec: 'kmg-1', term: 'authentic-chained-data-container' },
            markdown: '[[tref:kmg-1,authentic-chained-data-container]]',
            shouldMatch: true
        },
        {
            name: 'xref with spaces',
            xtref: { externalSpec: 'kmg-1', term: 'authentic-chained-data-container' },
            markdown: '[[xref:kmg-1, authentic-chained-data-container]]',
            shouldMatch: true
        },
        {
            name: 'multiple references in content',
            xtref: { externalSpec: 'kmg-1', term: 'authentic-chained-data-container' },
            markdown: 'Text before [[xref:kmg-1,authentic-chained-data-container]] and text after',
            shouldMatch: true
        },
        {
            name: 'non-matching external spec',
            xtref: { externalSpec: 'kmg-1', term: 'authentic-chained-data-container' },
            markdown: '[[xref:different-spec,authentic-chained-data-container]]',
            shouldMatch: false
        },
        {
            name: 'non-matching term',
            xtref: { externalSpec: 'kmg-1', term: 'authentic-chained-data-container' },
            markdown: '[[xref:kmg-1,different-term]]',
            shouldMatch: false
        },
        {
            name: 'complex term with hyphens',
            xtref: { externalSpec: 'vlei-1', term: 'legal-entity-identifier' },
            markdown: '[[xref:vlei-1,legal-entity-identifier]]',
            shouldMatch: true
        },

        // Test cases for case sensitivity
        {
            name: 'uppercase in externalSpec',
            xtref: { externalSpec: 'kmg-1', term: 'authentic-chained-data-container' },
            markdown: '[[xref:KMG-1,authentic-chained-data-container]]',
            shouldMatch: false
        },
        {
            name: 'uppercase in term',
            xtref: { externalSpec: 'kmg-1', term: 'authentic-chained-data-container' },
            markdown: '[[xref:kmg-1,Authentic-Chained-Data-Container]]',
            shouldMatch: false
        },
        {
            name: 'exact case match with mixed case',
            xtref: { externalSpec: 'Mixed-Case', term: 'Some-Mixed-Case-Term' },
            markdown: '[[xref:Mixed-Case,Some-Mixed-Case-Term]]',
            shouldMatch: true
        },

        /*
        The test case below verifies that:

        - References can be found in a complex, multi-line document
        - The function correctly matches when the reference appears in different parts of the document
        - Both xref and tref formats are properly detected
        - Line breaks and markdown formatting don't interfere with the matching
        
        */
        {
            name: 'multi-line markdown document',
            xtref: { externalSpec: 'kmg-1', term: 'authentic-chained-data-container' },
            markdown: `# Document Title

This is a paragraph that talks about various concepts.

## First Section
Here we discuss the [[xref:kmg-1,authentic-chained-data-container]] concept.

## Second Section
This section refers to a different term.

## Third Section
And here we reference it again using [[tref:kmg-1,authentic-chained-data-container]].

### Conclusion
That's all about these references.`,
            shouldMatch: true
        }
    ];

    testCases.forEach(testCase => {
        test(`${testCase.shouldMatch ? 'matches' : 'does not match'} ${testCase.name}`, () => {
            expect(isXTrefInMarkdown(testCase.xtref, testCase.markdown)).toBe(testCase.shouldMatch);
        });
    });
});


describe('addNewXTrefsFromMarkdown', () => {
    const addNewXTrefsFromMarkdown = require('./collect-external-references').addNewXTrefsFromMarkdown;

    it('should add a new xtref from markdown content', () => {
        const markdownContent = "Some text [[xref:specA, termA]] more text";
        const allXTrefs = { xtrefs: [] };
        const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, allXTrefs);

        expect(updatedXTrefs.xtrefs.length).toBe(1);
        expect(updatedXTrefs.xtrefs[0]).toEqual({
            externalSpec: 'specA',
            term: 'termA'
        });
    });

    it('should not add duplicate xtrefs', () => {
        const markdownContent = "Content [[xref:specA, termA]] and again [[xref:specA, termA]]";
        const allXTrefs = { xtrefs: [] };
        const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, allXTrefs);

        expect(updatedXTrefs.xtrefs.length).toBe(1);
    });

    it('should add multiple distinct xtrefs', () => {
        const markdownContent = "[[xref:specA, termA]] some text [[tref:specB, termB]]";
        const allXTrefs = { xtrefs: [] };
        const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, allXTrefs);

        expect(updatedXTrefs.xtrefs.length).toBe(2);
        expect(updatedXTrefs.xtrefs).toEqual(
            expect.arrayContaining([
                { externalSpec: 'specA', term: 'termA' },
                { externalSpec: 'specB', term: 'termB' }
            ])
        );
    });

    it('should not change xtrefs when no xtrefs are found in markdown content', () => {
        const markdownContent = "This is markdown without any reference links.";
        const initialXTrefs = { xtrefs: [] };
        const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, initialXTrefs);

        expect(updatedXTrefs.xtrefs.length).toBe(0);
    });

});