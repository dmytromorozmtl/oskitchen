# Cron archive runbook (PR-D phase 2)

Experimental `/api/cron/*` routes are **already blocked in production** (`runCronRoute` → 404 without `ENABLE_EXPERIMENTAL_CRONS`). This runbook removes them from the App Router tree to shrink build surface and serverless bundle size.

## When to run

- **After** 2 weeks of zero production 404/scan noise on experimental cron paths (or explicit founder sign-off).
- **Never** archive production allowlist slugs (`services/cron/production-manifest.ts`).
- Staging/dev may use `ENABLE_EXPERIMENTAL_CRONS=true` — coordinate with anyone running experiment crons locally.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run cron:archive:status` | Active vs archived counts |
| `npm run cron:archive:experimental` | Dry-run: list slugs to move |
| `CONFIRM_CRON_ARCHIVE=1 npm run cron:archive:experimental -- --execute` | Move all experimental routes |
| `npm run cron:archive:experimental -- --execute --slug=my-cron` | Archive one slug (no bulk confirm) |
| `npm run cron:restore:archived -- --execute` | Restore all from manifest |
| `npm run cron:restore:archived -- --execute --slug=my-cron` | Restore one |

## What moves where

```
app/api/cron/{slug}/route.ts   →   archive/cron-routes/{slug}/route.ts
```

Next.js no longer registers archived paths. Manifest: `config/cron-archive-manifest.json`.

## CI

- `npm run validate:cron-inventory` — counts only **active** routes under `app/api/cron/`.
- After archive, experimental count should drop (target: **0** active experimental, **~121** archived).

## Rollback

```bash
npm run cron:restore:archived -- --execute
```

Verify:

```bash
npm run validate:cron-inventory
npm run validate:production-crons
```

## Related

- `docs/CRON_INVENTORY.md` — production allowlist
- `services/cron/cron-route-inventory.ts` — disk inventory
- `lib/api/run-cron.ts` — runtime gate
