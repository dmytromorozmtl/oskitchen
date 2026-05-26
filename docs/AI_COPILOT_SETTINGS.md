# Copilot settings

Route: `/dashboard/copilot/settings`.

## Stored on `CopilotSettings`

| Field | Default | Notes |
|-------|---------|-------|
| `aiNarrativeEnabled` | `true` | When `false`, copilot pages only show deterministic bullets. |
| `deterministicOnly` | `false` | Hard switch — overrides `aiNarrativeEnabled` if set. |
| `redactionLevel` | `PII_REDACTED` | Applies to all outbound AI calls. |
| `requireApprovalAll` | `true` | When `true`, no action draft can execute without human approval. |
| `maxContextRows` | `50` | Cap on rows summarised from any one source. |
| `summaryRetentionDays` | `30` | Future use — when we add scheduled summary cleanup. |
| `privacyDisclaimer` | `null` | Optional custom text shown to the operator. |
| `allowedSourcesJson` | `null` | Future — per-workspace source allow-list. |
| `allowedActionsJson` | `null` | Future — per-workspace action-draft allow-list. |

## What we never store

- `OPENAI_API_KEY`. The key is read at request time from
  `getServerEnv()` and never echoed back to the client.
- Raw prompts or AI replies for offline review. They live on
  `CopilotMessage` rows with a redaction level annotation.

## Provider status

The settings page shows `OPENAI_API_KEY configured: yes/no` with the
boolean derived from `getServerEnv()`. The key value itself is never
rendered.

## Who can manage

Only roles with `copilot.settings.manage` (owner, manager, admin,
superadmin) can hit the settings form. Other roles see a permission-
denied card.

## Audit

Every settings change writes a `settings_changed` audit row with the
*shape* of the patch (which fields were touched), never sensitive
values.
