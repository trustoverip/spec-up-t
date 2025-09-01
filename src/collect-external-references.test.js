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
        },

        // Test cases for aliases - the function should match when the original term exists regardless of alias
        {
            name: 'tref with alias should match based on original term',
            xtref: { externalSpec: 'vlei1', term: 'vlei-ecosystem-governance-framework' },
            markdown: '[[tref:vlei1, vlei-ecosystem-governance-framework, vEGF]]',
            shouldMatch: true
        },
        {
            name: 'xref with alias should match based on original term',
            xtref: { externalSpec: 'vlei1', term: 'vlei-ecosystem-governance-framework' },
            markdown: '[[xref:vlei1, vlei-ecosystem-governance-framework, vEGF]]',
            shouldMatch: true
        },
        {
            name: 'multiple aliases for same term should match',
            xtref: { externalSpec: 'spec1', term: 'long-term-name' },
            markdown: 'Text [[tref:spec1, long-term-name, alias1]] and [[tref:spec1, long-term-name, alias2]]',
            shouldMatch: true
        },
        {
            name: 'tref with spaces in alias should match',
            xtref: { externalSpec: 'spec1', term: 'term1' },
            markdown: '[[tref:spec1, term1, alias with spaces]]',
            shouldMatch: true
        },

        // Test case for the specific issue with hyphens and spaces
        {
            name: 'external spec and term with hyphens and alias should match',
            xtref: { externalSpec: 'vlei-glossary', term: 'vlei-ecosystem-governance-framework' },
            markdown: '[[tref: vlei-glossary, vlei-ecosystem-governance-framework, vegf]]',
            shouldMatch: true
        },
        {
            name: 'external spec and term with hyphens without alias should match',
            xtref: { externalSpec: 'vlei-glossary', term: 'vlei-ecosystem-governance-framework' },
            markdown: '[[tref: vlei-glossary, vlei-ecosystem-governance-framework]]',
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

    it('should not add duplicate xtrefs with same spec and term but different aliases', () => {
        const markdownContent = "Content [[xref:specA, termA]] and again [[xref:specA, termA, aliasA]]";
        const allXTrefs = { xtrefs: [] };
        const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, allXTrefs);

        expect(updatedXTrefs.xtrefs.length).toBe(1);
        expect(updatedXTrefs.xtrefs[0].term).toBe('termA');
        expect(updatedXTrefs.xtrefs[0].externalSpec).toBe('specA');
        // The first one found will be used (without alias in this case)
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

    it('should add a new tref with alias from markdown content', () => {
        const markdownContent = "Some text [[tref:specA, termA, aliasA]] more text";
        const allXTrefs = { xtrefs: [] };
        const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, allXTrefs);

        expect(updatedXTrefs.xtrefs.length).toBe(1);
        expect(updatedXTrefs.xtrefs[0]).toEqual({
            externalSpec: 'specA',
            term: 'termA',
            alias: 'aliasA'
        });
    });

    it('should add a new xref with alias from markdown content', () => {
        const markdownContent = "Some text [[xref:specA, termA, aliasA]] more text";
        const allXTrefs = { xtrefs: [] };
        const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, allXTrefs);

        expect(updatedXTrefs.xtrefs.length).toBe(1);
        expect(updatedXTrefs.xtrefs[0]).toEqual({
            externalSpec: 'specA',
            term: 'termA',
            alias: 'aliasA'
        });
    });

    it('should handle tref without alias (backwards compatibility)', () => {
        const markdownContent = "Some text [[tref:specA, termA]] more text";
        const allXTrefs = { xtrefs: [] };
        const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, allXTrefs);

        expect(updatedXTrefs.xtrefs.length).toBe(1);
        expect(updatedXTrefs.xtrefs[0]).toEqual({
            externalSpec: 'specA',
            term: 'termA'
        });
        expect(updatedXTrefs.xtrefs[0].alias).toBeUndefined();
    });

});


describe('processXTref', () => {
    const processXTref = require('./collect-external-references').processXTref;

    it('should process basic xref without alias', () => {
        const xtref = '[[xref:specA,termA]]';
        const result = processXTref(xtref);
        
        expect(result).toEqual({
            externalSpec: 'specA',
            term: 'termA'
        });
    });

    it('should process basic tref without alias', () => {
        const xtref = '[[tref:specA,termA]]';
        const result = processXTref(xtref);
        
        expect(result).toEqual({
            externalSpec: 'specA',
            term: 'termA'
        });
    });

    it('should process tref with alias', () => {
        const xtref = '[[tref:specA,termA,aliasA]]';
        const result = processXTref(xtref);
        
        expect(result).toEqual({
            externalSpec: 'specA',
            term: 'termA',
            alias: 'aliasA'
        });
    });

    it('should process xref with alias', () => {
        const xtref = '[[xref:specA,termA,aliasA]]';
        const result = processXTref(xtref);
        
        expect(result).toEqual({
            externalSpec: 'specA',
            term: 'termA',
            alias: 'aliasA'
        });
    });

    it('should handle spaces in parameters', () => {
        const xtref = '[[tref: specA , termA , aliasA ]]';
        const result = processXTref(xtref);
        
        expect(result).toEqual({
            externalSpec: 'specA',
            term: 'termA',
            alias: 'aliasA'
        });
    });

    it('should ignore empty alias parameter', () => {
        const xtref = '[[tref:specA,termA,]]';
        const result = processXTref(xtref);
        
        expect(result).toEqual({
            externalSpec: 'specA',
            term: 'termA'
        });
        expect(result.alias).toBeUndefined();
    });
});

