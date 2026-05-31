# Sales channels — final audit (OS Kitchen)

This audit covers the **Channel command center** (`/dashboard/sales-channels`) and supporting libraries. Priorities: **P0** critical, **P1** high value, **P2** polish, **P3** future.

| Area | Current state | Missing | Business risk | Technical risk | Recommended fix | Priority |
|------|---------------|---------|---------------|----------------|-----------------|----------|
| **UI** | Overview, connected, available, attention, sync jobs, webhooks, mapping hub, analytics, health, settings stub; `ChannelCard` component; subnav tabs. | Richer per-channel drill-down; replay/mark-resolved in UI; charts library for trends. | Operators may still open multiple legacy pages. | Low | Keep consolidating deep links; add optional detail drawer. | P2 |
| **Data models** | `IntegrationConnection`, `ExternalOrder`, `ExternalProduct`, `WebhookEvent`, `ChannelSyncJob`, `ProductMapping`, `IntegrationHealthCheck`; **new** `ChannelSetupProgress`, `ChannelCredentialAudit`. | Dedicated `SalesChannel` aggregate table; `ChannelHealthCheck` separate from integration health; `ChannelEvent` stream. | Reporting keyed only off connections + orders. | Medium | Phase in `SalesChannel` only if multi-connection-per-provider is required. | P3 |
| **Channel registry** | Single catalog `CHANNEL_DEFINITIONS` + `CHANNEL_REGISTRY_ENTRIES` via `enrich-channel-registry-entry`; split types in `channel-types.ts`, capabilities, status labels, permissions. | Per-tenant overrides in DB; versioned registry. | Marketing copy drift vs product. | Low | CI check that webhook routes in registry match `app/api/webhooks/*`. | P2 |
| **Setup flows** | Dynamic `/dashboard/sales-channels/[providerKey]/setup`; legacy Woo/Shopify/Uber pages. | Unified 8-step wizard shell writing `ChannelSetupProgress`. | Setup fatigue. | Low | Server actions to upsert setup progress after each step. | P1 |
| **Credential storage** | AES-256-GCM via `lib/crypto.ts`; masked UI patterns; **audit** on save/disconnect. | Rotate flow UI; “last tested” persisted on connection. | Credential leakage if ENCRYPTION_KEY missing in prod. | **High** if misconfigured | Fail closed in prod (already enforced in save actions). | P0 |
| **Webhook routes** | Existing `/api/webhooks/*` unchanged; hub lists URLs + log. | Redacted payload viewer; replay guarded. | Partner retries storming imports. | Medium | Rate limit + idempotency keys (partially via external IDs). | P1 |
| **Sync jobs** | WooCommerce order/product sync writes `ChannelSyncJob` rows via `sync-orchestrator`. | Shopify sync routes wired to same ledger; retry UI. | Blind spots on partial syncs. | Medium | Extend Shopify sync routes like Woo. | P1 |
| **Order normalization** | `lib/order-normalization` + persist pipeline. | Stricter validation gates before Order Hub promotion. | Bad totals in kitchen. | Medium | Central Zod schema shared webhook + sync. | P1 |
| **Product mapping** | `/dashboard/sales-channels/mapping` summary + `/dashboard/product-mapping` workbench. | Auto-suggest queue from sync failures. | Slow onboarding for ecommerce. | Low | Background job to enqueue suggestions. | P2 |
| **Channel health** | Workspace heuristic score + per-connection manual checks. | Store automated probe results in `IntegrationHealthCheck` only today. | False confidence. | Low | Document “estimate” label (done in UI). | P2 |
| **Analytics** | Real aggregates: orders/revenue slices, external rows, sync status histogram. | Time-series charts; cohort by brand. | Limited strategic insight. | Low | Add query for last 30 days using SQL date_trunc. | P2 |
| **Business mode adaptation** | `channelsRecommendedForBusinessType` in registry. | Surface recommendations on Available tab cards. | Missed upsell to right channel. | Low | Pass `kitchen.businessType` into available page. | P2 |
| **Permissions** | `canManageChannelCredentials` + super-admin bypass constant. | Staff role flag in DB for credential manage. | Insider credential abuse. | Medium | Add `KitchenModulePreference` or role flag when product ready. | P2 |
| **Super-admin** | `workspace.moroz@gmail.com` via `isSuperAdminEmail`. | None for channel visibility. | N/A | Low | Keep aligned with billing bypass. | P0 |
| **Docs** | This audit + `CHANNEL_REGISTRY_FINAL` + `SALES_CHANNELS_1000_PERCENT_READY_REPORT` + topic FINAL stubs. | Video walkthrough. | Support load. | Low | Loom-style internal recording. | P3 |
| **QA** | `SALES_CHANNELS_QA_FINAL.md` matrix. | Playwright for hub smoke. | Regressions on nav. | Medium | Add e2e: load overview + webhooks. | P2 |

## Summary

P0 items are **encryption configuration**, **honest integration labels**, and **super-admin consistency** — these are in place. P1 focuses on **Shopify sync ledger parity**, **webhook tooling**, and **setup progress persistence**. P2+ is polish, analytics depth, and optional new tables.
