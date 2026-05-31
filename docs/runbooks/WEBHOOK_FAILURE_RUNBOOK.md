# Webhook failure runbook

## Symptoms
- Webhooks show as unprocessed in Integration health / Error recovery
- Provider retries (Shopify/Woo) or customer reports missing orders
- `WebhookEvent.processingError` populated

## Owner
- On-call engineer or platform admin for multi-tenant signals

## First checks
1. Confirm `CRON_SECRET` and cron routes if `WEBHOOK_ASYNC_QUEUE=true` (WooCommerce + Shopify async).
2. Inspect latest `webhook_events` rows for `signature_valid` and error preview (sanitized in UI).
3. Verify connection status on Sales channels — disabled connections reject or no-op.

## Safe actions
- Fix credentials / rotate webhook secrets in provider + OS Kitchen.
- Use **audited replay** from Platform → Webhooks or Dashboard → Webhook activity (requires reason; may duplicate commerce writes — break-glass only).
- Re-deliver from provider where supported when replay is not appropriate.

## Escalation
- If DB errors or Prisma timeouts recur, treat as scale incident — consider enabling async queue + lowering inline volume.

## Customer communication template
> We detected a delay processing orders from [channel]. Signatures and credentials are being verified; no action needed from you unless we follow up.

## Postmortem notes
- Capture provider delivery IDs, fix root cause, link to `docs/WEBHOOK_QUEUE_RETRY_ARCHITECTURE.md`.
