# Cron surface — honesty checklist (ops / release)

**Policy:** `era14-cron-surface-recert-v1` (`lib/cron/cron-surface-era14-policy.ts`)

**Extends:** `era4-active-production-only-v1`, `era9-cron-surface-recert-v1`

**Posture:** **19 production** App Router crons only; **121+ experimental** handlers archived under `archive/cron-routes/`; **0** experimental routes on disk.

## Certified today

| Layer | What is proven | Evidence |
|-------|----------------|----------|
| Production allowlist | 16 slugs in `ALLOWED_PRODUCTION_CRON_SLUGS` | `services/cron/production-manifest.ts` |
| Disk parity | 16 routes under `app/api/cron/` | `validate:production-crons` |
| Experimental cap | 0 experimental App Router cron folders | `validate:cron-inventory` |
| Archive | 121+ slugs in `archive/cron-routes/` | `config/cron-archive-manifest.json` |
| Auth gate | Every active route uses `runCronRoute` | `tests/unit/cron-hygiene-live.test.ts` |
| Era 14 recert | Policy + pilot preflight honesty | `test:ci:cron-hygiene-era14:cert` |

## Not certified (honest gaps)

| Claim | Status |
|-------|--------|
| All archived experimental crons are production-safe | **False** — archived by design; blocked unless `ENABLE_EXPERIMENTAL_CRONS=true` |
| DoorDash sync cron is live marketplace integration | **Scheduled slug only** — not full DoorDash product certification |
| Experimental cron restoration without review | **Forbidden** — requires explicit era decision + inventory update |

## Automated certification smoke (local / pre-release)

```bash
npm run smoke:cron-surface
```

Runs `test:ci:cron-hygiene:cert` (era4 archive + era9 + era14 recert). For full reconciliation also run validators directly:

```bash
npm run validate:production-crons
npm run validate:cron-inventory
```

## Manual release / pilot checklist

1. `app/api/cron/` contains **exactly 16** production folders — no new experimental routes.
2. `ENABLE_EXPERIMENTAL_CRONS` is **not** `true` in pilot or production (`scripts/ops/pilot-preflight.sh`).
3. `vercel.json` cron schedules match `ALLOWED_PRODUCTION_CRON_SLUGS` only.
4. Do not market archived cron capabilities as live product features.
5. Reference `docs/CRON_INVENTORY.md` before enabling new schedules.

## CI certification

- `npm run test:ci:cron-hygiene-era14:cert` (chained in `test:ci:cron-hygiene:cert`)
- Governance: `test:ci:governance-bundles:partition-platform`
- Default `quality` job: `validate:production-crons` + `validate:cron-inventory`
