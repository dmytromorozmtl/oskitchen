# Demo scenario DB audit

## Commands

```bash
export DEMO_AUDIT_WORKSPACE_ID="<workspace-uuid>"
npm run check-demo-scenarios:db
# or
npx tsx scripts/check-demo-scenarios-db.ts --workspace=<workspace-uuid>
```

## Safety

- **Read-only** — counts and presence checks only.
- **Production**: exits with code `2` when `NODE_ENV=production` unless `DEMO_DB_AUDIT_ALLOW_PRODUCTION=true`.
- **Demo gate**: owner `kitchenSettings.demoMode` must be **true** or the run fails fast (prevents accidental audits of live tenants).
- **`--seed`**: not implemented; passing it prints a warning and performs **no** writes.

## Scenarios

Golden scenarios from `lib/demo/golden-demo-scenarios.ts` are checked against pragmatic Prisma counts (menus, orders, POS, catering quotes, external channel rows, brands, etc.).

- **WARN** — optional signal missing; message explains “Model not implemented yet” or seed gap.
- **FAIL** — hard missing row classes for that narrative (e.g., zero orders when required).

Exit code `1` if any scenario ends in **FAIL**.

## CI

Default GitHub Actions workflow **does not** run DB audit (needs `DATABASE_URL` + workspace id). See commented block in `.github/workflows/ci.yml`.
