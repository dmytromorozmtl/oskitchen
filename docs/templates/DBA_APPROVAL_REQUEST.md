# DBA Approval Request — Workspace Remediation Migrations

**To:** Database / Platform team  
**From:** OS Kitchen Engineering  
**Date:** _____________  
**Ticket:** _____________

## Summary

We request approval to run **two additive PostgreSQL migrations** on **staging**, then **production** after smoke passes.

| Migration | Change | Risk |
|-----------|--------|------|
| `20260517120000_workspace_phase1_order_menu_product` | `workspace_id` on orders, menus, products + indexes | LOW |
| `20260517140000_workspace_phase2_integration_webhook` | `workspace_id` on integration_connections, webhook_events | LOW |

## Why

Multi-tenant workspace isolation for orders and integrations (closed beta requirement).

## Pre-requisites

- [ ] Staging snapshot / PITR verified
- [ ] `DIRECT_URL` uses session pooler port **5432**
- [ ] Maintenance note posted (index creation — brief lock possible)

## Deploy sequence (post-approval)

```bash
npx prisma migrate deploy
npm run backfill:workspace-id
npm run backfill:workspace-phase2
npm run check:backfill
```

## Rollback

Columns are **nullable**; application tolerates NULL until backfill. Rollback = revert app deploy; columns can remain without data loss.

## Attachment

Full packet: run `npm run dba:migration-review` → `docs/artifacts/DBA_MIGRATION_PACKET.md`

---

**Approved:** _________________ **Date:** _________
