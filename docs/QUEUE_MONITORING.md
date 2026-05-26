# Queue & Job Monitoring

## Sources

- **Channel sync** — `channel_sync_jobs` (`PENDING`, `RUNNING`, `FAILED`).
- **Channel imports** — `channel_import_batches` active statuses vs `FAILED`.
- **Import center** — `import_jobs` non-terminal statuses.
- **Exports** — `export_jobs` `QUEUED` / `RUNNING` / `FAILED`.

## UI

- `/dashboard/developer/jobs` — card layout with counts.

## Next steps

- Row-level inspect with redacted payloads, retry/cancel server actions with audit + rate limits.
