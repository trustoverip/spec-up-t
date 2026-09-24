/**
 * Rewrites spec image sources so the published URL uses the branch that
 * produced this build.
 *
 * An image is rewritten only when its file exists in the repository:
 * - A relative path is read from the folder of the markdown file that
 *   contains it, then from the repository root. A path starting with /
 *   is read from the repository root only.
 * - A same-repo raw.githubusercontent.com or github.com blob|raw URL has its
 *   ref replaced when the file it names exists in the working tree.
 * Both become
 * https://raw.githubusercontent.com/<account>/<repo>/<branch>/<path>
 *
 * Images on another host, in another repository, pinned to a commit SHA,
 * whose ref cannot be separated from the path unambiguously, or whose file
 * does not exist are left unchanged.
 */

const fs = require('node:fs');
const path = require('node:path');

const FILE_MARKER = /^<!-- file: (.+?) -->$/;
const MARKER_OR_IMG = /<!-- file: [^\n]+? -->|<img\b[^>]*>/gi;

function isGithubSource(spec) {
    const host = spec && spec.source && spec.source.host;
    if (!host) {
        return true;
    }
    return String(host).toLowerCase() === 'github';
}

function encodeRef(ref) {
    return String(ref).split('/').map(encodeURIComponent).join('/');
}

function encodeRepoPath(repoPath) {
    return String(repoPath)
        .split('/')
        .filter(segment => segment.length > 0)
        .map(segment => encodeURIComponent(segment))
        .join('/');
}

function buildRawUrl(account, repo, branch, repoPath, suffix) {
    // A slash in the branch name is ambiguous in a raw URL unless the ref is explicit.
    const ref = String(branch).includes('/')
        ? `refs/heads/${encodeRef(branch)}`
        : encodeRef(branch);
    return `https://raw.githubusercontent.com/${account}/${repo}/${ref}/${encodeRepoPath(repoPath)}${suffix || ''}`;
}

function decodeSegment(segment) {
    try {
        return decodeURIComponent(segment);
    } catch {
        return segment;
    }
}

function isCommitPin(ref) {
    const name = ref.startsWith('refs/heads/') || ref.startsWith('refs/tags/')
        ? ref.split('/').slice(2).join('/')
        : ref;
    return /^[0-9a-f]{7,40}$/i.test(name);
}

/**
 * Normalizes a path to a repository-relative POSIX path.
 *
 * @returns {string|null} null when the path is empty or leaves the repository
 */
function toRepoPath(...parts) {
    const joined = path.posix.normalize(path.posix.join(...parts.map(p => String(p).replace(/\\/g, '/'))));
    const trimmed = joined.replace(/^\/+/, '');
    if (!trimmed || trimmed === '.' || trimmed === '..' || trimmed.startsWith('../')) {
        return null;
    }
    return trimmed;
}

/**
 * Splits the segments that follow owner/repo (and an optional raw|blob) into
 * a ref and a file path. A URL cannot say where a branch name ends, so the
 * split is accepted only when exactly one reading names an existing file.
 * Plain refs are one segment. refs/heads/ and refs/tags/ refs may span several.
 *
 * @returns {{ ref: string, path: string }|null}
 */
function splitRefAndPath(segments, fileExists) {
    if (!segments || segments.length < 2) {
        return null;
    }

    const decoded = segments.map(decodeSegment);
    const candidates = [];

    if (decoded[0] === 'refs' && (decoded[1] === 'heads' || decoded[1] === 'tags')) {
        for (let end = 3; end < decoded.length; end++) {
            candidates.push({
                ref: decoded.slice(0, end).join('/'),
                path: toRepoPath(decoded.slice(end).join('/'))
            });
        }
    } else {
        candidates.push({
            ref: decoded[0],
            path: toRepoPath(decoded.slice(1).join('/'))
        });
    }

    const matches = candidates.filter(c => c.path && fileExists(c.path));
    return matches.length === 1 ? matches[0] : null;
}

function sameAccountRepo(urlAccount, urlRepo, account, repo) {
    return urlAccount.toLowerCase() === account.toLowerCase()
        && urlRepo.toLowerCase() === repo.toLowerCase();
}

function suffixFromUrl(url, dropRawParam) {
    const params = new URLSearchParams(url.search);
    if (dropRawParam) {
        params.delete('raw');
    }
    const search = params.toString();
    return `${search ? `?${search}` : ''}${url.hash || ''}`;
}

/**
 * @returns {{ url: string, repoPath: string }|null}
 */
function rewriteSameRepoGithubImage(src, ctx) {
    let url;
    try {
        url = new URL(src);
    } catch {
        return null;
    }

    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
    let refSegments;
    let dropRawParam = false;

    if (host === 'raw.githubusercontent.com') {
        if (parts.length < 4 || !sameAccountRepo(parts[0], parts[1], ctx.account, ctx.repo)) {
            return null;
        }
        refSegments = parts.slice(2);
    } else if (host === 'github.com') {
        if (parts.length < 5 || !sameAccountRepo(parts[0], parts[1], ctx.account, ctx.repo)) {
            return null;
        }
        const kind = parts[2].toLowerCase();
        if (kind !== 'raw' && kind !== 'blob') {
            return null;
        }
        dropRawParam = kind === 'blob';
        refSegments = parts.slice(3);
    } else {
        return null;
    }

    const refAndPath = splitRefAndPath(refSegments, ctx.fileExists);
    if (!refAndPath || isCommitPin(refAndPath.ref)) {
        return null;
    }

    return {
        url: buildRawUrl(ctx.account, ctx.repo, ctx.branch, refAndPath.path, suffixFromUrl(url, dropRawParam)),
        repoPath: refAndPath.path
    };
}

