# Client Portal — Pages Functions Integration

This drops the client portal directly into your existing `ffwebsystems-site`
repo, deployed as part of the same Cloudflare Pages project. No separate
Worker, no separate domain.

## What to copy into your repo

Copy these into the root of `ffwebsystems-site` (same level as `index.html`):

```
functions/
  _lib/portal.js
  api/login.js
  api/logout.js
  api/me.js
  api/upload.js
  api/files/index.js
  api/files/[id].js
  api/admin/clients.js
portal/
  index.html          -> served at https://ffwebsystems.com/portal
schema.sql
```

Cloudflare Pages auto-detects the `functions/` directory and deploys each
file as a route — no config needed for routing. `functions/api/login.js`
automatically becomes `/api/login`, `functions/api/files/[id].js` becomes
`/api/files/:id`, etc.

## One-time setup (from the repo root, or anywhere with wrangler installed)

```bash
# 1. Create the D1 database
wrangler d1 create ffweb-portal-db

# 2. Apply the schema
wrangler d1 execute ffweb-portal-db --file=schema.sql --remote

# 3. Create the R2 bucket
wrangler r2 bucket create ffweb-portal-files
```

## Bind D1 + R2 to your Pages project

Pages Functions bindings are set in the Cloudflare dashboard (not wrangler.toml,
since wrangler.toml is for Workers, not Pages):

Cloudflare dashboard → Workers & Pages → your Pages project (ffwebsystems-site)
→ Settings → Functions →

- **D1 database bindings**: variable name `DB` → select `ffweb-portal-db`
- **R2 bucket bindings**: variable name `FILES` → select `ffweb-portal-files`
- **Environment variables**: add `ADMIN_KEY` (secret) → any long random string,
  used to protect the client-creation endpoint

Do this for both Production and Preview environments if you want the portal
to work on preview deploys too.

## Adding your first client

Once deployed, create a client login with:

```bash
curl -X POST https://ffwebsystems.com/api/admin/clients \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -H "content-type: application/json" \
  -d '{"username":"berenice","password":"choose-a-temp-password","business_name":"Berenice Beauty Salon","email":"client@example.com"}'
```

Then the client logs in at `https://ffwebsystems.com/portal`.

## Updating a client's progress stage

Progress is a fixed 4-stage tracker: 0=Design, 1=Development, 2=Review, 3=Live.
Update it with:

```bash
curl -X PATCH https://ffwebsystems.com/api/admin/progress \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -H "content-type: application/json" \
  -d '{"username":"berenice","progress_stage":1}'
```

The client sees this as a step-by-step progress bar at the top of their
portal page immediately after logging in.

## If you already deployed schema.sql before progress tracking was added

Run `migration_add_progress.sql` against your existing D1 database:

```bash
wrangler d1 execute ffweb-portal-db --file=migration_add_progress.sql --remote
```

If you haven't deployed yet, just use the updated schema.sql — it already
includes the `progress_stage` column, no separate migration needed.

## Adding a nav button on the main site

See NAV_BUTTON_SNIPPET.txt for a drop-in "Client Login" button to add
to index.html's navbar, linking to /portal.

## Not included yet

- Admin UI for the invite-based third-party account access flow
  (`access_requests` table exists in schema.sql, no screen for it yet)
- Password reset flow (currently: you set it manually via the admin endpoint)
- Admin UI for updating progress (currently: curl/API call only)
