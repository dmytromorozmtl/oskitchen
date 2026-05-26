# Webhook error preview redaction pass

## Surfaces updated

| Surface | Change |
|---------|--------|
| `/platform/webhooks` | `toSafeErrorPreview` + `SensitiveErrorPreview`; no payload column. |
| `/platform/integrations` | Aggregate `lastError` samples redacted server-side; maturity table shows redacted hint. |
| `/platform/workspaces/[id]/integration-health` | Owner queue previews from `loadPlatformWorkspaceIntegrationHealth` (redacted + flag). |
| `/dashboard/integration-health` | Unprocessed webhook card shows redacted preview (shorter max length than platform). |
| `/dashboard/integrations/webhooks` | Same for legacy webhook log. |
| `/dashboard/sales-channels/webhooks` | Same for sales-channel webhook log. |

## Rules

- **Workspace users**: shorter previews (`maxLength ≈ 120`) after redaction.
- **Platform users**: slightly longer previews (`maxLength ≈ 160`) where applicable.
- **Payload JSON**: still not rendered in these views.
- **Auth headers / secrets**: never added to tables.

## Components

- `components/integrations/sensitive-error-preview.tsx` — shared redacted label.
- `lib/security/sensitive-redaction.ts` — redaction engine.
