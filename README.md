# KitchenOS

KitchenOS is a production-grade micro-SaaS for meal prep operators, caterers, ghost kitchens, and preorder-first restaurants. It unifies weekly menus, preorder deadlines, kitchen production, packing exports, customer notifications, pickup and delivery workflows, and Stripe billing inside a fast Next.js 15 experience.

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript (strict), Tailwind CSS, shadcn/ui primitives, Framer Motion, Lucide, Recharts, next-themes.
- **Data:** PostgreSQL on Supabase with Prisma ORM.
- **Auth:** Supabase email/password with PKCE callback route + middleware-protected dashboards.
- **Billing:** Stripe Checkout + Customer Portal + subscription webhooks with enforced plan limits.
- **Email:** Resend-powered transactional notifications for confirmations and reminders.
- **State:** Zustand (production search persistence), React Hook Form compatible inputs via server actions.

## Getting started

### 1. Prerequisites

- Node.js 22 LTS (see `.nvmrc` and `package.json` engines)
- npm / pnpm / yarn
- Supabase project
- Stripe account (test mode is fine)
- Resend API key + verified domain (dev can use `onboarding@resend.dev`)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy `.env.example` → `.env.local` and fill every variable. Use Supabase’s pooled connection string for `DATABASE_URL` and the direct connection for `DIRECT_URL` so Prisma migrations stay reliable.

### 4. Initialize the database

```bash
npx prisma migrate deploy   # or `npm run db:migrate` during development
npm run db:seed             # optional — requires SEED_USER_ID (Supabase auth UUID)
```

### 5. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` for the landing experience and `/signup` to provision an account.

### Verify install + build (recommended)

If your terminal did not have `npm` on `PATH` (common in some IDE sandboxes), use a normal macOS terminal and see **`docs/LOCAL_NODE_SETUP.md`**.

```bash
chmod +x scripts/local-check.sh   # once
npm run local-check              # install → prisma generate → typecheck → build
```

Fill **`.env.local`** (copy from **`.env.example`** if needed). A starter **`.env.local`** may already exist with placeholders — replace Supabase and database URLs before auth and Prisma-backed pages work end-to-end.

## Supabase setup

