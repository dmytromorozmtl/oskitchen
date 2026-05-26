# Data retention policy (draft)

This document explains **what KitchenOS stores**, **how tenants export**, and **how deletion should work**. Legal counsel must review before publishing externally.

## Stored categories

- **Workspace identity:** profiles, subscription metadata, Stripe ids.
- **Operational data:** menus, orders, production tasks, packing logs, routes, inventory snapshots.
- **Integrations:** OAuth tokens + webhook payloads referenced by sync jobs (encrypted at rest where Supabase/Postgres policies apply).
- **Growth telemetry:** anonymous usage events + lifecycle audit rows tied to users.

## Export paths

Owners may download CSV bundles via `/dashboard/settings` export card hitting `/api/export` with scoped types (`orders`, `customers`, `products`, `integrations_metadata`). Metadata exports omit secrets.

## Deletion workflow (placeholder)

Account deletion should cascade workspace-owned rows **after** Stripe cancellation confirmation. Until automated deletion ships, route requests through support with a written checklist (disconnect integrations → cancel billing → purge tenant rows).

## Legal review checklist

- GDPR/CCPA timelines & subprocessors list.
- Uber / Shopify / Woo third-party DPAs.
- Marketing claims vs actual retention windows.
