# Release process

Lightweight checklist for shipping KitchenOS to preview or production.

## Pre-merge

1. **Branch hygiene**: Feature branches rebased or merged from `main`; no stray secrets.
2. **Typecheck**: `npm run typecheck`
3. **Unit tests**: `npm run test:unit`
4. **Lint** (if configured): `npm run lint`

## Pre-deploy

5. **Build**: `npm run build`
6. **Database**: Review Prisma migration diff; run `npx prisma migrate deploy` in staging first.
7. **Seed** (non-production only): `npx prisma db seed` when demo data must refresh.
8. **E2E smoke** (optional but recommended): start app (`npm run dev`), then `npm run test:e2e` after `npx playwright install`.

## Deploy

9. **Vercel preview**: Validate critical paths (login, dashboard shell, help, public storefront if applicable).
10. **Production**: Promote after preview sign-off.
11. **Post-deploy smoke**: Login, open Order Hub, open Integrations, confirm webhooks page reachable.

## Version bump

- Update `lib/version.ts` `APP_VERSION` and root `CHANGELOG.md`.
- Align `package.json` `version` on tagged releases.

## Rollback

- Revert deployment in hosting UI or redeploy previous Git SHA.
- If schema migrated forward, coordinate DB rollback or forward-fix migration.
