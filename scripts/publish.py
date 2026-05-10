#!/usr/bin/env python3
"""
Blog Article Publisher

Converts a Markdown article to HTML, fills the blog template, updates
blog-data.js, and optionally commits + pushes to GitHub Pages.

Usage (from the repo root):
    python3 scripts/publish.py blog/article-name/article.md [OPTIONS]

Options:
    --title "My Title"      Override title (auto-extracted from first # heading)
    --date  2025-05-10      Publication date (default: today)
    --excerpt "Short blurb" Blog-listing excerpt
    --thumbnail             Mark hasThumbnail: true in blog-data.js
    --push                  Run git add / commit / push after publishing

Metadata can also be provided as YAML front-matter at the top of the
Markdown file:

    ---
    title: "My Title"
    date: 2025-05-10
    excerpt: "Short blurb."
    thumbnail: false
    ---
"""

import argparse
import html
import json
import os
import re
import subprocess
import sys
from datetime import date, datetime
from pathlib import Path


# ---------------------------------------------------------------------------
# Markdown parsing helpers
# ---------------------------------------------------------------------------

def parse_frontmatter(text):
    """Return (metadata_dict, body_text). metadata is {} if no front-matter."""
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    fm_block = text[3:end].strip()
    body = text[end + 4:].lstrip("\n")
    meta = {}
    for line in fm_block.splitlines():
        if ":" in line:
            key, _, val = line.partition(":")
            meta[key.strip()] = val.strip().strip('"').strip("'")
    return meta, body


def extract_title_from_body(body):
    """Return first # heading text, or None."""
    for line in body.splitlines():
        m = re.match(r"^#{1,2}\s+(.+)", line)
        if m:
            return m.group(1).strip()
    return None


# ---------------------------------------------------------------------------
# Markdown → HTML conversion
# ---------------------------------------------------------------------------

def md_to_html(md_text, md_file_path):
    """Convert Markdown text to HTML fragment. Writes a temp file for pandoc."""
    tmp = Path(md_file_path).with_suffix(".tmp.md")
    tmp.write_text(md_text, encoding="utf-8")
    try:
        result = subprocess.run(
            ["pandoc", str(tmp), "-f", "markdown+raw_html", "-t", "html", "--wrap=none"],
            capture_output=True, text=True, check=True,
        )
        return result.stdout
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    finally:
        try:
            tmp.unlink()
        except FileNotFoundError:
            pass

    try:
        import markdown as mdlib
        return mdlib.markdown(md_text, extensions=["extra", "fenced_code", "tables"])
    except ImportError:
        sys.exit(
            "Error: install pandoc (sudo apt install pandoc) "
            "or python-markdown (pip install markdown)"
        )


# ---------------------------------------------------------------------------
# HTML template filling
# ---------------------------------------------------------------------------

MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


def format_display_date(iso_date):
    """'2025-05-10' → 'May 10, 2025'"""
    d = datetime.strptime(iso_date, "%Y-%m-%d")
    return f"{MONTH_NAMES[d.month]} {d.day}, {d.year}"


def build_index_html(template_path, title, iso_date, html_content, excerpt="", folder=""):
    template = Path(template_path).read_text(encoding="utf-8")

    display_date = format_display_date(iso_date)

    safe_title   = html.escape(title)
    safe_excerpt = html.escape(excerpt) if excerpt else safe_title
    og_url = f"https://minarafla.github.io/blog/{folder}/" if folder else "https://minarafla.github.io/"

    # <title> and <meta description>
    template = re.sub(
        r'<meta name="description" content="[^"]*">',
        f'<meta name="description" content="{safe_title} - Mina Rafla\'s Blog">',
        template,
    )

    # Open Graph tags
    template = re.sub(r'<meta property="og:title" content="[^"]*">',
                      f'<meta property="og:title" content="{safe_title}">', template)
    template = re.sub(r'<meta property="og:description" content="[^"]*">',
                      f'<meta property="og:description" content="{safe_excerpt}">', template)
    template = re.sub(r'<meta property="og:url" content="[^"]*">',
                      f'<meta property="og:url" content="{og_url}">', template)
    template = re.sub(
        r"<title>[^<]*</title>",
        f"<title>{safe_title} - Mina Rafla</title>",
        template,
    )

    # Article header h1
    template = re.sub(
        r'<h1 class="article-title">[^<]*</h1>',
        f'<h1 class="article-title">{safe_title}</h1>',
        template,
    )

    # <time> tag
    template = re.sub(
        r'<time datetime="[^"]*">[^<]*</time>',
        f'<time datetime="{iso_date}">{display_date}</time>',
        template,
    )

    # Remove the optional article-image-container block
    template = re.sub(
        r"\s*<!-- Optional: Article Image -->.*?</div>",
        "",
        template,
        flags=re.DOTALL,
    )

    # Replace content inside <div class="article-content">...</div>
    start_marker = '<div class="article-content">'
    end_marker = "</div>"
    start_idx = template.find(start_marker)
    if start_idx == -1:
        sys.exit("Error: could not find article-content div in template")
    content_start = start_idx + len(start_marker)
    end_idx = template.find(end_marker, content_start)
    if end_idx == -1:
        sys.exit("Error: could not find closing </div> in template")

    template = (
        template[:content_start]
        + "\n"
        + html_content
        + "\n                "
        + template[end_idx:]
    )
    return template


