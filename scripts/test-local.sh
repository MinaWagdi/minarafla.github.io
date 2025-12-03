#!/bin/bash
# Local testing script for GitHub Pages site
# This script starts a local web server to test your site before pushing to GitHub

PORT=8000

echo "Starting local web server on http://localhost:$PORT"
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")/.."

# Try Python 3 first, then Python 2
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer $PORT
else
    echo "Error: Python not found. Please install Python to use this script."
    exit 1
fi

