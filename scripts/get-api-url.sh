#!/usr/bin/env bash
# Print the deployed Grow API Cloud Run service URL (no newline, for scripting).
# Requires: gcloud CLI, GCP project with grow-api deployed.

set -e

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-grow-api}"

if [[ -z "$PROJECT_ID" ]]; then
  echo "Error: Set GCP_PROJECT_ID or run: gcloud config set project YOUR_PROJECT_ID" >&2
  exit 1
fi

gcloud run services describe "$SERVICE_NAME" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format='value(status.url)'
