# GTM & Engineering Backlog — Live Status

**Updated:** 2026-05-24 (post gap analysis)  
**Production:** https://os-kitchen.com  
**Master plan:** `docs/GTM_EXECUTION_PLAN_24MAY2026.md` · **Gap detail:** `docs/GTM_GAP_ANALYSIS_24MAY.md` · **Interconnected bundle:** `docs/GTM_ENGINEERING_BUNDLE_24MAY.md` · **Week 1:** `docs/WEEK_1_LAUNCH_CHECKLIST.md`

Legend: ✅ Done in repo/prod · 🟡 Partial / needs manual · 🔴 Open · ⏸ Blocked on pilots/revenue

---

## P0 — Critical

| Item | Status | Evidence / next step |
|------|--------|----------------------|
| 0 paying customers / case studies | 🔴 | Close 3 pilots — `docs/PILOT_ONBOARDING_RUNBOOK.md`, `docs/outreach/pilot-tracker.md` |
| Google Search Console | 🟡 | `npm run gtm:gsc-preflight:strict` after Vercel env — `docs/GSC_SETUP.md` |
| workspaceId migration | 🟡 | `docs/WORKSPACE_MIGRATION_RUNBOOK.md` · `npm run workspace:backfill:dry-run` · CI gate |
| Bus factor = 1 | 🟡 | ADRs, CONTRIBUTING, `docs/HIRING_CS_SOLUTIONS_ENGINEER.md` — **post JD** |

---

## P1 — High

| Item | Status | Evidence |
|------|--------|----------|
| APM / Sentry | 🟡 | `docs/ops/PRODUCTION_OBSERVABILITY_SETUP.md` — set `SENTRY_DSN` on Vercel |
| Content calendar | 🟡 | June W1 blog + OG + solution links ✅; **2 posts/month** ongoing |
| Delivery integrations | 🟡 | Uber HMAC ✅; menu sync scaffold — roadmap in compare pages (honest) |
| PDF sales deck | ✅ | https://os-kitchen.com/deck |
| NPS / retention | ✅ | `NpsSurveyPrompt` day-30; optional `NEXT_PUBLIC_NPS_SURVEY_URL` |

---

## P2 — Medium

| Item | Status | Evidence |
|------|--------|----------|
| WCAG 2.1 AA audit | 🟡 | `docs/QA_ACCESSIBILITY_POS_KDS.md` · `lib/pos/touch-targets.ts` · axe **9 paths** in CI |
| PostHog analytics | ✅ | `PostHogProvider` + `NEXT_PUBLIC_POSTHOG_KEY` |
| Legal drafts | 🟡 | CCPA section on `/legal/data-rights`; counsel before pilot signature |
| Experimental crons | ✅ | Production allowlist + CI `validate:cron-inventory` |
| ROI calculator | ✅ | https://os-kitchen.com/roi-calculator |
| Compare pages (+4) | ✅ | `/compare/deliverect`, `restaurant365`, `touchbistro`, `olo` |
| Homepage positioning | ✅ | Hero variant A updated — FOH+BOH+storefront H1 |
| Cookie consent | ✅ | `components/analytics/cookie-consent.tsx` |

---

## P3 — QA

| Item | Status | Evidence |
|------|--------|----------|
| Coverage % in CI | ✅ | `npm run test:coverage`, thresholds 45% (raise to 60% Q3) |
| API contract tests | 🟡 | orders + `api-health-contract` — expand top-20 |
| Stripe webhook dedup | ✅ | Prisma `@@unique([connectionId, externalEventId])` + unit test |
| Weekly prod smoke | ✅ | `.github/workflows/production-weekly-smoke.yml` |

---

## Engineering backlog (from role analysis)

| # | Task | Status |
|---|------|--------|
| 1 | workspaceId backfill phases | 🟡 Scripts exist — run on **staging** |
| 2 | ActionResult standardization | 🟡 `lib/action-result.ts` exists — adopt in new actions |
| 3 | Webhook idempotency | ✅ Schema constraint |
| 4 | Sentry Performance | 🟡 Env |
| 5 | Aggregator menu sync | 🔴 Post-pilot |
| 6 | next/image migration | 🔴 |
| 7 | Web push | 🔴 |
| 8 | Per-workspace billing | 🔴 |
| 9 | Queue roadmap (BullMQ) | 🟡 ADR-0003 |
| 10 | KDS offline cache | 🔴 |
| 11 | .next.trash gitignore | ✅ |
| 12 | PostHog | ✅ |

---

## PM / Marketing docs shipped

| Document | Path |
|----------|------|
| Case study template | `docs/templates/CASE_STUDY_TEMPLATE.md` |
| Investor update | `docs/INVESTOR_UPDATE_TEMPLATE.md` |
| Content calendar | `docs/CONTENT_CALENDAR_2026.md` |
| SOC2 roadmap | `docs/SOC2_ROADMAP_Q4.md` |
| Feature prioritization | `docs/FEATURE_PRIORITIZATION_MATRIX.md` |
| Hiring JD | `docs/HIRING_CS_SOLUTIONS_ENGINEER.md` |

---

## Deploy checklist after code merge

```bash
npm run gtm:week1
npm run deploy:prod
npm run gtm:gsc-preflight
```

Submit updated sitemap in GSC (~69+ URLs after new compare pages).
