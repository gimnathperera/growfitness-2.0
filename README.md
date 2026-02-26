# Grow Fitness Platform

Monorepo for Grow Fitness Admin Portal and API.

## Structure

```
/apps
  /api              # NestJS backend
  /admin-web        # React 19 + Vite admin portal
  /client-web       # Stub (not implemented yet)
/packages
  /shared-types     # TypeScript types & enums
  /shared-schemas   # Zod validation schemas
/tooling
  /eslint-config    # Shared ESLint config
  /tsconfig         # Shared TypeScript configs
```

## Tech Stack

- **Backend**: NestJS + MongoDB (Atlas) + Mongoose + TypeScript
- **Frontend**: React 19 + Vite + Shadcn UI + TypeScript + React Router
- **Validation**: Zod (shared schemas)
- **Package Manager**: pnpm workspaces

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Setup environment variables:
- Copy `.env.example` to `.env` in `apps/api`
- Configure MongoDB Atlas connection string
- Set JWT secrets

3. Seed admin user:
```bash
cd apps/api
pnpm seed
```

4. Start development servers:
```bash
# Backend (port 3000)
cd apps/api
pnpm dev

# Frontend (port 5173)
cd apps/admin-web
pnpm dev
```

## Support Chat (client-web)

The client app includes a floating support chat widget (bottom-right) that answers questions using repo-based knowledge. The backend calls OpenAI; the API key is never exposed to the frontend.

- **Env**: Set `OPENAI_API_KEY` in `apps/api/.env` or `apps/api/.env.local`. See `apps/api/.env.example`. The frontend uses `VITE_API_BASE_URL` (no new vars).
- **Knowledge**: Edit Markdown/JSON in `apps/api/src/knowledge/` (`business.json`, `procedures.md`, `faq.md`, `payments.md`). Restart the API to reload.
- **Run locally**: Start the API (`cd apps/api && pnpm dev`), then start client-web (`cd apps/client-web && pnpm dev`). Open the app and use the chat button to test.

## Deployment

See `deploy/README.md` for Docker Compose + Nginx instructions to run the API and admin web on an AWS host.

## Completed Features

### Backend
- ✅ Monorepo structure with pnpm workspaces
- ✅ NestJS API with MongoDB Atlas connection
- ✅ All data models (User, Kid, Session, Requests, Invoices, Locations, Banners, AuditLog)
- ✅ JWT authentication with refresh tokens
- ✅ RBAC guards (Admin-only routes)
- ✅ All API endpoints (auth, users, kids, sessions, requests, invoices, locations, banners, dashboard, audit)
- ✅ Stub modules (codes, resources, quizzes, crm, reports)
- ✅ Notification service (Email & WhatsApp - mocked in dev)
- ✅ Audit logging
- ✅ Error handling with consistent error codes
- ✅ Seed script for admin user
- ✅ Basic test setup

### Frontend
- ✅ React 19 + Vite setup
- ✅ React Router configuration
- ✅ TanStack Query setup
- ✅ Auth context and protected routes
- ✅ Layout with sidebar navigation
- ✅ All route pages (stubs for future implementation)
- ✅ API service layer
- ✅ TypeScript strict mode

## Next Steps

The foundation is complete. Remaining work:

1. **UI Components**: Install and configure Shadcn UI components
2. **Data Tables**: Implement TanStack Table wrappers
3. **Forms**: Build form components with React Hook Form + Zod
4. **Pages**: Implement full functionality for each admin module
5. **Charts**: Add charts for dashboard (using Recharts)

## API Endpoints

All endpoints are prefixed with `/api`:

- `POST /api/auth/login` - Admin login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/users/parents` - List parents
- `GET /api/users/coaches` - List coaches
- `GET /api/dashboard/stats` - Dashboard statistics
- ... (see plan for full list)

## Notes

- WhatsApp provider is mocked in development (logs to console)
- Email provider is mocked in development (logs to console)
- First admin user created via seed script
- All routes require admin authentication
