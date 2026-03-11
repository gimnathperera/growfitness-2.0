# Grow Fitness Platform

Monorepo for **Grow Fitness** – Admin Portal, Client Portal, and API.

## Structure

```
/apps
  /api              # NestJS backend (deployed to GCP Cloud Run)
  /admin-web        # React 19 + Vite admin portal (deployed to Vercel)
  /client-web       # React 19 + Vite client portal (deployed to Vercel)
/packages
  /shared-types     # TypeScript types & enums (dual CJS/ESM)
  /shared-schemas   # Zod validation schemas (dual CJS/ESM)
/scripts
  deploy-api.sh     # One-command API deployment to GCP Cloud Run
  gcp-enable-apis.sh # Enable required GCP APIs
  get-api-url.sh    # Retrieve the live API URL
```

## Tech Stack

- **Backend**: NestJS + MongoDB (Atlas) + Mongoose + TypeScript
- **Frontend**: React 19 + Vite + Shadcn UI + TypeScript + React Router
- **Validation**: Zod (shared schemas)
- **Package Manager**: pnpm workspaces
- **Deployment**: GCP Cloud Run (API) · Vercel (Frontends)

---

## Local Development

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your MongoDB URI, JWT secrets, etc.
```

### 3. Seed admin user

```bash
cd apps/api && pnpm seed
```

### 4. Start dev servers

```bash
# API (port 3001)
cd apps/api && pnpm dev

# Admin Web (port 5173)
cd apps/admin-web && pnpm dev

# Client Web (port 5174)
cd apps/client-web && pnpm dev
```

---

## API Deployment (GCP Cloud Run)

The API is deployed as a Docker container to **Google Cloud Run**.

### Live URLs

| Resource | URL                                                           |
| -------- | ------------------------------------------------------------- |
| API Base | `https://grow-api-69985257687.us-central1.run.app/api`        |
| Swagger  | `https://grow-api-69985257687.us-central1.run.app/api/docs`   |
| Health   | `https://grow-api-69985257687.us-central1.run.app/api/health` |

### Prerequisites

- **Google Cloud SDK (gcloud)**: `brew install google-cloud-sdk` (macOS) or [install guide](https://cloud.google.com/sdk/docs/install)
- **GCP project with billing enabled**
- **APIs enabled**: Cloud Run, Cloud Build, Artifact Registry

```bash
# One-time: enable required APIs
chmod +x scripts/gcp-enable-apis.sh
./scripts/gcp-enable-apis.sh
```

### Deploy

From the **repository root**:

```bash
sh scripts/deploy-api.sh
```

This will:

1. Build the Docker image via Cloud Build
2. Push it to Artifact Registry
3. Read all environment variables from `apps/api/.env`
4. Deploy to Cloud Run with those variables
5. Print the service URL

### Configuration

| Variable         | Default         | Description                                |
| ---------------- | --------------- | ------------------------------------------ |
| `GCP_PROJECT_ID` | `gcloud config` | GCP project ID                             |
| `GCP_REGION`     | `us-central1`   | Region for Artifact Registry and Cloud Run |
| `SERVICE_NAME`   | `grow-api`      | Cloud Run service name                     |

Example with overrides:

```bash
GCP_REGION=europe-west1 sh scripts/deploy-api.sh
```

### Environment Variables

The deploy script automatically reads all variables from `apps/api/.env` and passes them to Cloud Run. It:

- Filters out `PORT` (reserved by Cloud Run)
- Uses a custom delimiter to safely handle commas in values like `CORS_ORIGIN`

Required variables (see `apps/api/.env.example` for full list):

| Variable             | Description                                      |
| -------------------- | ------------------------------------------------ |
| `MONGODB_URI`        | MongoDB Atlas connection string                  |
| `JWT_SECRET`         | JWT signing secret                               |
| `JWT_REFRESH_SECRET` | JWT refresh token secret                         |
| `OPENAI_API_KEY`     | OpenAI API key for support chat                  |
| `CORS_ORIGIN`        | Comma-separated list of allowed frontend origins |

### Retrieve the API URL

```bash
sh scripts/get-api-url.sh
# or
gcloud run services describe grow-api --region=us-central1 --format='value(status.url)'
```

### CI/CD (GitHub Actions)

A GitHub Actions workflow (`.github/workflows/deploy-api-cloudrun.yml`) deploys the API on pushes to `main`.

**Required GitHub Secrets:**

- `GCP_PROJECT_ID` – your GCP project ID
- `GCP_SA_KEY` – JSON key of a service account with:
  - Cloud Build Editor
  - Cloud Run Admin
  - Service Account User

---

## Frontend Deployment (Vercel)

Both `admin-web` and `client-web` are deployed to Vercel.

| App        | URL                                     |
| ---------- | --------------------------------------- |
| Admin Web  | `https://admin-growfitness.vercel.app`  |
| Client Web | `https://client-growfitness.vercel.app` |

---

## Support Chat

The client app includes a floating support chat widget powered by OpenAI.

- **Env**: Set `OPENAI_API_KEY` in `apps/api/.env`
- **Knowledge**: Edit files in `apps/api/src/knowledge/` (`business.json`, `procedures.md`, `faq.md`, `payments.md`). Restart the API to reload.

---

## API Endpoints

All endpoints are prefixed with `/api`. Full Swagger documentation is available at `/api/docs`.

Key endpoints:

- `POST /api/auth/login` – Login
- `POST /api/auth/refresh` – Refresh token
- `GET /api/users/parents` – List parents
- `GET /api/users/coaches` – List coaches
- `GET /api/dashboard/stats` – Dashboard stats
- `GET /api/sessions/free` – List free sessions (public)
- `GET /api/health` – Health check
