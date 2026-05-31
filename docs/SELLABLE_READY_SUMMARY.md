# Sellable-ready summary — OS Kitchen

Last verified: `next build` and `tsc --noEmit` succeed after `prisma generate`.

## What is ready for revenue demos

- **Marketing site** with upgraded hero, demo CTAs, `/demo` hub, vertical `/demo/*` flows, and `/solutions/*` industry pages.
- **Auth** with safe post-login redirects for campaign deep links.
- **Onboarding wizard** + **Settings → guided setup** reopen.
- **Demo workspace** import (vertical-specific dataset copy) with **simulated** channels — no third-party keys required.
- **Dashboard home** snapshot + attention scaffolding (continued iteration on live metrics).
- **Order hub**, **kitchen production**, **packing**, **CRM**, **analytics**, **webhooks** empty states and clearer copy (“Sales channels”, “Menu items”, etc.).
- **Notifications** page that degrades gracefully without Resend.
- **QA / launch / pricing / outreach** docs in `/docs`.

## What is simulated

- WooCommerce, Shopify, and Uber Eats **connection rows** in demo data are explicitly simulated (`NEEDS_AUTH` / helper copy).
- Demo **webhook** and **external order** samples illustrate failure/signature cases — not live traffic.

## What needs real credentials

- Production WooCommerce / Shopify **REST + webhook secrets**.
- Uber Eats / Uber Direct **partner credentials** (pilot programs).
- **Resend** for outbound mail.
- **Stripe** for billing automation beyond UI panels.

## Launch blockers (operational)

1. Run database migrations in each environment (`prisma migrate deploy`).
2. Configure Supabase + Postgres + env vars on Vercel.
3. Legal: privacy policy + terms + DPA template for enterprise conversations.

## Next technical steps

- Order hub **drawer**, grouping, and bulk ops (Phase 8).
- Integration **setup wizards** with test connection + import preview (Phase 6).
- Analytics **charts** + deterministic insights (Phase 11).
- Dynamic import for **PDF** libraries on packing to trim bundle.

## Next business steps

- Record **demo Loom** from `/demo/meal-prep`.
- Line up **5 beta kitchens** with weekly preorder pain.
- Publish **pricing** alignment between marketing + `limitsForPlan`.