describe('addNewXTrefsFromMarkdown with filename tracking', () => {
    const addNewXTrefsFromMarkdown = require('./collect-external-references').addNewXTrefsFromMarkdown;

    it('should add sourceFile property when filename is provided', () => {
        const markdownContent = "Some text [[xref:specA, termA]] more text";
        const allXTrefs = { xtrefs: [] };
        const filename = 'test-file.md';
        const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, allXTrefs, filename);

        expect(updatedXTrefs.xtrefs.length).toBe(1);
        expect(updatedXTrefs.xtrefs[0]).toEqual({
            externalSpec: 'specA',
            term: 'termA',
            sourceFile: 'test-file.md'
        });
    });

    it('should not add sourceFile property when filename is not provided', () => {
        const markdownContent = "Some text [[xref:specA, termA]] more text";
        const allXTrefs = { xtrefs: [] };
        const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, allXTrefs);

        expect(updatedXTrefs.xtrefs.length).toBe(1);
        expect(updatedXTrefs.xtrefs[0]).toEqual({
            externalSpec: 'specA',
            term: 'termA'
        });
        expect(updatedXTrefs.xtrefs[0].sourceFile).toBeUndefined();
        expect(updatedXTrefs.xtrefs[0].sourceFiles).toBeUndefined();
    });

    it('should create sourceFiles array when same xtref found in multiple files', () => {
        const markdownContent1 = "Some text [[xref:specA, termA]] more text";
        const markdownContent2 = "Different text [[xref:specA, termA]] here";
        const allXTrefs = { xtrefs: [] };

        // Add from first file
        addNewXTrefsFromMarkdown(markdownContent1, allXTrefs, 'file1.md');
        // Add from second file - should create sourceFiles array
        const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent2, allXTrefs, 'file2.md');

        expect(updatedXTrefs.xtrefs.length).toBe(1);
        expect(updatedXTrefs.xtrefs[0].externalSpec).toBe('specA');
        expect(updatedXTrefs.xtrefs[0].term).toBe('termA');
        expect(updatedXTrefs.xtrefs[0].sourceFiles).toEqual(['file1.md', 'file2.md']);
        expect(updatedXTrefs.xtrefs[0].sourceFile).toBeUndefined();
    });

    it('should not duplicate filenames in sourceFiles array', () => {
        const markdownContent = "Some text [[xref:specA, termA]] and again [[xref:specA, termA]]";
        const allXTrefs = { xtrefs: [] };

        // Process same file twice
        addNewXTrefsFromMarkdown(markdownContent, allXTrefs, 'file1.md');
        const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, allXTrefs, 'file1.md');

        expect(updatedXTrefs.xtrefs.length).toBe(1);
        expect(updatedXTrefs.xtrefs[0].sourceFile).toBe('file1.md');
        expect(updatedXTrefs.xtrefs[0].sourceFiles).toBeUndefined();
    });

    it('should handle conversion from sourceFile to sourceFiles array', () => {
        const allXTrefs = { 
            xtrefs: [
                {
                    externalSpec: 'specA',
                    term: 'termA',
                    sourceFile: 'existing-file.md'
                }
            ] 
        };
        const markdownContent = "Text [[xref:specA, termA]] here";
        
        const updatedXTrefs = addNewXTrefsFromMarkdown(markdownContent, allXTrefs, 'new-file.md');

        expect(updatedXTrefs.xtrefs.length).toBe(1);
        expect(updatedXTrefs.xtrefs[0].sourceFiles).toEqual(['existing-file.md', 'new-file.md']);
        expect(updatedXTrefs.xtrefs[0].sourceFile).toBeUndefined();
    });
});

describe('isXTrefInAnyFile', () => {
    const isXTrefInAnyFile = require('./collect-external-references').isXTrefInAnyFile;

    it('should return true when xtref is found in at least one file', () => {
        const xtref = { externalSpec: 'specA', term: 'termA' };
        const fileContents = new Map([
            ['file1.md', 'Some content without xrefs'],
            ['file2.md', 'Content with [[xref:specA,termA]] reference'],
            ['file3.md', 'More content without xrefs']
        ]);

        const result = isXTrefInAnyFile(xtref, fileContents);
        expect(result).toBe(true);
    });

    it('should return false when xtref is not found in any file', () => {
        const xtref = { externalSpec: 'specA', term: 'termA' };
        const fileContents = new Map([
            ['file1.md', 'Some content without xrefs'],
            ['file2.md', 'Content with [[xref:specB,termB]] reference'],
            ['file3.md', 'More content without xrefs']
        ]);

        const result = isXTrefInAnyFile(xtref, fileContents);
        expect(result).toBe(false);
    });

    it('should handle empty file contents map', () => {
        const xtref = { externalSpec: 'specA', term: 'termA' };
        const fileContents = new Map();

        const result = isXTrefInAnyFile(xtref, fileContents);
        expect(result).toBe(false);
    });
});