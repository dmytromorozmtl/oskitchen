# Integration + webhook ops — Finalization

## Status vocabulary (honest)

Use discrete labels such as: `LIVE`, `BETA`, `SETUP_READY`, `PARTNER_ACCESS_REQUIRED`, `PARTIAL`, `DEV_ONLY`, `ROADMAP`, `NOT_AVAILABLE`.

Each integration card should show:

- Actual status (never “live” unless truly production-supported in this deployment).
- Supported vs unsupported data flows (explicit bullets).
- Setup checklist + docs link.
- Last sync / last error (when instrumented).
- Failed webhook count (surface zero vs omit — do not hide failures).

## Webhook operations

- **Payload preview** — sanitized; strip secrets, signatures, authorization headers.
- **Replay** — only when safe; always emit **audit** event on replay.
- **Signature status** — valid / invalid / skipped (with honest reason).

## Surfaces

- `/dashboard/integration-health`
- `/dashboard/sales-channels`
- `/platform/integrations`
- `/platform/webhooks`
- `/dashboard/error-recovery`

## Priority

- P1: Observability + honest labeling.  
- P0: Leaking secrets in previews — release blocker if found.
