# minarafla.github.io

Personal website and blog of Mina Rafla, hosted on GitHub Pages. Pure HTML, CSS, and
vanilla JavaScript — no build step. Content is data-driven: edit the data files and the
pages regenerate themselves.

## Run locally

```bash
./scripts/test-local.sh      # serves the site at http://localhost:8000
```

## Edit content

- **CV / homepage** — edit [`data/cv-data.js`](data/cv-data.js). See [`markdown/CV_MANAGEMENT.md`](markdown/CV_MANAGEMENT.md).
- **Blog** — add an article with `python3 scripts/publish.py blog/<name>/article.md --excerpt "..." --thumbnail`. See [`markdown/BLOG_GUIDE.md`](markdown/BLOG_GUIDE.md).
- **TILs** ("Today I Learned") — short daily posts, all inline in [`data/tils-data.js`](data/tils-data.js) and shown on `tils.html`. See [`markdown/TILS_GUIDE.md`](markdown/TILS_GUIDE.md).

## Deploy

Push to the `main` branch — GitHub Pages serves it automatically.

## More

- [`CLAUDE.md`](CLAUDE.md) — concise project overview and commands.
- [`markdown/ARCHITECTURE.md`](markdown/ARCHITECTURE.md) — full architecture reference.
