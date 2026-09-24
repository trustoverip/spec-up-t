const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const MarkdownIt = require('markdown-it');
const { rewriteRenderedImageSources } = require('./rewrite-image-sources');

const RAW = 'https://raw.githubusercontent.com/trustoverip/kswg-keri-specification';
let repoRoot;
let spec;

function addFile(repoPath) {
    const full = path.join(repoRoot, repoPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, 'x');
}

function rewritten(html, branch = 'main', sourceSpec = spec) {
    return rewriteRenderedImageSources(html, sourceSpec, branch, { repoRoot });
}

beforeEach(() => {
    repoRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'spec-up-t-images-')));
    spec = {
        spec_directory: path.join(repoRoot, 'spec'),
        markdown_paths: ['spec-head.md', 'terms-definitions/term.md', 'spec-body.md'],
        source: {
            host: 'github',
            account: 'trustoverip',
            repo: 'kswg-keri-specification'
        }
    };
    fs.mkdirSync(path.join(repoRoot, 'spec'), { recursive: true });
});

afterEach(() => {
    fs.rmSync(repoRoot, { recursive: true, force: true });
});

describe('rewriteRenderedImageSources: relative paths', () => {
    test('builds a raw URL for markdown image syntax', () => {
        addFile('images/AuthenticatableMessage.png');
        const md = new MarkdownIt({ html: true });
        const html = md.render('![Authenticatable Message](images/AuthenticatableMessage.png)');
        const result = rewritten(html);

        expect(result.rewrittenCount).toBe(1);
        expect(result.rewrittenFiles).toEqual(['images/AuthenticatableMessage.png']);
        expect(result.html).toContain(`src="${RAW}/main/images/AuthenticatableMessage.png"`);
        expect(result.html).toContain('alt="Authenticatable Message"');
    });

    test('prefers the folder of the markdown file over the repository root', () => {
        addFile('spec/images/a.png');
        addFile('images/a.png');
        const result = rewritten('<img src="images/a.png">');
        expect(result.html).toContain(`${RAW}/main/spec/images/a.png`);
    });

    test('falls back to the repository root', () => {
        addFile('images/a.png');
        const result = rewritten('<img src="images/a.png">');
        expect(result.html).toContain(`${RAW}/main/images/a.png`);
    });

    test('reads ../ relative to the markdown file', () => {
        addFile('images/a.png');
        const result = rewritten('<img src="../images/a.png">');
        expect(result.html).toContain(`${RAW}/main/images/a.png`);
    });

    test('reads a leading slash from the repository root only', () => {
        addFile('assets/img/photo.jpg');
        addFile('spec/assets/img/photo.jpg');
        const result = rewritten('<img src="/assets/img/photo.jpg">');
        expect(result.html).toContain(`${RAW}/main/assets/img/photo.jpg`);
    });

    test('tracks the markdown file through file markers', () => {
        addFile('spec/terms-definitions/diagram.png');
        addFile('spec/diagram.png');
        const html = [
            '<img src="diagram.png" alt="head">',
            '<!-- file: terms-definitions/term.md -->',
            '<img src="diagram.png" alt="term">',
            '<!-- file: spec-body.md -->',
            '<img src="diagram.png" alt="body">'
        ].join('\n');
        const result = rewritten(html);

        expect(result.html).toContain(`src="${RAW}/main/spec/diagram.png" alt="head"`);
        expect(result.html).toContain(`src="${RAW}/main/spec/terms-definitions/diagram.png" alt="term"`);
        expect(result.html).toContain(`src="${RAW}/main/spec/diagram.png" alt="body"`);
        expect(result.rewrittenFiles.sort()).toEqual(['spec/diagram.png', 'spec/terms-definitions/diagram.png']);
    });

    test('leaves a path unchanged when the file does not exist', () => {
        const html = '<img src="images/missing.png"><img src="/static/logo.svg">';
        const result = rewritten(html);
        expect(result.rewrittenCount).toBe(0);
        expect(result.html).toBe(html);
    });

    test('does not resolve a path outside the repository', () => {
        const html = '<img src="../../../etc/hosts">';
        expect(rewritten(html).html).toBe(html);
    });

    test('keeps a query string and encodes spaces in the file name', () => {
        addFile('images/my file.png');
        const result = rewritten('<img src="images/my%20file.png?v=1">');
        expect(result.html).toContain(`${RAW}/main/images/my%20file.png?v=1`);
    });

    test('writes refs/heads/ for a branch with a slash, and accepts a commit SHA', () => {
        addFile('images/a.png');
        const sha = '0123456789abcdef0123456789abcdef01234567';
        expect(rewritten('<img src="images/a.png">', 'feature/add-images').html)
            .toContain(`${RAW}/refs/heads/feature/add-images/images/a.png`);
        expect(rewritten('<img src="images/a.png">', sha).html)
            .toContain(`${RAW}/${sha}/images/a.png`);
    });

    test('does not rewrite data-src or an image example inside a code block', () => {
        addFile('images/a.png');
        const html = '<img data-src="images/a.png" src="static/logo.svg"><pre><code>&lt;img src="images/a.png"&gt;</code></pre>';
        expect(rewritten(html).html).toBe(html);
    });
});

