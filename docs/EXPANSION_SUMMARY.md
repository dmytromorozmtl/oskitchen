# Expansion summary (integrations pass)

## What was added

- **Prisma**: Integration enums/models (`IntegrationConnection`, `ExternalOrder`, `ExternalProduct`, `OrderChannel`, `WebhookEvent`, `DeliveryDispatch`, `MenuChannelPublish`), `SubscriptionPlan.ENTERPRISE`, relations from `UserProfile`, `Menu`, `Order`, `Product`.
- **Encryption**: `lib/crypto.ts` (AES-256-GCM) + `ENCRYPTION_KEY` in `.env.example`.
- **Services**: `services/integrations/{woocommerce,shopify,uber-eats}.ts`, `services/delivery/uber-direct.ts`, `lib/order-normalization.ts`.
- **API**: WooCommerce & Shopify test/sync routes; webhooks (`/api/webhooks/woocommerce`, `/api/webhooks/shopify/*`, Uber Eats/Uber Direct stubs); `/api/delivery/*` placeholders.
- **Dashboard**: `/dashboard/integrations` (+ WooCommerce, Shopify, Uber Eats, Uber Direct, webhook log), `/dashboard/order-hub`, `/dashboard/analytics` (counters), nav + i18n updates.
- **Billing**: Enterprise tier card (contact sales); plan limits extended with `maxIntegrations`.
- **Docs**: Audit, architecture, setup guides, roadmap, launch checklist, this summary.

## Database

- New migration: `20260507180000_integrations_platform` (requires PostgreSQL 15+ for `ALTER TYPE ... ADD VALUE IF NOT EXISTS` on `SubscriptionPlan`).

## New routes (high level)

- UI: `dashboard/integrations`, `.../woocommerce`, `.../shopify`, `.../uber-eats`, `.../uber-direct`, `.../integrations/webhooks`, `dashboard/order-hub`, `dashboard/analytics`.
- API: under `/api/integrations/*`, `/api/webhooks/*`, `/api/delivery/*` as implemented in-repo.

## New environment

- `ENCRYPTION_KEY` — required to persist integration secrets.

## What works with real credentials

- **WooCommerce**: REST connectivity test, product/order sync, signed webhooks (`cid` query), external rows persisted.
- **Shopify**: GraphQL sync (limited page size), HMAC-verified webhooks for orders/products/uninstall.

## What needs partner / extra work

- **Uber Eats**: Credential storage + stub webhook; real order/menu APIs and signature schemes once Uber provisions access.
- **Uber Direct**: Quote/create/cancel return structured placeholders until customer API host & auth are wired.

## Placeholders / mocked

- Uber Direct delivery execution; Uber Eats normalization; programmatic Shopify webhook registration; WooCommerce programmatic webhook creation; analytics charts; strict plan enforcement on integration count.

## Next 30 days (suggested)

1. Import wizard: `ExternalOrder` → internal `Order` + line items with SKU/title matching (`lib/order-normalization.ts`).
2. Webhook replay & failure queue UX (`WebhookEvent.processed` already tracks state).
3. Menu channel publish UI backed by `MenuChannelPublish`.
4. Production batches + packing labels.
5. Billing meters for orders + integrations.

## Launch strategy

- Ship **Order hub + WooCommerce + Shopify** to design partners with staging stores.
- Keep Uber modules behind honest “partner access” messaging until credentials exist.
- Run `npm run db:migrate` / `migrate deploy`, rotate `ENCRYPTION_KEY` procedure documented before prod secret storage.