1. Create a project at [https://supabase.com](https://supabase.com).
2. Enable **Email** auth under Authentication → Providers.
3. Add `http://localhost:3000/auth/callback` (and your production domain) to **Redirect URLs**.
4. Copy the anon key + URL into `.env.local`.
5. Paste the Postgres connection strings into `DATABASE_URL` / `DIRECT_URL`.
6. (Recommended for MVP speed) Disable **Confirm email** under Authentication → Providers → Email while iterating locally.

KitchenOS mirrors each authenticated user into the `users` table via `ensureAppUser`, keeping Supabase Auth as the source of truth for IDs.

## Stripe setup

1. Create three recurring prices ($19 / $49 / $99) in Stripe Billing.
2. Copy each price ID into **`NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID`**, **`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`**, and **`NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID`** (these are safe to expose to the browser).
3. Fill **`STRIPE_SECRET_KEY`**, **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`**, and **`STRIPE_WEBHOOK_SECRET`**.
4. Point a webhook endpoint at `https://your-domain.com/api/webhooks/stripe` and subscribe to:

   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed` (recommended)

Metadata (`userId`, `plan`) is forwarded from Checkout so the webhook can upsert rows in `subscriptions`.

### Plan enforcement

| Plan       | Menus     | Orders / month | Integrations (external) |
| ---------- | --------- | -------------- | ----------------------- |
| Starter    | 1         | 100            | 1                       |
| Pro        | Unlimited | 1,000          | 3                       |
| Team       | Unlimited | Unlimited      | Unlimited               |
| Enterprise | Unlimited | Unlimited      | Unlimited (sales-led)   |

Enterprise is contact-only in the Billing UI until a Stripe price exists. Limits are evaluated server-side when menus are duplicated/created and when orders are captured; integration gating hooks will align with `maxIntegrations` in upcoming iterations.

### Integrations & encryption

- Dashboard → **Integrations** configures WooCommerce, Shopify, Uber Eats (adapter), and Uber Direct (delivery stubs).
- **Order hub** lists internal + external orders; **Webhook activity** shows ingestion audit rows.
- Set **`ENCRYPTION_KEY`** (32-byte base64 or 64-char hex) before saving any provider secret — see `.env.example`.
- Webhook URLs: WooCommerce `POST /api/webhooks/woocommerce?cid=<connectionId>`; Shopify topic routes under `/api/webhooks/shopify/*`; Uber Eats stub `POST /api/webhooks/uber-eats/orders?cid=<connectionId>`.

See **`docs/INTEGRATIONS_ARCHITECTURE.md`** and setup guides under **`docs/`**.

## Resend setup

1. Verify your sending domain inside Resend.
2. Store `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
3. Until configured, email helpers no-op gracefully—perfect for local development.

## Deployment (Vercel + Supabase)

### Production release (required: prebuilt)

Remote `next build` on Vercel **OOMs** on this repo (655+ routes, Prisma, large TypeScript surface). **Always deploy prebuilt:**

```bash
npm run deploy:prod
```

Equivalent: `bash scripts/deploy-prebuilt-prod.sh` (typecheck → tests → local build → `vercel build` → `vercel deploy --prebuilt --prod`).

**Do not use** `vercel deploy --prod` without `--prebuilt`.

**After deploy:**

```bash
curl -s https://os-kitchen.com/api/health | python3 -m json.tool
npx vercel@latest list kitchen-os | head -8
```

Git pushes to Vercel skip remote builds (`scripts/vercel-ignore-remote-build.sh`). Production updates go through `npm run deploy:prod`.

### First-time / infrastructure

1. Push this repo to GitHub.
2. Create a Vercel project, set framework preset to Next.js, and add **all** environment variables from `.env.example`.
3. Ensure `NEXT_PUBLIC_APP_URL` matches the deployed hostname for Stripe redirects + emails.
4. Run `npx prisma migrate deploy` against production using `DIRECT_URL` (via CI or Supabase SQL editor + Prisma migrate).
5. Install the Stripe webhook endpoint against your production URL.

### Vercel Cron (pickup / delivery reminders)

1. Set **`CRON_SECRET`** in Vercel env (long random string).
2. Add a Cron job targeting **`POST /api/cron/reminders`** daily (UTC), header **`Authorization: Bearer <CRON_SECRET>`**.
3. Ensure **`RESEND_API_KEY`** is set so reminders actually send.

### Vercel Cron (webhook job worker)

When **`WEBHOOK_ASYNC_QUEUE=true`**, WooCommerce webhooks enqueue **`webhook_processing_jobs`** and return immediately. Configure a cron hitting **`POST /api/cron/webhook-jobs`** every few minutes with the same **`Authorization: Bearer <CRON_SECRET>`** header. `vercel.json` includes a default `*/5` schedule — ensure `CRON_SECRET` is set in Vercel or the route returns 503.

### Supabase RLS

KitchenOS uses Prisma server-side against Postgres; RLS is optional. See **`supabase/rls.sql`** for recommended policies if you query tables from the Supabase JS client.

### Supabase Storage (optional image uploads)

Create buckets **`product-images`** and **`business-logos`** (public read or signed URLs). Server uploads use **`SUPABASE_SERVICE_ROLE_KEY`**. Add any custom hostnames to `next.config.ts → images.remotePatterns`.

## Demo seed data

After creating a Supabase user (note the UUID):

```bash
SEED_USER_ID=<supabase_user_uuid> SEED_USER_EMAIL=demo@kitchenos.app npm run db:seed
```

To replace demo data for that user:

```bash
SEED_RESET=1 SEED_USER_ID=<uuid> npm run db:seed
```

The script hydrates two weekly menus, **10+** meals, production tasks, and **12** sample orders with lookup tokens.

## Project structure

```
app/            # Routes (marketing, auth, dashboard, APIs, webhooks)
components/     # UI + feature modules (landing, dashboard, public)
actions/        # Server actions (menus, orders, production, settings)
lib/            # Supabase helpers, Prisma client, Stripe, email, plans
services/       # Thin facades (email exports)
hooks/          # Shared hooks
stores/         # Zustand stores
prisma/         # Schema, migrations, seed script
types/          # Shared TypeScript contracts
```

## Scripts

| Script               | Description                               |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Next.js dev server                        |
| `npm run build`      | `prisma generate` + production build      |
| `npm run start`      | Run the compiled app                      |
| `npm run lint`       | ESLint via `next/core-web-vitals`         |
| `npm run typecheck`  | `tsc --noEmit`                            |
| `npm run check`      | Typecheck + production build              |
| `npm run db:seed`    | Populate demo records                     |
| `npm run db:migrate` | `prisma migrate dev`                      |
| `npm run db:deploy`  | `prisma migrate deploy` (CI / production) |
| `npm run db:push`    | Push schema changes (quick prototyping)   |

## Product highlights

- Conversion-focused landing page with hero, animated dashboard preview, pricing, testimonials, FAQ, SEO metadata, OpenGraph tags, dark/light theme, and PWA manifest.
- Drag-and-drop weekly menu ordering powered by `@dnd-kit`.
- Production workspace with search persisted via Zustand, filters, bulk completion actions, and kitchen screen mode.
- Printable packing exports (PDF + CSV) grouped by guest, prepared date, or fulfillment mode using `jspdf` + `jspdf-autotable`.
- QR-based guest order lookup (`/order/[token]`).
- Multilingual preference stored in settings (English/French) ready for broader i18n expansion.

## Support & roadmap

KitchenOS is intentionally modular—swap branding tokens in `app/globals.css`, extend email templates in `lib/email.ts`, or wire additional fulfillment providers beside Stripe + Resend without touching core domain logic.

For implementation questions, extend `README.md` with your company-specific runbooks (SLAs, training PDFs, escalations).

Crafted for investor-ready demos and serious pilot deployments.