describe('rewriteRenderedImageSources: same-repo GitHub URLs', () => {
    test('replaces a stale branch when the file exists', () => {
        addFile('images/AuthenticatableMessage.png');
        const html = `<img src="${RAW}/revised-format/images/AuthenticatableMessage.png">`;
        const result = rewritten(html);

        expect(result.html).toBe(`<img src="${RAW}/main/images/AuthenticatableMessage.png">`);
        expect(result.rewrittenFiles).toEqual(['images/AuthenticatableMessage.png']);
    });

    test('turns blob and github.com/raw URLs into raw URLs', () => {
        addFile('docs-src/a.png');
        const html = [
            '<img src="https://github.com/trustoverip/kswg-keri-specification/blob/revised-format/docs-src/a.png?raw=true">',
            '<img src="https://github.com/trustoverip/kswg-keri-specification/raw/revised-format/docs-src/a.png">'
        ].join('');
        const result = rewritten(html);

        expect(result.rewrittenCount).toBe(2);
        expect(result.html).not.toContain('raw=true');
        expect(result.html.match(new RegExp(`${RAW}/main/docs-src/a\\.png`, 'g'))).toHaveLength(2);
    });

    test('reads a multi-segment branch after refs/heads/', () => {
        addFile('images/a.png');
        const result = rewritten(`<img src="${RAW}/refs/heads/feature/x/images/a.png">`);
        expect(result.html).toContain(`${RAW}/main/images/a.png`);
    });

    test('leaves a plain URL unchanged when the branch cannot be separated from the path', () => {
        addFile('images/a.png');
        const html = `<img src="${RAW}/feature/x/images/a.png">`;
        expect(rewritten(html).html).toBe(html);
    });

    test('leaves a refs/heads URL unchanged when two readings name existing files', () => {
        addFile('images/a.png');
        addFile('x/images/a.png');
        const html = `<img src="${RAW}/refs/heads/feature/x/images/a.png">`;
        expect(rewritten(html).html).toBe(html);
    });

    test('leaves a URL unchanged when the file no longer exists', () => {
        const html = `<img src="${RAW}/revised-format/images/removed.png">`;
        expect(rewritten(html).html).toBe(html);
    });

    test('leaves a commit pin, another repository, and another host unchanged', () => {
        addFile('images/a.png');
        const sha = '0123456789abcdef0123456789abcdef01234567';
        const html = [
            `<img src="${RAW}/${sha}/images/a.png">`,
            '<img src="https://raw.githubusercontent.com/trustoverip/tswg-keri-specification/revised-format/images/a.png">',
            '<img src="https://example.com/images/a.png">'
        ].join('');
        expect(rewritten(html).html).toBe(html);
    });
});

describe('rewriteRenderedImageSources: configuration', () => {
    test('skips rewriting for a non-GitHub source, a missing repository, or no branch', () => {
        addFile('images/a.png');
        const html = '<img src="images/a.png">';
        expect(rewritten(html, 'main', { ...spec, source: { host: 'gitlab', account: 'a', repo: 'b' } }).html).toBe(html);
        expect(rewritten(html, 'main', { ...spec, source: undefined }).html).toBe(html);
        expect(rewritten(html, '').html).toBe(html);
    });
});
