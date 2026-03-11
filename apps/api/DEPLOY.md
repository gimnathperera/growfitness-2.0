# Deploy NestJS API to Google Cloud Run

## Prerequisites

- **Google Cloud SDK (gcloud)**  
  Install: https://cloud.google.com/sdk/docs/install  
  Or: `brew install google-cloud-sdk` (macOS)

- **Docker** (optional; only if you want to build the image locally before push)

## 1. GCP project and billing

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `grow-fitness-api`) or select an existing one.
3. **Enable billing** for the project (Cloud Run requires a billing account).
4. Note your **Project ID** (e.g. `grow-fitness-api`).

## 2. Install and initialize gcloud

```bash
# Log in and pick project
gcloud init

# Or set project explicitly
gcloud config set project YOUR_PROJECT_ID
```

## 3. Enable required APIs

From the **repository root**:

```bash
export GCP_PROJECT_ID=YOUR_PROJECT_ID   # optional if already set via gcloud config
chmod +x scripts/gcp-enable-apis.sh
./scripts/gcp-enable-apis.sh
```

This enables: Cloud Run, Cloud Build, Artifact Registry.

## 4. Deploy the API

From the **repository root**:

```bash
chmod +x scripts/deploy-api.sh
./scripts/deploy-api.sh
```

The script will:

- Create an Artifact Registry Docker repo in the chosen region (if it does not exist).
- Build the API image with Cloud Build (using `apps/api/Dockerfile` and monorepo root as context).
- Deploy the image to Cloud Run and print the service URL.

Optional environment variables for the script:

- `GCP_PROJECT_ID` – GCP project (default: `gcloud config get-value project`).
- `GCP_REGION` – Region for Artifact Registry and Cloud Run (default: `us-central1`).
- `SERVICE_NAME` – Cloud Run service name (default: `grow-api`).

Example:

```bash
GCP_REGION=europe-west1 ./scripts/deploy-api.sh
```

## 5. Configure environment variables on Cloud Run

After the first deploy, set your app’s environment variables (e.g. MongoDB, JWT, CORS):

```bash
gcloud run services update grow-api \
  --region=us-central1 \
  --set-env-vars="MONGODB_URI=...,JWT_SECRET=...,CORS_ORIGIN=https://your-frontend.com"
```

For many variables or secrets, use a env file or [Secret Manager](https://cloud.google.com/run/docs/configuring/secrets).

Required for a minimal run:

- `MONGODB_URI`
- `JWT_SECRET` (and optionally `JWT_REFRESH_SECRET`)

See `apps/api/.env.example` for the full list. Cloud Run sets `PORT` automatically; the app already reads it.

### Optional: CI/CD (GitHub Actions)

A workflow in `.github/workflows/deploy-api-cloudrun.yml` builds and deploys the API to Cloud Run on every push to `main` that touches the API or its dependencies.

**Setup:** Add these GitHub repository secrets:

- `GCP_PROJECT_ID` – your GCP project ID  
- `GCP_SA_KEY` – JSON key of a service account that has:
  - **Cloud Build Editor** (to run builds)
  - **Cloud Run Admin** (to deploy)
  - **Service Account User** (so Cloud Build can deploy as the runtime SA)

Create the key in GCP: IAM & Admin → Service Accounts → Create key (JSON) for a account used by GitHub Actions.

## 6. Get the API URL

After deployment, the script prints the service URL. To fetch it again:

```bash
./scripts/get-api-url.sh
# or
gcloud run services describe grow-api --region=us-central1 --format='value(status.url)'
```

Use this base URL in your clients (e.g. `https://grow-api-xxxxx-uc.a.run.app/api`).  
Swagger: `https://YOUR_SERVICE_URL/api/docs`.
