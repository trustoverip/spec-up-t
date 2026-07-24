# `static-root/` — deployment root files

Files placed in this directory are automatically copied to your output directory
on every build (render).

## Why this directory exists

Your output directory (configured as `"output_path"` in `specs.json`, typically `./docs/`)
is gitignored and fully rebuilt on every render, so you cannot permanently place
files there directly.

However, some deployment targets require certain files to live at the root
of the served directory, e.g.:

| File | Purpose |
|---|---|
| `CNAME` | GitHub Pages custom domain |
| `robots.txt` | Search-engine crawl rules |
| `_config.yml` | Jekyll configuration (GitHub Pages) |
| `nojekyll` / `.nojekyll` | Disable Jekyll on GitHub Pages |

Place those files here. They will be copied into your output directory after every render
and will therefore always be present when you deploy.

## What gets copied

- Only **top-level files** are copied (sub-directories are ignored).
- `README.md` (this file) is skipped so it does not appear in your output directory.

## Example — GitHub Pages custom domain

Create a file called `CNAME` in this directory with just your domain:

```
my-spec.example.org
```

That's it. The next build will copy it to your output directory root (configured
in `"output_path"` in `specs.json`).
