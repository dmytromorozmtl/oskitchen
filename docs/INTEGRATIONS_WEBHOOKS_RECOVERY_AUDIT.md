# KitchenOS — Integrations, Webhooks & Error Recovery Audit

**Date:** 2026-05-15

---

## 1. Capability matrix (honest positioning)

Canonical references:

- `docs/HONEST_CAPABILITY_MATRIX.md`
- `lib/channels/channel-registry.ts` (provider metadata, `mapsToIntegrationProvider`, setup types)
- Landing `components/landing/features.tsx` (explicit Stripe Terminal non-integration)

**Rule:** Uber/SMS/external POS placeholders must remain visibly “setup / roadmap” in UI — do not imply shipped hardware integrations.

---

## 2. Webhook ingress

| Provider | Route examples | Notes |
|----------|----------------|-------|
| Stripe | `/api/webhooks/stripe` | Subscription + payment events — verify signature. |
| Shopify | `/api/webhooks/shopify/*` | Async job enqueue patterns — see architecture doc. |
| WooCommerce | `/api/webhooks/woocommerce` | Shared async processing. |
| Resend | `/api/webhooks/resend` | Email events. |
| Uber | `/api/webhooks/uber-*` | Treat as staging-only until product declares GA. |

---

## 3. Async jobs & cron

- Table / enum: `WebhookProcessingJobStatus` in Prisma schema.
- Cron drain: `app/api/cron/webhook-jobs/route.ts` requires `Authorization: Bearer ${CRON_SECRET}`.
- **Failure modes:** Missing `CRON_SECRET` → 503 (safe).

---

## 4. Replay & retries

- Replay server action: `actions/webhook-replay.ts` — **platform** gated via `requirePlatformAccess()`.
- Workspace-side repair buttons exist with permission keys (`lib/integrations/integration-action-availability.ts`).

**Audit expectation:** Replay always writes audit metadata with sanitized reason (`audit-reason-service`).

---

## 5. Error recovery UI

- Dashboard: `/dashboard/error-recovery`
- Platform: `/platform/error-recovery`
- Doc: `docs/FAILED_WEBHOOK_TO_ERROR_RECOVERY.md`

**Gap (P2):** Stale job heartbeat — add “last processed” column widget if not present everywhere.

---

## 6. Rate limiting vs retries

- Risk: aggressive global rate limiting could slow legitimate provider retries — tune per-route policies (`lib/rate-limit/rate-limit-policies.ts`).
- **P2:** separate webhook ingress limits from public form POST limits.

---

## 7. Payload redaction & idempotency

- Services: `webhook-redaction-service`, `webhook-ingest-service`.
- Idempotency keys should be provider-native event IDs where available — verify per handler (**P1** engineering checklist).

---

## 8. Staging verification checklist (manual)

1. Fire Shopify test order webhook → job `QUEUED` → cron `PROCESSED` or actionable `FAILED` with error recovery item.
2. Invalidate signature → `SIGNATURE_FAILED` without data mutation.
3. Replay from platform → audit row + sanitized reason.

---

## 9. Fixes applied this pass

- None to integration logic (scope-safe). Tests + docs strengthened elsewhere.
