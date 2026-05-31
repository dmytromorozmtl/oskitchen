# Week 1 Launch Checklist

**Goal:** Unblock GTM (visibility + sales assets) without writing new product code.  
**Plan:** `docs/GTM_EXECUTION_PLAN_24MAY2026.md`  
**Automated gate:** `npm run gtm:week1` (or `bash scripts/gtm-week1-preflight.sh`)

---

## A. Engineering (automated)

Run locally or rely on CI (`main` branch):

```bash
npm install
npm run gtm:week1
```

| Step | Command | Pass criteria |
|------|---------|---------------|
| Unit tests | `npm test` | All green |
| Workspace regression | `npm run workspace:audit:gate` | ≤180 models need migration |
| Production SEO probe | `npm run gtm:gsc-preflight` | Health, sitemap, robots, /deck OK |
| Coverage (optional) | `npm run test:coverage` | Thresholds in vitest.config.ts |

- [ ] `npm run gtm:week1` passes locally
- [ ] CI green on latest `main`

---

## B. SEO & visibility (~20 min)

| Step | Action | Doc |
|------|--------|-----|
| 1 | Verify domain in Google Search Console | `docs/GSC_SETUP.md` |
| 2 | Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Vercel → redeploy | `.env.example` |
| 3 | Submit `https://os-kitchen.com/sitemap.xml` | GSC → Sitemaps |
| 4 | Request indexing: `/`, `/pricing`, `/solutions/meal-prep`, `/deck` | GSC → URL inspection |

- [ ] GSC property **Verified**
- [ ] Sitemap status **Success** (~65 URLs)

---

## C. Sales assets (~2 hours)

| Asset | URL / file | Done |
|-------|------------|------|
| **Print-ready deck** | https://os-kitchen.com/deck → Print → Save as PDF | [ ] |
| Source markdown | `docs/sales-deck.md` | [ ] |
| Pilot offer | `docs/pilot-program.md` | [ ] |
| Email templates | `docs/outreach/email-templates.md` | [ ] |
| Demo script | `docs/outreach/demo-call-script.md` | [ ] |
| Lead tracker | `docs/outreach/pilot-tracker.md` | [ ] |
| Pilot agreement | `docs/outreach/pilot-agreement-template.md` | [ ] |

- [ ] PDF deck saved as `OS Kitchen-Sales-Deck.pdf`
- [ ] Attached to outbound Template 1–3

---

## D. Observability (~30 min)

Set in **Vercel Production**:

```bash
SENTRY_DSN=https://…
SENTRY_TRACES_SAMPLE_RATE=0.1
# Optional:
NEXT_PUBLIC_POSTHOG_KEY=phc_…
NEXT_PUBLIC_NPS_SURVEY_URL=https://form.typeform.com/…
```

| Check | How |
|-------|-----|
| Errors | Sentry project receives test event |
| Performance | Traces visible in Sentry Performance |
| Health | `GET /api/health` → `observability.backend = "SENTRY"` and `sentryServer.status = "live"` |

- [ ] Sentry DSN live  
- [ ] Alert: DB latency >500ms (Sentry or Vercel)

Details: `docs/ops/PRODUCTION_OBSERVABILITY_SETUP.md`

---

## E. Legal (before first pilot signature)

- [ ] Counsel reviewed `docs/outreach/pilot-agreement-template.md`
- [ ] Privacy / Terms acceptable for paid pilot (`/legal/*`)
- [ ] Cookie banner tested on marketing pages (already shipped)

---

## F. Outbound (Week 1 target)

| Metric | Target |
|--------|--------|
| Outreach emails sent | **10** |
| Replies | **2** |
| Demos booked | **1** |

Track in `docs/outreach/pilot-tracker.md`.

**Segments (one each minimum):**

1. Meal prep — Template 1  
2. Ghost kitchen — Template 2  
3. Small restaurant — Template 3  

- [ ] 10 emails sent  
- [ ] Tracker updated  

---

## G. Staging workspace migration (engineering, optional Week 1)

Only on **staging** DB:

```bash
npm run workspace:audit
npm run workspace:preflight
npm run workspace:backfill:phase1   # dry-run flags per script README
```

- [ ] Audit baseline recorded  
- [ ] Phase 1 dry-run completed on staging  
- [ ] `scripts/workspace-migration-baseline.json` lowered after each phase  

---

## Week 1 complete when

- [ ] GSC verified + sitemap submitted  
- [ ] PDF deck in outbound  
- [ ] 10 outreach emails + tracker  
- [ ] Sentry DSN live  
- [ ] `npm run gtm:week1` green  
- [ ] Legal OK for first pilot signature  

**Next:** Week 3–6 — close 3 pilots (`docs/PILOT_ONBOARDING_RUNBOOK.md`).
