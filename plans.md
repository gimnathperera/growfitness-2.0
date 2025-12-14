Cursor Prompt (PLAN MODE)

You are building Grow Fitness in a monorepo with:

Backend: NestJS + MongoDB (Mongoose) + TypeScript

Frontend (Admin + Client): React 19 + Vite + Shadcn UI + TypeScript

Validation: Zod (shared schemas where possible)

Use well-maintained libraries only. Follow clean architecture + consistent patterns.

Important: Implement ALL Admin Panel features + API integration first. Do not start Client Portal until Admin is complete.

agent

0. Read & lock requirements (no coding yet)

Use the provided spec (agent.md) as source of truth. Identify modules, workflows, roles:

Roles: Admin, Coach, Parent, Kid

Portals: Admin Portal (admin only), Client Portal (coach + parent) — BUT build Admin Portal first

Key flows: coach created by admin; free-session outsider flow; full registration (parent + 1..n kids) with “block login if kid registration incomplete”; sessions + reschedule approvals; invoices; notifications (WhatsApp/email).

agent

Output a short “Scope Lock” summary before writing code.

1. Monorepo structure (create skeleton)

Create a monorepo with workspaces (pnpm preferred):

/apps
/admin-web (React 19 + Vite + Shadcn)
/client-web (React 19 + Vite + Shadcn) // DO NOT implement yet
/api (NestJS)
/packages
/shared-types (TS types, enums)
/shared-schemas (Zod schemas, DTO validators)
/ui (optional shared shadcn wrappers later)
/tooling
/eslint-config
/tsconfig

Ensure:

single root lint/format config

env handling per app

consistent path aliases

strict TS, consistent naming conventions

2. Backend (NestJS) – architecture + foundations

Implement clean-ish modular architecture:

modules/ per domain: auth, users, kids, sessions, invoices, requests, locations, banners, notifications, audit, reports, resources, quizzes, crm (stub), codes (stub)

common/: config, guards, interceptors, filters, pagination, response wrapper, error codes

infra/: db connection, external providers (email/whatsapp), logging

2.1 Data model (Mongo/Mongoose)

Design schemas + indexes for:

User

role: ADMIN | COACH | PARENT

auth fields (email, phone, passwordHash)

status, createdAt

parentProfile fields (location, etc.)

coachProfile fields

Kid

parentId (required)

name, gender, birthDate, goal, currentlyInSports, medicalConditions

sessionType: INDIVIDUAL | GROUP

achievements/milestones refs

Session

type: group/individual

coachId, locationId

dateTime, duration, capacity

kids[] (group) or kidId (individual)

status (scheduled/confirmed/cancelled/etc.)

Requests

FreeSessionRequest (outsider flow; no account creation)

RescheduleRequest (parent/coach request, admin approval)

ExtraSessionRequest (parent request, admin approval)

Invoice

parent invoices, coach payouts

items, amount, status, dueDate, paidAt

export fields

Location

name, address, geo (optional)

Banner

imageUrl, active, order, targetAudience (parent/coach/all)

AuditLog

actorId, action, entityType, entityId, metadata, timestamp

Add pagination-friendly indexes (dateTime, role, parentId, status, etc.).

3. Auth, RBAC, and security (Admin-first)

Implement:

JWT auth (access + refresh)

password hashing (argon2/bcrypt)

RBAC guard: Admin-only routes strictly enforced; coach/parent rules later

Validate DTOs via Zod (shared package), and transform to typed DTOs.

Error handling: consistent error shape + codes

4. Admin Panel features (UI + API integration) — build in this order

Admin modules required by spec: Dashboard, Users, Sessions, Codes, Kids, Requests, Invoices, Banner Management, Locations, Resources, Quizzes, CRM, Audit, Reports.

agent

Implement “real” ones first; stub the rest with routes + empty screens.

4.1 Admin Web foundations

Shadcn setup, layout shell, sidebar nav (modules)

TanStack Router (or React Router) + TanStack Query

Form handling: React Hook Form + Zod resolver

Table: TanStack Table for listing pages

Toasts, loading states, empty/error states

Auth-protected routes (admin only)

4.2 Admin: Dashboard (API + UI)

APIs to power:

today’s sessions

free session requests count/list

reschedule requests list

weekly sessions summary

finance summary

recent activity logs (audit)

4.3 Admin: Users

Parents

list/search/filter

create parent + kid(s) flow (admin-assisted registration)

edit, delete (soft delete preferred)

link kids
Coaches

create coach (admin-only)

generate credentials or invite flow

edit, deactivate

4.4 Admin: Kids

list/search

view profile

edit: session type, milestones/achievements references (basic CRUD)

link/unlink to parent (with guardrails)

4.5 Admin: Sessions

calendar view + list view

create group/individual sessions

assign coach + kids

capacity control for free sessions

approve reschedules/cancellations (workflow state machine-ish)

4.6 Admin: Requests

Free session outsider requests

create endpoint from public/client later, but admin must manage now:

admin selects kids and sends details via WhatsApp/email

not selected -> marked for next free session (track status)

Reschedule requests

approve/deny

Extra session requests

approve/deny

4.7 Admin: Invoices

list/filter by parent/coach

update payment status

export:

CSV initially (easy)

PDF optional (use a maintained lib; keep simple templates)

4.8 Admin: Locations

CRUD locations

4.9 Admin: Banner Management

CRUD banners

ordering + active flags

target audience flags for client portal later

4.10 Stubs (don’t skip routing)

Codes, Resources, Quizzes, CRM, Reports:

create route + page + placeholder text
Audit:

implement read-only audit log viewer (since audit is already used)

5. Notifications (Admin-triggered)

Implement provider abstraction:

NotificationService with channels: Email + WhatsApp (WhatsApp can be mocked)

Persist notification attempts (for audit/debug)
Admin actions that trigger notifications:

free session confirmations

session changes

invoice updates

agent

In dev:

use “mock providers” that log payloads + store in DB.

6. Definition of Done for “Admin Complete”

Admin is considered complete only when:

All “real” modules above are fully working end-to-end (UI + API + DB)

RBAC works (admin-only)

Validations via Zod are enforced server-side + client-side forms

Pagination + search works for list pages

Error handling is consistent and user-friendly

Seed script exists to create the first Admin user

Basic tests exist:

backend: unit tests for services + at least 1 e2e happy path (auth + create coach + create session)

frontend: smoke tests optional, but at least type-safe + lint clean

Only after this, begin Client Portal implementation.

7. MCP usage during development (required)

Use relevant MCPs to:

enforce consistent architecture & folder structure decisions

validate API contracts against Zod schemas

generate repeatable CRUD modules (controller/service/repo + tests)

keep UI patterns consistent (forms/tables/dialogs)

prevent scope creep into client portal

Document MCP usage in a short docs/dev-notes.md with:

which MCP was used for what

decisions made

8. Execution plan output format (what you must produce now)

Before coding, produce:

Final module-by-module checklist (Admin-first)

Data model + endpoint list (REST)

Folder structure proposal (final)

Risks/assumptions (e.g., WhatsApp provider is mocked)
Then start implementation in small PR-sized steps.
