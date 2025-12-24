# AWS Deployment (API + Admin Web)

Containerized setup for running the NestJS API and Vite admin frontend on an AWS host you can SSH into (e.g., EC2). The stack uses Docker Compose plus Nginx to serve the SPA and reverse-proxy `/api` to the backend.

## Prerequisites
- An EC2 (or similar) instance with Docker Engine + Docker Compose plugin installed.
- MongoDB connection string (Atlas recommended).
- Domain/DNS pointed at the server (optional but recommended); open ports 80 (HTTP) and 3000 (API) or place behind a load balancer.
- Ability to SSH and run `docker compose` as a user with permission to manage containers.

## Files added
- `apps/api/Dockerfile` – builds the Nest API image.
- `apps/admin-web/Dockerfile` – builds the admin web static bundle and serves it via Nginx.
- `deploy/docker-compose.yml` – orchestrates `api` and `admin-web` containers.
- `deploy/nginx/default.conf` – Nginx config to serve the SPA and proxy `/api` to the backend.
- `deploy/api.env.example` – environment template for the API.

## Setup steps on the server
1) Clone or copy the repo to the server (e.g., via Git or `scp -r`).  
2) Create API env vars:
   ```bash
   cd /path/to/app-2.0
   cp deploy/api.env.example deploy/api.env
   # edit deploy/api.env with Mongo URI, JWT secrets, CORS_ORIGIN (e.g., https://admin.your-domain.com)
   ```
3) Build and start containers:
   ```bash
   cd deploy
   docker compose up -d --build
   ```
   - API: `http://<server-ip>:3000/api`
   - Admin web: `http://<server-ip>/` (Nginx proxies `/api` to the backend service)

## Managing the stack
- Restart after env changes: `docker compose up -d --build`
- Stop: `docker compose down`
- View logs: `docker compose logs -f api` or `docker compose logs -f admin-web`

## Seed the first admin user
After the API container is running, execute the seed script inside it:
```bash
cd deploy
docker compose exec api pnpm seed
```
> Uses the credentials defined in the seed script (see `apps/api/scripts/seed-database.ts`); update as needed before running.

## Updating
1) Pull latest code to the server.  
2) Rebuild and restart: `docker compose up -d --build` (from the `deploy` directory).

## Notes
- TLS: terminate HTTPS at a load balancer (ALB) or add certs to the Nginx container as needed.
- Scaling: for multi-instance deployments, front with an ALB and run the same Compose spec on each host or migrate to ECS/EKS.
- Health: Swagger docs remain available at `/api/docs` via the API service.
