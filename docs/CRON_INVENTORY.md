# Cron route inventory

**Active App Router routes:** 16 production (`app/api/cron/**/route.ts`) — Era 4 Cycle 4 archived **121** experimental handlers to `archive/cron-routes/` (policy `era4-active-production-only-v1`).  
**Auth:** `runCronRoute` → `CRON_SECRET` Bearer.  
**Production allowlist (code):** `services/cron/production-manifest.ts` — only these slugs run in `NODE_ENV=production` without `ENABLE_EXPERIMENTAL_CRONS=true`. Archived experimental slugs are not registered as App Router routes unless restored.  
**Vercel schedules:** must match the allowlist — see `vercel.json` (do not schedule experimental slugs).

## Pilot production cron list (Vercel — 10 slugs)

Source: `services/cron/production-manifest.ts` · validate: `npx tsx scripts/validate-production-crons.ts`

| Slug | Schedule (UTC) | Criticality | Monitor |
|------|----------------|-------------|---------|
| `webhook-jobs` | `*/5 * * * *` | **P0** | Queue depth / 5m miss |
| `storefront-edge-sync` | `*/2 * * * *` | **P0** | DLQ / sync lag |
| `storefront-cart-recovery` | `*/30 * * * *` | P1 | Error rate |
| `storefront-theme-publish` | `*/15 * * * *` | P1 | Failed publishes |
| `reminders` | `0 14 * * *` | P1 | Daily absence |
| `storefront-domain-recheck` | `0 */6 * * *` | P1 | TLS failures |
| `storefront-webhook-retention` | `15 4 * * *` | P2 | Job failure |
| `storefront-team-invite-reminders` | `0 10 * * *` | P2 | — |
| `storefront-invite-audit-retention` | `0 3 * * 0` | P2 | Weekly |
| `storefront-ga4-parity` | `30 */6 * * *` | P2 | Parity drift |

## Production (operate in all environments)

| Route | Purpose |
|-------|---------|
| `webhook-jobs` | Process async webhook queue |
| `reminders` | Scheduled reminders |
| `storefront-domain-recheck` | Custom domain DNS/TLS checks |
| `storefront-cart-recovery` | Abandoned cart emails |
| `storefront-theme-publish` | Scheduled theme publishes |
| `storefront-team-invite-reminders` | Invite nudges |
| `storefront-webhook-retention` | Trim old webhook payloads |
| `storefront-invite-audit-retention` | Audit retention |
| `storefront-ga4-parity` | Analytics parity checks |
| `storefront-edge-sync` | Edge experiment / CDN sync |

## Storefront experiments (production feature flag)

Routes prefixed `storefront-experiment-*` (auto-conclude, SRM, holdout, edge-sync, reports, etc.).  
Treat as **Experiment** — enable only when theme experiments are in use.

## Regulatory / compliance scaffold (experimental)

Routes matching: `soc2-*`, `fedramp-*`, `iso*`, `pci-*`, `hipaa-*`, `eu-ai-*`, `nist-*`, `cmmc-*`, `irap-*`, etc.  
**Type:** Scaffold — gated by `ENABLE_EXPERIMENTAL_CRONS`. Not a substitute for real compliance programs.

## Novelty / research scaffold (experimental)

Routes matching: `hypergraph-*`, `multiverse-*`, `omniverse-*`, `organoid-*`, `dtn-*`, `martian-*`, `galactic-*`, `brainstem-*`, `thalamus-*`, etc.  
**Type:** Experiment — no product SLA; safe to skip in ops monitoring.

## Archive (PR-D phase 2)

Experimental routes can be moved off the App Router tree after ops sign-off:

- `npm run cron:archive:status`
- `npm run cron:archive:experimental` (dry-run)
- `docs/CRON_ARCHIVE_RUNBOOK.md`

## Maintenance

1. Active routes: `npm run validate:cron-inventory`
2. Compare production count to allowlist (10).
3. Rotate `CRON_SECRET` quarterly; update Vercel cron headers.
4. See `docs/runbooks/CRON_FAILURE_RUNBOOK.md` for failures.