# ---------------------------------------------------------------------------
# blog-data.js update
# ---------------------------------------------------------------------------

def update_blog_data(blog_data_path, folder, title, excerpt, iso_date, has_thumbnail):
    content = Path(blog_data_path).read_text(encoding="utf-8")

    # Skip if this folder is already registered
    if f"folder: '{folder}'" in content or f'folder: "{folder}"' in content:
        print(f"  blog-data.js: entry for '{folder}' already exists, skipping.")
        return

    entry = (
        f"    {{\n"
        f"        folder: '{folder}',\n"
        f"        title: {json.dumps(title)},\n"
        f"        excerpt: {json.dumps(excerpt)},\n"
        f"        date: '{iso_date}',\n"
        f"        hasThumbnail: {'true' if has_thumbnail else 'false'}\n"
        f"    }},\n"
    )

    # Insert at the top of the blogArticles array
    insert_pos = content.find("[")
    if insert_pos == -1:
        sys.exit("Error: could not find array start in blog-data.js")
    insert_pos += 1  # after the [
    # Skip past the newline
    while insert_pos < len(content) and content[insert_pos] in " \t\n":
        insert_pos += 1

    updated = content[:insert_pos] + entry + content[insert_pos:]
    Path(blog_data_path).write_text(updated, encoding="utf-8")
    print(f"  blog-data.js: added entry for '{folder}'")


# ---------------------------------------------------------------------------
# Git helpers
# ---------------------------------------------------------------------------

def git_push(repo_root, article_dir, title):
    cmds = [
        ["git", "-C", repo_root, "add", str(article_dir), "data/blog-data.js"],
        ["git", "-C", repo_root, "commit", "-m", f"Add blog article: {title}"],
        ["git", "-C", repo_root, "push"],
    ]
    for cmd in cmds:
        print(f"  $ {' '.join(cmd[2:])}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(result.stderr)
            sys.exit(f"git command failed: {cmd}")
        if result.stdout.strip():
            print(result.stdout.strip())


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Publish a blog article from Markdown")
    parser.add_argument("md_file", help="Path to the Markdown file, e.g. blog/my-article/article.md")
    parser.add_argument("--title",     help="Article title")
    parser.add_argument("--date",      help="Publication date (YYYY-MM-DD), default: today")
    parser.add_argument("--excerpt",   default="", help="Short excerpt for blog listing")
    parser.add_argument("--thumbnail", action="store_true", help="Set hasThumbnail: true")
    parser.add_argument("--push",      action="store_true", help="Git add, commit, and push")
    args = parser.parse_args()

    md_path = Path(args.md_file)
    if not md_path.exists():
        sys.exit(f"Error: file not found: {md_path}")

    # Resolve repo root (script lives in scripts/, so two levels up from here)
    repo_root = Path(__file__).parent.parent

    # --- Parse markdown ---
    raw = md_path.read_text(encoding="utf-8")
    fm, body = parse_frontmatter(raw)

    # Metadata priority: CLI args > front-matter > auto-extract
    title   = args.title   or fm.get("title")   or extract_title_from_body(body) or "Untitled"
    iso_date = args.date   or fm.get("date")    or str(date.today())
    excerpt  = args.excerpt or fm.get("excerpt") or ""
    has_thumbnail = args.thumbnail or fm.get("thumbnail", "false").lower() == "true"

    # Validate date format
    try:
        datetime.strptime(iso_date, "%Y-%m-%d")
    except ValueError:
        sys.exit(f"Error: invalid date format '{iso_date}', expected YYYY-MM-DD")

    article_dir = md_path.parent
    folder = article_dir.name
    output_file = article_dir / "index.html"
    template_file = repo_root / "blog" / "article-template.html"
    blog_data_file = repo_root / "data" / "blog-data.js"

    for f in [template_file, blog_data_file]:
        if not f.exists():
            sys.exit(f"Error: required file not found: {f}")

    if has_thumbnail:
        has_thumb_file = any(
            (article_dir / f"thumbnail.{ext}").exists()
            for ext in ["jpg", "jpeg", "png"]
        )
        if not has_thumb_file:
            print(f"Warning: --thumbnail set but no thumbnail image found in {article_dir}/")

    print(f"Publishing: {md_path}")
    print(f"  Title   : {title}")
    print(f"  Date    : {iso_date}")
    print(f"  Folder  : {folder}")

    # 1. Convert markdown body to HTML
    html_content = md_to_html(body, md_path)

    # 2. Build index.html
    index_html = build_index_html(template_file, title, iso_date, html_content, excerpt=excerpt, folder=folder)
    output_file.write_text(index_html, encoding="utf-8")
    print(f"  Written : {output_file}")

    # 3. Update blog-data.js
    update_blog_data(blog_data_file, folder, title, excerpt, iso_date, has_thumbnail)

    # 4. Optionally push
    if args.push:
        print("Pushing to GitHub...")
        git_push(str(repo_root), str(article_dir.relative_to(repo_root)), title)
        print("Done! Article is live.")
    else:
        print("\nNext steps:")
        print("  1. Test locally : ./scripts/test-local.sh")
        print("  2. Publish      : git add . && git commit -m 'Add article' && git push")
        print(f"\n  Or re-run with --push to do it automatically.")


if __name__ == "__main__":
    main()
