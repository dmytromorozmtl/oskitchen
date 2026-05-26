# Sales channels — 1000% ready report

## Finalized in this iteration

- **Registry split:** `channel-types`, `channel-capabilities`, `channel-status`, `channel-permissions`, enricher, `CHANNEL_REGISTRY_ENTRIES`
- **Command center UI:** Overview KPIs (live count, credential gaps, partner gates, health estimate, next action, revenue/order slices), reusable `ChannelCard`, mapping hub page, webhook URL card outside plan gate, analytics + health upgrades, connected page cards
- **Security:** Credential audit logging (`ChannelCredentialAudit`) + `maskSecret` helper; Prisma migration for setup/audit tables + webhook index
- **Sync ledger:** WooCommerce sync routes emit `ChannelSyncJob` via `sync-orchestrator`
- **Services:** `services/channels/test-connection.ts` (server-side probe core)
- **Docs:** `SALES_CHANNELS_FINAL_AUDIT.md` + topic FINAL docs + this report

## Channels supported (honest)

| Channel | Support level | Notes |
|---------|---------------|-------|
| KitchenOS storefront | LIVE_READY | Native |
| Manual orders | MANUAL_ONLY | Native |
| WooCommerce | BUILDABLE_WITH_CREDENTIALS | Live path with encryption + webhooks |
| Shopify | BUILDABLE_WITH_CREDENTIALS | Live path with encryption + webhooks |
| Uber Eats / Uber Direct | PARTNER_REQUIRED | Placeholder / gated — no fake live |
| DoorDash / POS placeholders | COMING_SOON / PARTNER_REQUIRED | Roadmap cards |
| CSV import | LIVE_READY | Import center |
| Google Forms / Email | COMING_SOON / DEMO_ONLY | Honest manual patterns |
| Catering / bar / bakery / café cards | LIVE_READY | Native workflows |

## Live-ready vs placeholder

- **Live-ready today:** Storefront, manual, CSV, WooCommerce, Shopify (with credentials + webhooks), native catering/bar/bakery/café patterns
- **Placeholder / partner:** Uber Eats marketplace, Uber Direct, DoorDash, Square, Toast, Clover, Lightspeed, Google Forms, email parser
- **Next integrations recommended:** Finish Shopify sync ledger parity; DoorDash/Toast/Square behind real OAuth + partner programs; optional dedicated `SalesChannel` table if multi-connection per provider is required

## Migrations

Apply `20260507193000_channel_setup_and_credential_audit` to environments using Prisma migrate.

## Verification

- `npm run typecheck` ✅  
- `npm run build` ✅ (after clean `.next` if webpack cache glitches)

## Remaining limitations

- Workspace health + per-card health numbers are **heuristic estimates**
- Setup wizard shell writes progress table only when actions are added — schema is ready
- Webhook replay / redacted payload viewer still minimal; event table is the source of truth

KitchenOS does **not** claim third-party marketplace certification anywhere in this module.
