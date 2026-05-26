# Unified Activity Timeline

## Components & services

| Path | Responsibility |
|------|------------------|
| `lib/activity/activity-types.ts` | `ActivityTimelineItem` |
| `services/activity/activity-service.ts` | `listActivityForEntity`, `listRecentWorkspaceActivity` |
| `components/activity/activity-timeline.tsx` | Presentational timeline |

## Data source

`AuditLog` rows filtered by `userId` + optional `entityId`. Secrets are **not** rendered; only `action`, `entityType`, `entityLabel`, `severity`, `route`, timestamps.

## Future

- Typed taxonomy for `action` / `category`
- Workspace-level feeds for multi-user workspaces (use `workspaceId` once consistently populated)
