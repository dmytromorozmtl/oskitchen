# Sales channels — platform ready report

## Shipped

- **Channel operations center:** `/dashboard/sales-channels` (overview, KPIs, recommended strip, attention, all channels, recent webhooks).
- **Subnav:** Connected, Available, Needs attention, Sync jobs, Webhooks, Mapping (redirect), Analytics, Health, Settings.
- **Registry:** `lib/channels/channel-registry.ts` — storefront, manual, Woo, Shopify, Uber Eats/Direct, DoorDash/Square/Toast/Clover/Lightspeed placeholders, CSV, Google Forms, email, catering/bar/bakery/café patterns.
- **Runtime:** `lib/channels/channel-runtime.ts` — merges registry + `IntegrationConnection` for honest statuses and next actions.
- **Metrics:** `lib/channels/sales-channel-metrics.ts`.
- **Quick manual order:** `/dashboard/orders/quick`.
- **Placeholder setup:** `/dashboard/sales-channels/[providerKey]/setup` with partner/roadmap honesty; live providers redirect to existing integration pages.
- **Prisma:** `ChannelSyncJob` model + migration `20260515120000_channel_operations_center` (sync job log — populate from sync endpoints as a follow-up).
- **Navigation:** Sidebar + command palette + module gate use `/dashboard/sales-channels` (legacy `/dashboard/integrations` still allowed prefix).
- **Legacy:** `/dashboard/integrations` → redirect to hub; deep setup routes unchanged.

## Live-ready (no exaggeration)

- KitchenOS storefront, manual orders, WooCommerce, Shopify (credentials + webhooks as implemented).
- CSV / import center path.
- Catering / event flows via native modules.

## Placeholder / partner-required

- Uber Eats, Uber Direct (checklist + partial API stubs as already in repo).
- DoorDash, Square, Toast, Clover, Lightspeed, Google Forms, email parser.

## Docs

- `docs/SALES_CHANNELS_DEEP_AUDIT.md`
- `docs/CHANNEL_REGISTRY.md`
- `docs/WOOCOMMERCE_CHANNEL_SETUP.md`
- `docs/SHOPIFY_CHANNEL_SETUP.md`
- `docs/MARKETPLACE_POS_CHANNELS.md`
- `docs/SALES_CHANNELS_SECURITY.md`
- `docs/SALES_CHANNELS_QA.md`
- `docs/ORDER_NORMALIZATION.md`

## Next recommended work

1. Emit `ChannelSyncJob` rows from WooCommerce/Shopify sync routes with counts + errors (no secrets).
2. Optional `integration_connections.health_score` column once migration strategy agreed.
3. Payload viewer with redaction for support-only role.
4. Wire email-intake placeholder to optional OpenAI assist behind explicit env + consent.
