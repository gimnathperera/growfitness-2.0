#!/usr/bin/env bash
# Build the NestJS API image with Cloud Build and deploy to Cloud Run.
# Run from repository root. Requires: gcloud CLI, GCP project with billing and APIs enabled.

set -e

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${GCP_REGION:-us-central1}"
REPO="${GCP_AR_REPO:-grow-api}"
IMAGE="${GCP_AR_IMAGE:-api}"
SERVICE_NAME="${SERVICE_NAME:-grow-api}"

if [[ -z "$PROJECT_ID" ]]; then
  echo "Error: Set GCP_PROJECT_ID or run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "Project: $PROJECT_ID  Region: $REGION  Service: $SERVICE_NAME"
echo "Building image and deploying..."

# Create Artifact Registry Docker repo if it doesn't exist
if ! gcloud artifacts repositories describe "$REPO" --location="$REGION" --project="$PROJECT_ID" &>/dev/null; then
  echo "Creating Artifact Registry repository: $REPO in $REGION"
  gcloud artifacts repositories create "$REPO" \
    --repository-format=docker \
    --location="$REGION" \
    --project="$PROJECT_ID" \
    --description="Grow Fitness API container images"
fi

# Build with Cloud Build (pushes to Artifact Registry)
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions="_REGION=$REGION,_REPO=$REPO,_IMAGE=$IMAGE" \
  --project="$PROJECT_ID" \
  .

# Resolve latest image tag
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${IMAGE}:latest"

# Extract all env variables from apps/api/.env for the deployment
# We use a custom delimiter | to handle values with commas (e.g., CORS_ORIGIN)
API_ENV_FILE="apps/api/.env"
ENV_VARS_LIST=""

if [ -f "$API_ENV_FILE" ]; then
  echo "Reading environment variables from $API_ENV_FILE..."
  
  # 1. grep: Remove comments, empty lines, and reserved variables (PORT, K_*)
  # 2. sed: Remove \r (Windows line endings)
  # 3. paste: Join lines with |
  RAW_VARS=$(grep -v '^[[:space:]]*#' "$API_ENV_FILE" | \
             grep -v '^[[:space:]]*$' | \
             grep -v '^PORT=' | \
             grep -v '^K_SERVICE=' | \
             grep -v '^K_REVISION=' | \
             grep -v '^K_CONFIGURATION=' | \
             sed 's/\r//g' | paste -sd '|' -)
  
  if [ -n "$RAW_VARS" ]; then
    # Prefix with ^|^ to tell gcloud to use | as separator instead of ,
    ENV_VARS_LIST="^|^${RAW_VARS}"
  fi
fi

echo "Deploying to Cloud Run..."

# Deploy to Cloud Run
DEPLOY_CMD=(
  gcloud run deploy "$SERVICE_NAME"
  --image="$IMAGE_URI"
  --region="$REGION"
  --platform=managed
  --allow-unauthenticated
  --port=8080
  --min-instances=0
  --max-instances=10
  --memory=512Mi
  --cpu=1
  --no-cpu-throttling
  --project="$PROJECT_ID"
)

if [ -n "$ENV_VARS_LIST" ]; then
  DEPLOY_CMD+=(--set-env-vars="$ENV_VARS_LIST")
fi

"${DEPLOY_CMD[@]}"

SERVICE_URL="$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --project="$PROJECT_ID" --format='value(status.url)')"
echo ""
echo "Deployed. API URL: $SERVICE_URL"
echo "Base API path:     $SERVICE_URL/api"
echo "Swagger docs:      $SERVICE_URL/api/docs"
echo ""
echo "Verifying health endpoint..."
if curl -sf "${SERVICE_URL}/api/health" >/dev/null; then
  echo "Health check OK: ${SERVICE_URL}/api/health"
else
  echo "Health check failed or endpoint not ready yet. If it's a cold start, wait a few seconds."
fi
