# Pilot known issues (19 May 2026)

| ID | Area | Severity | Status | Notes |
|----|------|----------|--------|-------|
| KI-01 | Health | Low | **Closed** | Supabase sub-check `ok: true` on production after deploy |
| KI-02 | Rate limit | Medium | Open | `UPSTASH_REDIS_REST_TOKEN` not in Vercel; adapter may fall back to memory per instance |
| KI-03 | Email | Medium | Open | `RESEND_API_KEY` not configured in Vercel production |
| KI-04 | Supabase | High | Ops | Confirm Site URL = `https://os-kitchen.com` in Supabase Dashboard |
| KI-05 | GSC | Low | Ops | Google Search Console not connected — see `docs/GSC_SETUP.md` |
| KI-06 | UI | Low | Accepted | ~24 `loading.tsx` / ~20 `error.tsx` (dashboard layout covers most child routes) |
| KI-07 | E2E | Medium | Open | Authenticated pilot E2E requires `E2E_PILOT_EMAIL` / `E2E_PILOT_PASSWORD` |
| KI-08 | Cron | Low | Accepted | Legacy cron routes blocked by manifest; physical files retained |
| KI-09 | Icons | Low | Enhancement | Apple touch uses SVG favicon; dedicated 180×180 PNG optional |
| KI-10 | Perf | Low | Ops | Lighthouse CWV baseline not automated in CI |

**Production URL:** https://os-kitchen.com  
**Last deploy:** `dpl_Bsicm6j7T1ZnVyP7SNwoFjJBP8A3` — Supabase health fix live  
**E2E HTTP:** 5/5 PASS (post-deploy)
