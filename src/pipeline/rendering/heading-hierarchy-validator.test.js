const { warnOnHeadingHierarchyViolations } = require('./heading-hierarchy-validator');

// Create a mock Logger to capture warnings without real output
function makeMockLogger() {
    return { warnings: [], warn(...args) { this.warnings.push(args); } };
}

describe('warnOnHeadingHierarchyViolations', () => {
    test('produces no warnings for a correctly nested sequence', () => {
        const html = '<h1>Title</h1><h2>Section</h2><h3>Sub</h3>';
        const logger = makeMockLogger();
        warnOnHeadingHierarchyViolations(html, logger);
        expect(logger.warnings).toHaveLength(0);
    });

    test('produces no warnings when heading level decreases', () => {
        // Going back up is always valid
        const html = '<h3>Deep</h3><h2>Back up</h2><h1>Root</h1>';
        const logger = makeMockLogger();
        warnOnHeadingHierarchyViolations(html, logger);
        expect(logger.warnings).toHaveLength(0);
    });

    test('warns when h1 is directly followed by h3 (skips h2)', () => {
        const html = '<h1>Title</h1><h3>Skipped level</h3>';
        const logger = makeMockLogger();
        warnOnHeadingHierarchyViolations(html, logger);
        expect(logger.warnings).toHaveLength(1);
        expect(logger.warnings[0][0]).toContain('h3');
        expect(logger.warnings[0][0]).toContain('h1');
    });

    test('warns when h2 is directly followed by h5 (skips h3 and h4)', () => {
        const html = '<h2>Section</h2><h5>Way too deep</h5>';
        const logger = makeMockLogger();
        warnOnHeadingHierarchyViolations(html, logger);
        expect(logger.warnings).toHaveLength(1);
        const warnMessage = logger.warnings[0][0];
        expect(warnMessage).toContain('h5');
        expect(warnMessage).toContain('h2');
    });

    test('includes a hint and context in the warning options', () => {
        const html = '<h1>Title</h1><h3>Skipped</h3>';
        const logger = makeMockLogger();
        warnOnHeadingHierarchyViolations(html, logger);
        const options = logger.warnings[0][1];
        expect(options).toHaveProperty('hint');
        expect(options).toHaveProperty('context');
    });

    test('detects multiple violations in one document', () => {
        const html = '<h1>A</h1><h3>B</h3><h2>C</h2><h4>D</h4>';
        const logger = makeMockLogger();
        warnOnHeadingHierarchyViolations(html, logger);
        // h1->h3 is a violation, h2->h4 is a violation
        expect(logger.warnings).toHaveLength(2);
    });

    test('handles html with no headings gracefully', () => {
        const html = '<p>Just a paragraph</p>';
        const logger = makeMockLogger();
        warnOnHeadingHierarchyViolations(html, logger);
        expect(logger.warnings).toHaveLength(0);
    });

    test('handles empty string gracefully', () => {
        const logger = makeMockLogger();
        warnOnHeadingHierarchyViolations('', logger);
        expect(logger.warnings).toHaveLength(0);
    });

    test('does not warn when levels increase by exactly one', () => {
        const html = '<h1>A</h1><h2>B</h2><h3>C</h3><h4>D</h4><h5>E</h5><h6>F</h6>';
        const logger = makeMockLogger();
        warnOnHeadingHierarchyViolations(html, logger);
        expect(logger.warnings).toHaveLength(0);
    });
});
