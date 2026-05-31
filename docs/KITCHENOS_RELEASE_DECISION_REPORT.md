# OS Kitchen release decision report

## Positioning
**Recommended:** **Closed beta / paid pilot** for meal prep / preorder operators with white-glove onboarding. **Not recommended:** broad self-serve enterprise claims.

## Shipped in this pass (high level)
- Prisma **`webhook_processing_jobs`** + Woo async path behind `WEBHOOK_ASYNC_QUEUE` + cron route + `vercel.json` schedule.
- **Capability matrix** code + UI on integration health, sales channels, platform webhooks, integrations hub.
- **Pilot navigation** profile + README/CI Node 22 alignment.
- **Beta rate limiting** + `/api/health` queue/observability hints + observability stubs.
- **Trust status** page, **platform runbooks** index, **legal data-rights** template.
- **Entitlement service restored** (accidentally touched during scaffolding — fully rebuilt with snapshot/overrides/downgrade blockers).
- **Honesty copy** on Uber pages, CSV/POS maturity rows, pricing FAQ.

## Still roadmap / partial
- Shopify/Stripe async webhook workers (inline default remains).
- Audited webhook replay with audit events.
- Full Sentry/OTEL SDK wiring (DSN hook logs only).
- Org-level Stripe billing automation.
- Comprehensive server-action scope audit.

## 30 / 60 / 90 engineering roadmap (summary)
- **30d:** webhook replay action + contract tests; expand rate limits; Shopify async queue; staging soak.
- **60d:** import/export worker + storage; observability dashboards; E2E signup→order.
- **90d:** org billing schema; SSO evaluation; integration health automation.

## QA result
Green automated gate; staging migration + cron verification still operator-owned.

**Decision:** **Approve paid pilot** only with written scope matching capability matrix + legal gate + staging webhook cron validation.
