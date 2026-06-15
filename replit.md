# Shipvora

A full-stack courier tracking system. Public users can track shipments and submit quote/contact requests. Admins manage shipments, tracking events, and the inbox.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — express-session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + express-session (admin auth)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + TanStack Query + wouter + shadcn/ui

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/shipments.ts` — DB schema: shipments, tracking_events, quote_requests tables + enums
- `artifacts/api-server/src/routes/` — Express routes: tracking, auth, shipments, quote-requests
- `artifacts/api-server/src/app.ts` — Express app with session middleware
- `artifacts/courier-app/src/` — React frontend: pages, layouts, components

## Architecture decisions

- Admin auth uses hardcoded `express-session` credentials (username: `admin`, password: `courier2024`) — no DB users table
- `isRead` on quote_requests stored as `"true"/"false"` text in DB; converted to boolean at the route layer
- Tracking event status is a PostgreSQL enum (`tracking_event_status`)
- Frontend auth guard uses `useAdminMe` hook — redirects to `/admin/login` on 401

## Product

- **Public**: Shipment tracking by tracking number (inline results), quote/contact form
- **Admin**: Shipments CRUD, tracking events per shipment, quote requests inbox (mark read, delete)
- Admin login at `/admin/login` — credentials: `admin` / `courier2024`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/db/src/schema/`, run `pnpm run typecheck:libs` before typechecking leaf packages — stale lib declarations cause false TS2305 errors
- `wouter` does not export React hooks like `useState` — import those from `react` directly
- Session cookies use `secure: true` in production; ensure proxy passes HTTPS headers correctly

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
