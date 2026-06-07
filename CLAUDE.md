# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website and blog hosted on GitHub Pages. No build system — pure HTML, CSS, and vanilla JS. Deploy by pushing to the `main` branch.

## Common Commands

**Local testing** (required before pushing):
```bash
./scripts/test-local.sh          # starts Python HTTP server at http://localhost:8000
```

**Publish a new blog article from Markdown** (requires `pandoc` or `pip install markdown`):
```bash
python3 scripts/publish.py blog/article-name/article.md --excerpt "Short blurb" --thumbnail
python3 scripts/publish.py blog/article-name/article.md --push   # also git-commits and pushes
```

**Deploy**:
```bash
git add . && git commit -m "message" && git push
```

## Architecture

### Data-Driven Content

All editable content lives in two data files — no HTML editing needed for content updates:

- **[data/cv-data.js](data/cv-data.js)** — `personalInfo`, `workExperience`, `education`, `publications`, `highlights` arrays. Rendered by `script.js` into `index.html` placeholders.
- **[data/blog-data.js](data/blog-data.js)** — `blogArticles` array. Each entry has `folder`, `title`, `excerpt`, `date` (YYYY-MM-DD), `hasThumbnail`. Rendered into `blog.html` and the homepage preview.
- **[data/tils-data.js](data/tils-data.js)** — `tilPosts` array of short "Today I Learned" posts. Each entry is inline (`date`, `title`, HTML `content`, optional `image`) — TILs have no page each. Rendered onto `tils.html` and previewed (latest 3) on the homepage. See [markdown/TILS_GUIDE.md](markdown/TILS_GUIDE.md).

### Reusable Components

Header and footer are **not** duplicated across pages. Each page has `<div id="header-placeholder">` and `<div id="footer-placeholder">`, which `script.js` fills via `fetch()` at runtime from:
- [components/header.html](components/header.html)
- [components/footer.html](components/footer.html)

`getBasePath()` in `script.js` computes the correct relative path (`./` vs `../../`) depending on whether the current page is at root or nested inside `blog/article-name/`.

### Blog Articles

Each article lives in its own folder: `blog/article-name/index.html`. Use [blog/article-template.html](blog/article-template.html) as the base. The `publish.py` script automates conversion from Markdown, fills the template, and registers the article in `blog-data.js`.

### Styling

All theming uses CSS variables defined in the `:root` block of [styles.css](styles.css). Dark mode is toggled via `data-theme` attribute on `<html>`, persisted in `localStorage`.

## Cursor Rules

- After any modification, add or update the relevant markdown file(s) in [markdown/](markdown/) to reflect the current code state.
- Keep code DRY — no repeated HTML/CSS/JS across pages.
