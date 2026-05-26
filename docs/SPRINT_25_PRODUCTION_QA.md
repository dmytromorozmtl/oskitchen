# Sprint 25 — production QA + CI hardening

**Date:** 2026-05-24 · **Status:** ✅ automated slice complete

## Delivered

| Item | Command / path |
|------|----------------|
| Production HTTP + DB preflight | `npm run smoke:production-tenant` |
| Default host | `https://os-kitchen.com` (ignores localhost / placeholder URLs) |
| Auth shell a11y in CI | `tests/e2e/a11y-auth-shell.spec.ts` |
| Remote E2E workspace smoke | `.github/workflows/e2e-remote-smoke.yml` |
| CI secret fix | `E2E_LOGIN_PASSWORD` (was `E2E_PASSWORD`) |
| Playwright env | loads `.env.beta.local` |

## Production smoke semantics

- **Tenant isolation gates** (workspace, orders, menus) — blocking
- **Demo mode off** — warning unless `SMOKE_PREFLIGHT_STRICT=1`
- **Dashboard** — must redirect to `/login` (verified on prod)

## Authenticated Playwright (still needs password)

Add to `.env.local`:

```bash
E2E_LOGIN_EMAIL=owner@kitchen.com
E2E_LOGIN_PASSWORD=***
PLAYWRIGHT_BASE_URL=https://os-kitchen.com   # or http://127.0.0.1:3000 + npm run dev
```

```bash
npm run test:e2e:workspace-smoke
```

GitHub: secrets `E2E_LOGIN_EMAIL` + `E2E_LOGIN_PASSWORD`, variable `PLAYWRIGHT_INCLUDE_DASHBOARD=true`, workflow **E2E remote smoke** → `https://os-kitchen.com`.

## Coverage 60%

Current Vitest threshold ~20% global (by design). Raising to 60% is a **multi-day QA sprint** — do not fake with trivial tests. Track in Sprint 26.

## Next (Sprint 26+)

1. Set `E2E_LOGIN_PASSWORD` locally → full `smoke:workspace-post-not-null`
2. GSC verify + 3 paid pilots (manual GTM)
3. Coverage ramp plan: `services/beta-ops`, `lib/scope`, critical actions first
4. Optional: `SMOKE_PREFLIGHT_STRICT=1` on pilot kitchens before go-live
