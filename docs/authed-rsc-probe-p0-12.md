# P0-12 — Authenticated dashboard RSC probe

**Policy:** `p0-12-authed-rsc-probe-v1`

Post-login smoke that hits **46 pilot-critical dashboard routes** in both **document** and **RSC flight** modes. Each probe must return HTTP 2xx/3xx with no Server Components crash text.

## Flow

1. Supabase `signInWithPassword` → session cookie (`sb-*-auth-token`)
2. For each route in `AUTHED_DASHBOARD_RSC_SMOKE_ROUTES`:
   - `GET` with `Accept: text/html` (document)
   - `GET` with `RSC: 1` + `Accept: text/x-component` (flight)
3. Fail on HTTP ≥400, HTTP ≥500, or RSC failure patterns (`Something went wrong`, etc.)

## Commands

```bash
# Full 46-route probe (requires E2E creds + Supabase env)
npm run smoke:rsc-authed-dashboard

# Single route
npx tsx scripts/probe-authed-dashboard.ts /dashboard/today

# Policy + wiring gate (CI quality job)
npm run check:authed-rsc-probe-p0-12
```

## CI

| Workflow | Job | When |
|----------|-----|------|
| `.github/workflows/ci.yml` | `authed-rsc-smoke` | PR + push when E2E secrets present |
| `.github/workflows/rsc-smoke.yml` | `rsc-smoke` | PR + daily schedule + manual |

Required secrets: `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD` (or `E2E_PASSWORD`), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Optional: `RSC_SMOKE_BASE_URL` or `E2E_STAGING_BASE_URL` (default `https://os-kitchen.com`).

## Artifact

`artifacts/authed-rsc-probe-p0-12.json` — wiring registry (route count, probe modes, npm script, workflows).
