# Honest capability matrix

**Source of truth (code):**
- `lib/capabilities/capability-status.ts` — tier union
- `lib/capabilities/capability-matrix.ts` — row definitions + env-aware Stripe/Resend/Maps/OpenAI
- `lib/capabilities/capability-copy.ts` — labels + footnote
- `services/capabilities/capability-service.ts` — `listCapabilities()`
- `components/capabilities/*` — `CapabilityMatrixPanel`, badges, disclaimer

**Wired surfaces:** `/dashboard/integration-health`, `/dashboard/sales-channels`, `/platform/webhooks`, `/integrations` hub.

**Rule:** marketing and dashboard must not contradict the matrix without updating the matrix first.
