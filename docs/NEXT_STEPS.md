# Next steps

## What improved recently

- Runnable scripts (`typecheck`, `check`, `db:deploy`), autoprefixer, aligned Stripe public env vars, hardened seed data, dashboard chrome (header, i18n nav, account menu), richer menus/products UX, and audit/QA documentation.

## Remaining external setup

1. Create Supabase project; configure Auth redirect URLs; paste DB URLs into `DATABASE_URL` / `DIRECT_URL`.
2. Run `npx prisma migrate deploy` against production DB.
3. Create Stripe recurring prices; set `NEXT_PUBLIC_STRIPE_*_PRICE_ID` + webhook.
4. Verify Resend domain; set `RESEND_FROM_EMAIL`.
5. On Vercel: add env vars; optional Cron for reminders.

## Recommended first launch steps

- Seed staging with `SEED_USER_ID` + `SEED_RESET=1` once; verify demo flow end-to-end.
- Enable Stripe test mode smoke checkout; replay webhook events from CLI.
- Soft-launch with one pilot kitchen; gather feedback on production board.

## v1.1 ideas

- Native drag-sort products inside a menu (`@dnd-kit` reuse).
- Customer detail drawer with full order timeline.
- SMS reminders (Twilio) behind feature flag.
- Multi-location / staff roles beyond OWNER.

## Pricing & GTM (brief)

- Keep Starter / Pro / Team ladder aligned with Stripe prices; publish limits on billing page.
- First 100 customers: founder outreach in meal-prep Facebook groups, Instagram chefs, local ghost kitchens; offer migration help from spreadsheets.
