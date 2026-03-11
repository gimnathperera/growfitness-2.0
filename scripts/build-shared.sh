#!/bin/bash

# Ensure we are in the root of the project (simple check for package.json)
if [ ! -f "package.json" ]; then
  echo "Error: This script should be run from the root of the project."
  exit 1
fi

echo "Building shared packages (@grow-fitness/shared-types and @grow-fitness/shared-schemas)..."

# Build shared-types first (schema depends on it)
pnpm --filter @grow-fitness/shared-types run build || exit 1

# Then build shared-schemas
pnpm --filter @grow-fitness/shared-schemas run build || exit 1

echo "✅ Shared packages built successfully."
