#!/bin/bash

# Ensure we are in the root of the project (simple check for package.json)
if [ ! -f "package.json" ]; then
  echo "Error: This script should be run from the root of the project."
  exit 1
fi

echo "Scanning for node_modules directories to remove..."

# Find and remove node_modules directories recursively
find . -name "node_modules" -type d -prune -exec echo "Removing {}" \; -exec rm -rf '{}' +

echo "Scanning for dist directories to remove..."

# Find and remove dist directories recursively
find . -name "dist" -type d -prune -exec echo "Removing {}" \; -exec rm -rf '{}' +

echo "✅ All node_modules and dist directories have been removed."
