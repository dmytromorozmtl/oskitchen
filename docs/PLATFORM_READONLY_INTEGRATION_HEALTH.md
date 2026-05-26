# Platform read-only integration health

## Route

`/platform/workspaces/[workspaceId]/integration-health`

## Access

- `requirePlatformAccess` via platform layout + `assertPlatformPermission(ctx, "platform:workspaces:read")`.
- No impersonation; no credential editing; no destructive actions.

## Audit

- Emits `PLATFORM_INTEGRATION_DIAGNOSTICS_VIEWED` only.
- Does **not** emit replay/retry audit strings unless a future server mutation runs.

## Data

- `loadPlatformWorkspaceIntegrationHealth` loads owner `IntegrationConnection` rows, `kitchenSettings.demoMode`, unprocessed `WebhookEvent` summaries (no `payloadJson`), and host infrastructure rows via `infrastructureMaturityRows(getServerEnv())`.
- `ChannelCard` uses `mode="readOnly"` — hides webhook URLs and dashboard CTAs.

## Navigation

- Links: `/platform/integrations`, `/platform/webhooks`, `/platform/support`, `/platform/error-recovery`, parent workspace.
