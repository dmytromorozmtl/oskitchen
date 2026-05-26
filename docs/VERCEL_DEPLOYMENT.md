# Vercel deployment

## Node.js version

- Prefer **Node 22 LTS** (see `.nvmrc` / `.node-version` and `package.json` `engines`).
- Set **Project → Settings → General → Node.js Version** to **22.x** in Vercel.

## Prerequisites

- GitHub/GitLab repo connected to Vercel
- Supabase production project
- Stripe + Resend accounts (optional but recommended before paid launch)
- Domain DNS access

## Output & framework

- **Framework:** Next.js (App Router) — auto-detected.
- **Output:** Serverless functions + static assets (default Next build on Vercel).

## Production / preview branches

- Connect **Production Branch** (usually `main`) under Git settings.
- **Preview:** every PR gets an isolated URL — use **Preview** env vars for test Stripe keys when experimenting.

## Deployment protection

- Enable **Vercel Authentication** or password protection for Preview if dashboards could leak data.
- Keep Production SSO/IP rules aligned with your compliance needs.

## Rollback

- Use **Instant Rollback** in Vercel to revert to a prior deployment quickly.
- Note: cron job definitions follow the **currently deployed** `vercel.json` — verify after rollback (`docs/PRODUCTION_WEBHOOKS.md`).

## Cron jobs

`vercel.json` schedules **`GET /api/cron/reminders` daily** (`0 14 * * *` UTC — adjust as needed).

Requirements:

- Set **`CRON_SECRET`** in Vercel — platform sends `Authorization: Bearer <CRON_SECRET>` automatically.

Hobby plans may restrict cron frequency — see Vercel docs.

## Environment variables

In **Vercel → Project → Settings → Environment Variables**, add every key from **`docs/ENVIRONMENT_VARIABLES.md`** for **Production** (and Preview as needed).

Critical:

- `NEXT_PUBLIC_APP_URL` → `https://your-domain.com` (also set for Preview to the Vercel preview URL if you test billing webhooks there)
- `DATABASE_URL` / `DIRECT_URL` — production Supabase URLs
- `ENCRYPTION_KEY`
- Stripe / webhook secrets when enabling billing

**Never** enable “Expose to browser” for server-only secrets.

## Build & install

- **Install:** `npm install` (default)
- **Build:** `npm run build` (see `package.json` — runs `prisma generate && next build`)
- **`vercel.json`** sets region (`iad1`) and framework hint; build command delegates to `npm run build`.

## Prisma during build

`postinstall` runs `prisma generate`. `npm run build` runs `prisma generate` again — redundant but safe.

## Migration strategy

Recommended:

1. Run **`npm run db:deploy`** in CI **before** promoting deployment, **or**
2. Use a Vercel **deploy hook** / GitHub Action step: checkout → `npm ci` → `npx prisma migrate deploy` with prod `DATABASE_URL`/`DIRECT_URL`.

Do **not** run `migrate dev` against production.

## Custom domain

1. Vercel → Domains → add `app.yourdomain.com`
2. DNS: CNAME to `cname.vercel-dns.com` (or A records per Vercel docs)
3. Update `NEXT_PUBLIC_APP_URL` to match canonical HTTPS URL
4. Update Supabase Auth redirect URLs and Stripe webhook URLs

## Preview deployments

- Use Preview env vars or inherit Production carefully (prefer separate Stripe webhook endpoint for test mode).
- Webhooks from external providers generally **cannot** reach ephemeral Preview URLs unless using Stripe CLI / tunneling.

## Edge / runtime

- Prefer **Node.js runtime** for Prisma-heavy routes and webhook handlers unless verified compatible with Edge.
- Raw body webhook routes must use Next.js patterns compatible with signature verification.

## Serverless considerations

- Keep connections pooled (`DATABASE_URL`).
- Avoid long synchronous work in webhooks — acknowledge quickly, process async if needed (future improvement).

## Webhook URLs after deploy

Replace `{BASE}` with `https://your-domain.com`:

| Provider | Path |
|----------|------|
| Stripe | `{BASE}/api/webhooks/stripe` |
| Shopify | `{BASE}/api/webhooks/shopify/orders-create` (and related topics) |
| WooCommerce | `{BASE}/api/webhooks/woocommerce` |
| Uber Eats | `{BASE}/api/webhooks/uber-eats/orders` |
| Uber Direct | `{BASE}/api/webhooks/uber-direct` |

## Operational hygiene

- No localhost URLs in production env
- No absolute filesystem paths in code
- Log redaction via `lib/logger.ts` — do not `console.log` secrets
