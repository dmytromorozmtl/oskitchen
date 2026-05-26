# KitchenOS audit report

## What works

- Next.js 15 App Router with TypeScript strict, Tailwind, and dashboard routes for menus, products, orders, production, packing, customers, kitchen screen, billing, and settings.
- Supabase Auth session handling with middleware protection for `/dashboard/*`.
- Prisma schema with `UserProfile`, weekly `Menu` / `Product`, `Order` / `OrderItem`, `ProductionTask`, `Subscription`, `KitchenSettings`, and `NotificationLog`.
- Stripe Checkout, billing portal, and webhook route with optional Stripe (graceful JSON errors when keys are missing).
- Resend-backed email helpers with safe no-op behavior without `RESEND_API_KEY`.
- Cron reminder route (`/api/cron/reminders`) guarded by `CRON_SECRET`.
- Lightweight EN/FR strings via `lib/i18n.ts` wired into the dashboard shell navigation.

## What was missing or inconsistent

- `app/dashboard/layout.tsx` queried `prisma.user` after the model rename to `UserProfile`.
- `prisma/seed.ts` referenced removed fields (`deliveryRequested`, string categories, `prisma.user`).
- `.env.example` and README still documented legacy Stripe env names instead of `NEXT_PUBLIC_STRIPE_*_PRICE_ID`.
- PostCSS lacked `autoprefixer`; `package.json` lacked `typecheck`, `check`, and `db:deploy`.
- Menu UI did not surface product/order counts, preorder countdown, or Active/Draft/Closed badges.

## What was fixed (this pass)

- Dashboard layout loads `userProfile` + `kitchenSettings` for branding and locale; shell shows business name, translated nav, theme toggle, and account menu.
- Products page DTO includes extended product fields; product manager uses category select, optional fields, filters, card/table toggle, and `next/image` for previews.
- Menus page aggregates counts and status; `MenuBoard` shows badges and preorder-relative copy.
- Seed rewritten for enums, `fulfillmentType`, realistic meal-prep data (2 menus, 10+ products, 12 orders, 8 customers), optional `SEED_RESET=1`.
- Image upload field uses an accessible file button; order phone parsing normalized in `createOrder`.
- Tooling: scripts, autoprefixer, updated `.env.example`, `supabase/rls.sql`, and this audit doc.

## Still requires external configuration

- Supabase project (Auth URLs, DB URLs, optional Storage buckets `product-images` / `business-logos`).
- Stripe products/prices and webhook endpoint on your deployed domain.
- Resend domain verification for production sending.
- Vercel env vars + Cron job pointing at `/api/cron/reminders` with `CRON_SECRET`.
