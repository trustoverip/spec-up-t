const MarkdownIt = require('markdown-it');
const { rewriteRenderedImageSources } = require('./rewrite-image-sources');

const spec = {
    source: {
        host: 'github',
        account: 'trustoverip',
        repo: 'kswg-keri-specification'
    }
};

function rewritten(html, branch = 'main', sourceSpec = spec) {
    return rewriteRenderedImageSources(html, sourceSpec, branch);
}

describe('rewriteRenderedImageSources', () => {
    test('builds a raw URL from a repository-relative images path', () => {
        const md = new MarkdownIt({ html: true });
        const html = md.render('![Authenticatable Message](images/AuthenticatableMessage.png)');
        const result = rewritten(html, 'main');

        expect(result.rewrittenCount).toBe(1);
        expect(result.html).toContain(
            'https://raw.githubusercontent.com/trustoverip/kswg-keri-specification/main/images/AuthenticatableMessage.png'
        );
        expect(result.html).toContain('alt="Authenticatable Message"');
        expect(result.html).not.toContain('src="images/');
    });

    test('resolves ./, ../, and a leading slash onto images/', () => {
        const html = [
            '<img src="./images/a.png">',
            '<img src="../images/b.png">',
            '<img src="/images/c.png">'
        ].join('');
        const result = rewritten(html, 'revised-format');

        expect(result.rewrittenCount).toBe(3);
        expect(result.html).toContain('/revised-format/images/a.png');
        expect(result.html).toContain('/revised-format/images/b.png');
        expect(result.html).toContain('/revised-format/images/c.png');
    });

    test('keeps a query string and encodes spaces in the file name', () => {
        const result = rewritten('<img src="images/my file.png?v=1">', 'main');
        expect(result.html).toContain('/main/images/my%20file.png?v=1');
    });

    test('replaces a stale branch on a same-repo raw URL', () => {
        const html = '<img src="https://raw.githubusercontent.com/trustoverip/kswg-keri-specification/revised-format/images/AuthenticatableMessage.png" alt="Authenticatable Message">';
        const result = rewritten(html, 'main');

        expect(result.rewrittenCount).toBe(1);
        expect(result.html).toContain(
            'src="https://raw.githubusercontent.com/trustoverip/kswg-keri-specification/main/images/AuthenticatableMessage.png"'
        );
        expect(result.html).not.toContain('revised-format');
    });

    test('turns a same-repo blob URL into a raw URL on the build branch', () => {
        const html = '<img src="https://github.com/trustoverip/kswg-keri-specification/blob/revised-format/images/AuthenticatableMessage.png?raw=true">';
        const result = rewritten(html, 'main');

        expect(result.html).toContain(
            'https://raw.githubusercontent.com/trustoverip/kswg-keri-specification/main/images/AuthenticatableMessage.png'
        );
        expect(result.html).not.toContain('blob/');
        expect(result.html).not.toContain('raw=true');
    });

    test('turns a github.com/raw URL into raw.githubusercontent.com', () => {
        const html = '<img src="https://github.com/trustoverip/kswg-keri-specification/raw/revised-format/images/a.png">';
        const result = rewritten(html, 'feature/add-images');

        expect(result.html).toContain(
            'https://raw.githubusercontent.com/trustoverip/kswg-keri-specification/refs/heads/feature/add-images/images/a.png'
        );
    });

    test('reads refs/heads when the branch name contains a slash', () => {
        const html = '<img src="https://raw.githubusercontent.com/trustoverip/kswg-keri-specification/refs/heads/feature/add-images/images/a.png">';
        const result = rewritten(html, 'main');

        expect(result.html).toContain('/main/images/a.png');
        expect(result.html).not.toContain('feature/add-images');
    });

    test('leaves a commit pin, another repository, and another host unchanged', () => {
        const sha = '0123456789abcdef0123456789abcdef01234567';
        const html = [
            `<img src="https://raw.githubusercontent.com/trustoverip/kswg-keri-specification/${sha}/images/pinned.png">`,
            '<img src="https://raw.githubusercontent.com/trustoverip/tswg-keri-specification/revised-format/images/old-repo.png">',
            '<img src="https://example.com/images/external.png">'
        ].join('');
        const result = rewritten(html, 'main');

        expect(result.rewrittenCount).toBe(0);
        expect(result.html).toContain(`${sha}/images/pinned.png`);
        expect(result.html).toContain('tswg-keri-specification/revised-format/images/old-repo.png');
        expect(result.html).toContain('https://example.com/images/external.png');
    });

    test('does not rewrite relative files outside images/ or data-src', () => {
        const html = '<img data-src="images/deferred.png" src="static/logo.svg">';
        const result = rewritten(html, 'main');

        expect(result.rewrittenCount).toBe(0);
        expect(result.html).toBe(html);
    });

    test('does not rewrite an image example inside a code block', () => {
        const html = '<pre><code>&lt;img src="images/a.png"&gt;</code></pre>';
        const result = rewritten(html, 'main');
        expect(result.html).toBe(html);
    });

    test('skips rewriting when the spec is not a GitHub source or has no repository', () => {
        const html = '<img src="images/a.png">';
        expect(rewritten(html, 'main', { source: { host: 'gitlab', account: 'a', repo: 'b' } }).html).toBe(html);
        expect(rewritten(html, 'main', {}).html).toBe(html);
        expect(rewritten(html, '', spec).html).toBe(html);
    });
});
