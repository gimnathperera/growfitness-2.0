#!/usr/bin/env bash
# Enable GCP APIs required for Cloud Run deployment.
# Run after: gcloud init (and optionally gcloud config set project PROJECT_ID)
# Requires: Google Cloud SDK installed, project with billing enabled.

set -e

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
if [[ -z "$PROJECT_ID" ]]; then
  echo "Error: Set GCP_PROJECT_ID or run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "Enabling APIs for project: $PROJECT_ID"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  --project="$PROJECT_ID"

echo "Done. APIs enabled for $PROJECT_ID"
