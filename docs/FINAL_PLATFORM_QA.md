# Final platform QA (repeatable)

Run before tagging a release:

```bash
npm run typecheck
npm run build
```

## Routes (smoke)

For each primary `/dashboard/*` route in `lib/nav-config.ts`:

- Page returns **200** for an authenticated owner session.
- No **React import** or **Prisma** errors in server logs.
- **Mobile width** (375px): sidebar hidden; sheet menu opens; main content scrolls.

## Business modes

- Change **Operating mode** in Settings → sidebar labels update (English terminology).
- **Focused** vs **Show all modules** toggles hidden links as expected.
- **Pins** persist across refresh (`localStorage`).

## Permissions

- Non-owner roles cannot reach owner-only growth links in the sidebar.
- Platform owner (`workspace.moroz@gmail.com`) sees **full** nav including platform admin entry when bypass is active.

## Security

- No API route returns raw **Stripe** or **OAuth** secrets in JSON.
- `.env` keys never referenced from client bundles except `NEXT_PUBLIC_*`.

## Storefront / checkout

- Guest checkout paths honor server validations (blackouts, max qty, etc.) where implemented.

## Migrations

- Apply pending Prisma migrations in staging before production.
- Enum expansion `20260507160000_business_type_expansion` is **additive only**.
