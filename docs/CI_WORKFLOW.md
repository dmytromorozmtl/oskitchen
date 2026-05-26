# CI workflow

## Location

`.github/workflows/ci.yml`

## Triggers

- Pull requests
- Pushes to `main`

## Steps

1. `actions/checkout@v4`
2. `actions/setup-node@v4` with **Node 22** (matches `package.json` engines) and npm cache
3. `npm ci`
4. `npm run verify:install-chain`
5. `npm run typecheck`
6. `npm run build`
7. `npm run lint`
8. `npm test`
9. `npm run check-demo-scenarios`

## Optional DB demo audit

Uncomment the final job block in `ci.yml` when repository secrets exist:

- `DEMO_CI_DATABASE_URL`
- `DEMO_AUDIT_WORKSPACE_ID`
- `DEMO_DB_AUDIT_ALLOW_PRODUCTION` (only if intentionally auditing production-shaped hosts)

## Notes

- Workflow does not mutate databases or call partner APIs.
- Build may require standard Next/Prisma env vars configured as GitHub Actions **secrets** or **variables** for your hosting policy.
