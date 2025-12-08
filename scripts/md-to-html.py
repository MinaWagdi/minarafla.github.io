#!/usr/bin/env python3
"""
Markdown to HTML Converter
Converts a Markdown file to HTML and inserts it into the article template

Usage: python3 scripts/md-to-html.py blog/article-name/article.md
"""

import os
import re
import sys
from pathlib import Path


def convert_markdown_to_html(md_file):
    """Convert Markdown to HTML using available tools"""
    
    # Try pandoc first (most reliable)
    import subprocess
    try:
        result = subprocess.run(
            ['pandoc', md_file, '-f', 'markdown+raw_html', '-t', 'html', '--wrap=none'],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    # Fallback: Simple Markdown parser (basic support)
    try:
        import markdown
        with open(md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()
        # Use 'extra' extension which includes raw HTML support
        html_content = markdown.markdown(md_content, extensions=['extra', 'fenced_code', 'tables'])
        return html_content
    except ImportError:
        print("Error: Neither pandoc nor python-markdown is installed.")
        print("\nInstall one of these:")
        print("  - pandoc: sudo apt install pandoc (Linux) or brew install pandoc (Mac)")
        print("  - python-markdown: pip install markdown")
        sys.exit(1)

def update_article_html(md_file, html_content):
    """Update the article HTML file with converted content"""
    
    article_dir = Path(md_file).parent
    output_file = article_dir / "index.html"
    template_file = Path("blog/article-template.html")
    
    if not template_file.exists():
        print(f"Error: Template not found: {template_file}")
        sys.exit(1)
    
    # Read template
    with open(template_file, 'r', encoding='utf-8') as f:
        template = f.read()
    
    # Find and replace article content
    # Look for the article-content div
    pattern = r'(<div class="article-content">)(.*?)(</div>)'
    
    # Replace content between the div tags
    replacement = r'\1\n' + html_content + r'\n                \3'
    updated_template = re.sub(pattern, replacement, template, flags=re.DOTALL)
    
    # Write to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(updated_template)
    
    return output_file

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/md-to-html.py blog/article-name/article.md")
        sys.exit(1)
    
    md_file = sys.argv[1]
    
    if not os.path.exists(md_file):
        print(f"Error: File not found: {md_file}")
        sys.exit(1)
    
    print(f"Converting: {md_file}")
    
    # Convert Markdown to HTML
    html_content = convert_markdown_to_html(md_file)
    
    # Update article HTML
    output_file = update_article_html(md_file, html_content)
    
    print(f"✓ Success! Updated: {output_file}")
    print("\nNext steps:")
    print("  1. Update the title in the HTML file")
    print("  2. Update the date in the HTML file")
    print("  3. Update meta description if needed")
    print("  4. Add the article to blog-data.js")

if __name__ == "__main__":
    main()

