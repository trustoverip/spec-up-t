# `static-root/` — deployment root files

Files placed in this directory are automatically copied to the `docs/` root
on every build (render).

## Why this directory exists

`docs/` is the build output directory and is **gitignored**. It is fully
rebuilt on every render, so you cannot permanently place files there.

However, some deployment targets require certain files to live at the root
of the served directory, e.g.:

| File | Purpose |
|---|---|
| `CNAME` | GitHub Pages custom domain |
| `robots.txt` | Search-engine crawl rules |
| `_config.yml` | Jekyll configuration (GitHub Pages) |
| `nojekyll` / `.nojekyll` | Disable Jekyll on GitHub Pages |

Place those files here. They will be copied into `docs/` after every render
and will therefore always be present when you deploy.

## What gets copied

- Only **top-level files** are copied (sub-directories are ignored).
- `README.md` (this file) is skipped so it does not appear in `docs/`.

## Example — GitHub Pages custom domain

Create a file called `CNAME` in this directory with just your domain:

```
my-spec.example.org
```

That's it. The next build will copy it to `docs/CNAME`.
