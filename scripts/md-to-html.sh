#!/bin/bash

# Markdown to HTML Converter Script
# Converts a Markdown file to HTML and inserts it into the article template
#
# Usage: ./scripts/md-to-html.sh blog/article-name/article.md

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if file argument is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No Markdown file provided${NC}"
    echo "Usage: ./scripts/md-to-html.sh blog/article-name/article.md"
    exit 1
fi

MD_FILE="$1"

# Check if file exists
if [ ! -f "$MD_FILE" ]; then
    echo -e "${RED}Error: File not found: $MD_FILE${NC}"
    exit 1
fi

# Get directory and filename
ARTICLE_DIR=$(dirname "$MD_FILE")
ARTICLE_NAME=$(basename "$ARTICLE_DIR")
TEMPLATE_FILE="blog/article-template.html"
OUTPUT_FILE="$ARTICLE_DIR/index.html"

# Check if template exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}Error: Template not found: $TEMPLATE_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}Converting Markdown to HTML...${NC}"
echo "  Input:  $MD_FILE"
echo "  Output: $OUTPUT_FILE"

# Check if pandoc is installed
if command -v pandoc &> /dev/null; then
    echo -e "${GREEN}Using pandoc for conversion${NC}"
    
    # Convert Markdown to HTML (body only, no full document)
    HTML_CONTENT=$(pandoc "$MD_FILE" -f markdown -t html --wrap=none)
    
    # Escape special characters for sed
    HTML_CONTENT_ESCAPED=$(echo "$HTML_CONTENT" | sed 's/[[\.*^$()+?{|]/\\&/g')
    
    # Replace content in template
    # Find the article-content div and replace its content
    sed -i "/<div class=\"article-content\">/,/<\/div>/{
        /<div class=\"article-content\">/!{
            /<\/div>/!d
        }
    }" "$TEMPLATE_FILE"
    
    # Insert new content
    sed -i "/<div class=\"article-content\">/a\\
$HTML_CONTENT" "$TEMPLATE_FILE"
    
    # Copy template to output
    cp "$TEMPLATE_FILE" "$OUTPUT_FILE"
    
    echo -e "${GREEN}✓ Conversion complete!${NC}"
    echo -e "${YELLOW}Note: You still need to:${NC}"
    echo "  1. Update the title in $OUTPUT_FILE"
    echo "  2. Update the date in $OUTPUT_FILE"
    echo "  3. Update meta description if needed"
    
else
    echo -e "${YELLOW}Warning: pandoc not found${NC}"
    echo ""
    echo "Install pandoc to use this script:"
    echo "  Ubuntu/Debian: sudo apt install pandoc"
    echo "  macOS:         brew install pandoc"
    echo ""
    echo "Or use one of these alternatives:"
    echo "  1. VS Code with 'Markdown Preview Enhanced' extension"
    echo "  2. Online converter: https://stackedit.io/"
    echo "  3. Manual conversion (see BLOG_WRITING_GUIDE.md)"
    exit 1
fi