/**
 * @returns {{ url: string, repoPath: string }|null}
 */
function rewriteRelativeImage(src, markdownDir, ctx) {
    const queryAt = src.indexOf('?');
    const hashAt = src.indexOf('#');
    let end = src.length;
    if (queryAt >= 0) {
        end = Math.min(end, queryAt);
    }
    if (hashAt >= 0) {
        end = Math.min(end, hashAt);
    }

    const rawPath = src.slice(0, end).trim().replace(/\\/g, '/');
    const suffix = src.slice(end);
    if (!rawPath || /^[a-z][a-z0-9+.-]*:/i.test(rawPath) || rawPath.startsWith('//')) {
        return null;
    }

    const filePath = rawPath.split('/').map(decodeSegment).join('/');
    const candidates = filePath.startsWith('/')
        ? [toRepoPath(filePath)]
        : [toRepoPath(markdownDir, filePath), toRepoPath(filePath)];

    const repoPath = candidates.find(candidate => candidate && ctx.fileExists(candidate));
    if (!repoPath) {
        return null;
    }

    return {
        url: buildRawUrl(ctx.account, ctx.repo, ctx.branch, repoPath, suffix),
        repoPath
    };
}

function rewriteImageSrc(src, markdownDir, ctx) {
    const trimmed = String(src || '').trim();
    if (!trimmed) {
        return null;
    }
    return rewriteSameRepoGithubImage(trimmed, ctx) || rewriteRelativeImage(trimmed, markdownDir, ctx);
}

function decodeAttr(value) {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function escapeAttr(value, quote) {
    const escaped = value.replace(/&/g, '&amp;');
    if (quote === "'") {
        return escaped.replace(/'/g, '&#39;');
    }
    return escaped.replace(/"/g, '&quot;');
}

function rewriteImgTag(tag, markdownDir, ctx) {
    let repoPath = null;
    const next = tag.replace(/(^|\s)(src\s*=\s*)(["'])([^"']*)\3/i, (match, lead, attr, quote, src) => {
        const original = decodeAttr(src);
        const replacement = rewriteImageSrc(original, markdownDir, ctx);
        if (!replacement || replacement.url === original) {
            return match;
        }
        repoPath = replacement.repoPath;
        return `${lead}${attr}${quote}${escapeAttr(replacement.url, quote)}${quote}`;
    });
    return { tag: next, repoPath };
}

// git reports the repository root with symlinks resolved; the working directory may not be.
function realPath(p) {
    try {
        return fs.realpathSync(p);
    } catch {
        return p;
    }
}

function defaultFileExists(repoRoot) {
    return repoPath => {
        try {
            return fs.statSync(path.join(repoRoot, repoPath)).isFile();
        } catch {
            return false;
        }
    };
}

/**
 * @param {string} html - Rendered HTML containing <!-- file: ... --> markers
 * @param {Object} spec
 * @param {string} branch
 * @param {Object} [options]
 * @param {string} [options.repoRoot] - Repository root on disk (default: cwd)
 * @param {(repoPath: string) => boolean} [options.fileExists] - Tests a repository-relative path
 * @returns {{ html: string, rewrittenCount: number, rewrittenFiles: string[] }}
 */
function rewriteRenderedImageSources(html, spec, branch, options = {}) {
    const unchanged = { html, rewrittenCount: 0, rewrittenFiles: [] };
    if (!html || !branch || !isGithubSource(spec)) {
        return unchanged;
    }

    const source = spec.source || {};
    if (!source.account || !source.repo) {
        return unchanged;
    }

    const repoRoot = options.repoRoot || process.cwd();
    const ctx = {
        account: source.account,
        repo: source.repo,
        branch,
        fileExists: options.fileExists || defaultFileExists(repoRoot)
    };

    // spec_directory is relative to the working directory, like every other specs.json path.
    const specDir = path.relative(realPath(repoRoot), realPath(path.resolve(spec.spec_directory || '.')))
        .split(path.sep)
        .join('/');
    const markdownPaths = spec.markdown_paths || ['spec.md'];
    const dirOf = file => path.posix.dirname(path.posix.join(specDir, String(file).replace(/\\/g, '/')));

    // The marker for the first file does not always survive rendering.
    let markdownDir = dirOf(markdownPaths[0]);
    let rewrittenCount = 0;
    const rewrittenFiles = new Set();

    const nextHtml = html.replace(MARKER_OR_IMG, token => {
        const marker = FILE_MARKER.exec(token);
        if (marker) {
            markdownDir = dirOf(marker[1]);
            return token;
        }
        const result = rewriteImgTag(token, markdownDir, ctx);
        if (result.repoPath) {
            rewrittenCount += 1;
            rewrittenFiles.add(result.repoPath);
        }
        return result.tag;
    });

    return { html: nextHtml, rewrittenCount, rewrittenFiles: [...rewrittenFiles] };
}

module.exports = {
    rewriteRenderedImageSources
};
