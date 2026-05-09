#!/usr/bin/env bash
# Create a public-read GCS bucket and CORS rules for browser PUT uploads (signed URLs).
# Prerequisites: gcloud (Google Cloud SDK), billing on project.
#
# Usage:
#   export GCP_PROJECT_ID=your-project
#   export GCS_BUCKET_NAME=grow-fitness-uploads   # optional override
#   export GCS_BUCKET_LOCATION=us-central1        # optional
#   export GCS_CORS_ORIGINS="https://admin.example.com,https://client.example.com,http://localhost:5173"
#   bash scripts/gcs-uploads-setup.sh
#
# Use GCS_CORS_ORIGINS=* for a single origin entry "*" (dev only).
#
# After this, grant your Cloud Run *runtime* service account:
#   Storage Object Admin on bucket gs://BUCKET (or narrower: create objects + sign)
# For v4 signed URLs on Cloud Run, the runtime SA typically needs
# roles/iam.serviceAccountTokenCreator on itself — see Google Cloud signed URL docs.

set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
if [[ -z "$PROJECT_ID" ]]; then
  echo "Error: Set GCP_PROJECT_ID or run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

BUCKET_NAME="${GCS_BUCKET_NAME:-grow-fitness-uploads}"
LOCATION="${GCS_BUCKET_LOCATION:-us-central1}"
ORIGINS="${GCS_CORS_ORIGINS:-*}"

echo "Project: $PROJECT_ID"
echo "Bucket:  $BUCKET_NAME (location: $LOCATION)"

gcloud services enable storage.googleapis.com --project="$PROJECT_ID"

if ! gcloud storage buckets describe "gs://$BUCKET_NAME" --project="$PROJECT_ID" &>/dev/null; then
  echo "Creating bucket gs://$BUCKET_NAME ..."
  gcloud storage buckets create "gs://$BUCKET_NAME" \
    --project="$PROJECT_ID" \
    --location="$LOCATION" \
    --uniform-bucket-level-access
else
  echo "Bucket gs://$BUCKET_NAME already exists."
fi

CORS_FILE="$(mktemp)"
trap 'rm -f "$CORS_FILE"' EXIT

if [[ "$ORIGINS" == "*" ]]; then
  printf '%s\n' '[{"origin":["*"],"method":["PUT","GET","HEAD","OPTIONS"],"responseHeader":["Content-Type","Content-Length"],"maxAgeSeconds":3600}]' >"$CORS_FILE"
else
  JSON_ORIGINS=""
  IFS=',' read -ra PARTS <<< "$ORIGINS"
  for p in "${PARTS[@]}"; do
    p="${p#"${p%%[![:space:]]*}"}"
    p="${p%"${p##*[![:space:]]}"}"
    [[ -z "$p" ]] && continue
    if [[ -n "$JSON_ORIGINS" ]]; then
      JSON_ORIGINS+=","
    fi
    JSON_ORIGINS+="\"$p\""
  done
  printf '[{"origin":[%s],"method":["PUT","GET","HEAD","OPTIONS"],"responseHeader":["Content-Type","Content-Length"],"maxAgeSeconds":3600}]\n' "$JSON_ORIGINS" >"$CORS_FILE"
fi

echo "Setting CORS from GCS_CORS_ORIGINS=$ORIGINS ..."
gcloud storage buckets update "gs://$BUCKET_NAME" --cors-file="$CORS_FILE" --project="$PROJECT_ID"

echo "Granting public read (allUsers:objectViewer) for public object URLs."
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET_NAME" \
  --member="allUsers" \
  --role="roles/storage.objectViewer" \
  --project="$PROJECT_ID"

echo "Done. Set in apps/api/.env:"
echo "  GCS_BUCKET_NAME=$BUCKET_NAME"
echo "  GCP_PROJECT_ID=$PROJECT_ID"
echo "Optional:"
echo "  GCS_PUBLIC_BASE_URL=https://storage.googleapis.com/${BUCKET_NAME}"
