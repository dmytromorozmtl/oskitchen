# Background Jobs

## Existing models (Prisma)

- `ChannelSyncJob`
- `ImportJob` / previews / errors
- `ExportJob`

## Developer surfaces

`/dashboard/developer/jobs` and related pages list operational jobs.

## Completion layer stance

No new generic `BackgroundJob` table added in this pass (keeps Prisma stable). Future consolidation would:

1. Normalize status enums (`QUEUED`, `RUNNING`, `FAILED`, `SUCCEEDED`)
2. Attach `workspaceId`, `createdById`, `failureReason`, `progress`
3. Mirror failures into Error Recovery center
