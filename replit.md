# Shipvora

A full-stack courier tracking system. Public users can track shipments and submit quote/contact requests. Admins manage shipments, tracking events, and the inbox.

**Live URL:** https://workspacecourier-app-production.up.railway.app  
**GitHub:** https://github.com/rowanlevine53-cyber/shipvora  
**Admin login:** `/admin/login` — username: `admin`, password: `courier2024`

---

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port from `PORT` env)
- `pnpm --filter @workspace/courier-app run dev` — run the frontend (port from `PORT` env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes to whichever DB `DATABASE_URL` points at
- Required env: `DATABASE_URL` (Postgres), `SESSION_SECRET` (express-session), `PORT`, `BASE_PATH`

---

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9, `"packageManager": "pnpm@10.26.1"` in root `package.json`
- API: Express 5 + express-session (admin auth), esbuild bundle → ESM output (`dist/index.mjs`)
- DB: PostgreSQL + Drizzle ORM (`drizzle-kit push` for schema sync)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Frontend: React + Vite + TanStack Query + wouter + shadcn/ui, dark navy + orange theme

---

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/shipments.ts` — DB schema: `shipments`, `tracking_events`, `quote_requests` tables + enums
- `lib/db/` and `lib/api-zod/` — export raw TypeScript source (`.ts`), not compiled JS — esbuild handles transpilation
- `artifacts/api-server/src/routes/` — Express routes: tracking, auth, shipments, quote-requests
- `artifacts/api-server/src/app.ts` — Express app with session middleware
- `artifacts/courier-app/src/` — React frontend: pages, layouts, components
- `artifacts/api-server/build.mjs` — esbuild build script, outputs ESM to `dist/index.mjs`

---

## Architecture decisions

- Admin auth uses hardcoded `express-session` credentials (username: `admin`, password: `courier2024`) — no DB users table
- `isRead` on `quote_requests` stored as `"true"/"false"` text in DB; converted to boolean at the route layer
- Tracking event status is a PostgreSQL enum (`tracking_event_status`)
- Frontend auth guard uses `useAdminMe` hook — redirects to `/admin/login` on 401
- `vite.config.ts` uses `PORT` and `BASE_PATH` env vars — both default gracefully (`5173` and `/`) so builds don't throw in CI/Railway

---

## Product

- **Public**: Shipment tracking by tracking number (inline results on homepage), quote/contact form at `/contact`
- **Admin**: Shipments CRUD, tracking events per shipment, quote requests inbox (mark read, delete)
- Admin panel at `/admin/login` — credentials: `admin` / `courier2024`

---

## Railway Deployment

The app is deployed on Railway with two services auto-detected from the pnpm workspace. Config files that make it work:

| File | Purpose |
|------|---------|
| `artifacts/api-server/nixpacks.toml` | Installs pnpm via npm, then runs monorepo install + build |
| `artifacts/api-server/railway.toml` | Sets start command and healthcheck path |
| `artifacts/courier-app/nixpacks.toml` | Same install approach, builds static site |
| `artifacts/courier-app/railway.toml` | Sets static serve start command |
| `nixpacks.toml` (root) | Root-level Nixpacks config (backup) |

**Critical gotcha:** Railway's Nixpacks defaults to `npm install`. The root `package.json` preinstall script blocks npm. The fix is `nixpacks.toml` in each service directory which overrides the install phase to: `npm install -g pnpm@10 --ignore-scripts` then `pnpm install --no-frozen-lockfile`.

**Why `packageManager` field alone isn't enough:** Railway's older Nixpacks build doesn't always respect it — the per-service `nixpacks.toml` is the reliable override.

**Railway env vars needed for `@workspace/api-server`:**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
SESSION_SECRET=<any 32+ char random string>
NODE_ENV=production
PORT=3000
```

**Railway env vars needed for `@workspace/courier-app`:**
```
PORT=3000
BASE_PATH=/
NODE_ENV=production
```

**After first deploy:** Run `pnpm --filter @workspace/db run push` in the api-server Console tab to create DB tables.

---

## Pushing to GitHub

Git push is sandboxed in Replit's main agent. Use the GitHub API via `code_execution` JavaScript to push:

```js
// Pattern: get HEAD SHA → create blobs → create tree (base_tree: existing SHA) → create commit → PATCH ref
const refData = await ghGet(`/repos/${REPO}/git/refs/heads/main`);
const parentSha = refData.object.sha;
const parentCommit = await ghGet(`/repos/${REPO}/git/commits/${parentSha}`);
// create blobs for changed files, build tree, commit, patch ref
```

The GitHub token is provided by the user at session start — never store it in code or files. Push only source files (not `node_modules`, `.local`, `dist`, `.tsbuildinfo`, `attached_assets`).

---

## Gotchas

- After changing `lib/db/src/schema/`, run `pnpm run typecheck:libs` before typechecking leaf packages — stale lib declarations cause false TS2305 errors
- `wouter` does not export React hooks like `useState` — import those from `react` directly
- Session cookies use `secure: true` in production; ensure proxy passes HTTPS headers correctly
- Lib packages (`@workspace/db`, `@workspace/api-zod`) export `.ts` source files directly via `exports` in `package.json` — no compiled output needed because esbuild bundles them
- The API server build outputs ESM (`.mjs`), not CJS — start command is `node --enable-source-maps dist/index.mjs`
- `pnpm run typecheck:libs` is NOT needed in the Railway build step — esbuild handles TypeScript transpilation directly without needing `tsc --build` declarations first
- Railway detects all pnpm workspace packages and creates a service per package — delete `mockup-sandbox`, `api-spec`, and `api-client-react` services; only keep `courier-app` and `api-server`

---

## User preferences

- Prefers direct, no-fluff answers — "bro" tone, just tell them exactly what to do
- Wants to push to GitHub and deploy via Railway
- GitHub account: `rowanlevine53-cyber`
