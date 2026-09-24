/**
 * Rewrites spec image sources so the published URL uses the branch that
 * produced this build.
 *
 * Authors can write a repository path:
 *   ![Diagram](images/diagram.png)
 * or a same-repo raw/blob URL whose branch segment is stale. Both become
 * https://raw.githubusercontent.com/<account>/<repo>/<branch>/images/diagram.png
 *
 * Images on another host, in another repository, or pinned to a commit SHA
 * are left unchanged.
 */

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
 * Splits the path segments that follow owner/repo (and an optional raw|blob)
 * into a git ref and a repository file path.
 * refs/heads/<branch>/... keeps a branch that itself contains slashes when
 * the file lives under images/. Otherwise the first segment is the ref.
 *
 * @param {string[]} segments
 * @returns {{ ref: string, path: string }|null}
 */
function splitRefAndPath(segments) {
    if (!segments || segments.length < 2) {
        return null;
    }

    const decoded = segments.map(decodeSegment);

    if (decoded[0] === 'refs' && (decoded[1] === 'heads' || decoded[1] === 'tags')) {
        const rest = decoded.slice(2);
        if (rest.length < 2) {
            return null;
        }
        const joined = rest.join('/');
        // Match an images/ path segment, not a branch name that merely contains those letters.
        const imagesMatch = /(^|\/)images\//.exec(joined);
        if (imagesMatch && imagesMatch.index > 0) {
            const pathStart = imagesMatch[1] === '/' ? imagesMatch.index + 1 : imagesMatch.index;
            return {
                ref: `refs/${decoded[1]}/${joined.slice(0, pathStart - 1)}`,
                path: joined.slice(pathStart)
            };
        }
        return {
            ref: `refs/${decoded[1]}/${rest[0]}`,
            path: rest.slice(1).join('/')
        };
    }

    return {
        ref: decoded[0],
        path: decoded.slice(1).join('/')
    };
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
 * @returns {string|null} replacement URL, or null when the source should stay
 */
function rewriteSameRepoGithubImage(src, account, repo, branch) {
    let url;
    try {
        url = new URL(src);
    } catch {
        return null;
    }

    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
    let refAndPath;
    let dropRawParam = false;

    if (host === 'raw.githubusercontent.com') {
        if (parts.length < 4 || !sameAccountRepo(parts[0], parts[1], account, repo)) {
            return null;
        }
        refAndPath = splitRefAndPath(parts.slice(2));
    } else if (host === 'github.com') {
        if (parts.length < 5 || !sameAccountRepo(parts[0], parts[1], account, repo)) {
            return null;
        }
        const kind = parts[2].toLowerCase();
        if (kind !== 'raw' && kind !== 'blob') {
            return null;
        }
        dropRawParam = kind === 'blob';
        refAndPath = splitRefAndPath(parts.slice(3));
    } else {
        return null;
    }

    if (!refAndPath || !refAndPath.path || isCommitPin(refAndPath.ref)) {
        return null;
    }

    return buildRawUrl(account, repo, branch, refAndPath.path, suffixFromUrl(url, dropRawParam));
}

/**
 * Repository-relative image paths are those that land in images/ after
 * removing ./, ../, and a leading slash. Other relative files are left
 * for the published site to serve.
 *
 * @returns {{ path: string, suffix: string }|null}
 */
function toRepoImagePath(src) {
    const queryAt = src.indexOf('?');
    const hashAt = src.indexOf('#');
    let end = src.length;
    if (queryAt >= 0) {
        end = Math.min(end, queryAt);
    }
    if (hashAt >= 0) {
        end = Math.min(end, hashAt);
    }

    let path = src.slice(0, end).trim().replace(/\\/g, '/');
    const suffix = src.slice(end);
    if (!path || /^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//')) {
        return null;
    }

    while (path.startsWith('./')) {
        path = path.slice(2);
    }
    path = path.replace(/^\/+/, '');

    const segments = [];
    for (const segment of path.split('/')) {
        if (!segment || segment === '.') {
            continue;
        }
        if (segment === '..') {
            if (segments.length === 0 || segments[segments.length - 1] === '..') {
                segments.push('..');
            } else {
                segments.pop();
            }
            continue;
        }
        segments.push(decodeSegment(segment));
    }

    while (segments[0] === '..') {
        segments.shift();
    }

    const normalized = segments.join('/');
    if (!normalized.startsWith('images/')) {
        return null;
    }

    return { path: normalized, suffix };
}

function rewriteImageSrc(src, account, repo, branch) {
    const trimmed = String(src || '').trim();
    if (!trimmed) {
        return null;
    }

    const sameRepo = rewriteSameRepoGithubImage(trimmed, account, repo, branch);
    if (sameRepo) {
        return sameRepo;
    }

    const relative = toRepoImagePath(trimmed);
    if (!relative) {
        return null;
    }

    return buildRawUrl(account, repo, branch, relative.path, relative.suffix);
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

function rewriteImgTag(tag, account, repo, branch) {
    let rewritten = false;
    const next = tag.replace(/(^|\s)(src\s*=\s*)(["'])([^"']*)\3/i, (match, lead, attr, quote, src) => {
        const replacement = rewriteImageSrc(decodeAttr(src), account, repo, branch);
        if (!replacement || replacement === decodeAttr(src)) {
            return match;
        }
        rewritten = true;
        return `${lead}${attr}${quote}${escapeAttr(replacement, quote)}${quote}`;
    });
    return { tag: next, rewritten };
}

/**
 * @param {string} html
 * @param {Object} spec
 * @param {string} branch
 * @returns {{ html: string, rewrittenCount: number }}
 */
function rewriteRenderedImageSources(html, spec, branch) {
    if (!html || !branch || !isGithubSource(spec)) {
        return { html, rewrittenCount: 0 };
    }

    const source = spec.source || {};
    const account = source.account;
    const repo = source.repo;
    if (!account || !repo) {
        return { html, rewrittenCount: 0 };
    }

    let rewrittenCount = 0;
    const nextHtml = html.replace(/<img\b[^>]*>/gi, tag => {
        const result = rewriteImgTag(tag, account, repo, branch);
        if (result.rewritten) {
            rewrittenCount += 1;
        }
        return result.tag;
    });

    return { html: nextHtml, rewrittenCount };
}

module.exports = {
    rewriteRenderedImageSources
};
