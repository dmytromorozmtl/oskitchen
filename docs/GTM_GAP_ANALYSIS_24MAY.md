# GTM Gap Analysis — What's Done vs Still Open

**Date:** 2026-05-24 · **Prod:** https://os-kitchen.com  
**Audit baseline:** `docs/ultimate-audit-24may2026.md`

---

## Summary

| Area | Built in product | Still blocking revenue |
|------|------------------|------------------------|
| Tech / product | ~85% of backlog items have code or docs | Aggregator menu sync, workspaceId migration completion |
| GTM / sales | Deck, ROI, compare pages, hero, pilots docs | **0 paying customers**, no signed case studies |
| Ops | Cron allowlist CI, deploy script, smoke workflow | **GSC verify in UI**, Sentry DSN on Vercel |
| QA | 692 unit tests, 45% coverage gate, axe spec in CI | Load tests, top-20 API contracts, formal WCAG audit |

---

## P0 — Still requires human action

| Gap | Repo status | You must do |
|-----|-------------|-------------|
| 0 paying pilots / case studies | Templates + pilot playbooks only | Close 3 pilots; sign `docs/templates/CASE_STUDY_TEMPLATE.md` permission |
| GSC | Meta wiring in `app/layout.tsx` | Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Vercel → verify → submit sitemap |
| workspaceId ~18% models scoped | CI gate + backfill scripts | `npm run workspace:backfill:dry-run` on staging, then phase scripts |
| Bus factor 1 | ADRs, CONTRIBUTING, JD draft | Post `docs/HIRING_CS_SOLUTIONS_ENGINEER.md` |

---

## P1 — Partial in code

| Gap | Done | Remaining |
|-----|------|-----------|
| APM | Sentry + OTEL resolver | `SENTRY_DSN` + Performance on Vercel |
| Content | 6 blog posts + calendar | 2 posts/month execution; geo LPs |
| Delivery | Uber HMAC, DoorDash scaffold | Live menu sync + pilot testing |
| NPS | PostHog + day-30 prompt | `NEXT_PUBLIC_POSTHOG_KEY`, optional Typeform URL |

---

## P2 — Mostly shipped in last sprint

| Item | Status |
|------|--------|
| PDF deck | ✅ `/deck` |
| PostHog | ✅ needs env |
| ROI calculator | ✅ `/roi-calculator` |
| Compare pages | ✅ 9 slugs |
| Cookie + CCPA | ✅ banner + data-rights |
| Cron allowlist | ✅ CI |
| KDS overdue | ✅ pulse + audio |
| POS touch targets | ✅ 48px min (this session) |

---

## P3 — Engineering hygiene

| Item | Status |
|------|--------|
| Coverage in CI | ✅ 45% (raise to 60% Q3) |
| Webhook idempotency | ✅ Prisma unique |
| ActionResult | 🟡 type exists; ~3/140 actions adopted |
| API contracts | 🟡 health + orders; expand to webhooks/pos |

---

## Engineering bundle (interconnected)

See **`docs/GTM_ENGINEERING_BUNDLE_24MAY.md`** for the full map: blog ↔ solutions ↔ sitemap ↔ GSC ↔ CI axe ↔ health contract ↔ workspace dry-run ↔ deploy.

| Layer | Deliverable |
|-------|-------------|
| Content | Blog + OG + related posts + `SolutionGuideLinks` on solution pages |
| A11y | `lib/pos/touch-targets.ts` + `docs/QA_ACCESSIBILITY_POS_KDS.md` + 9-path axe CI |
| Contracts | `lib/api/health-contract.ts` shared with tests + deploy health check |
| Security ops | `docs/WORKSPACE_MIGRATION_RUNBOOK.md` + dry-run row counts |
| GTM gates | `gtm:gsc-preflight:strict` + `GTM_GSC_STRICT=1` week1 |

**Deploy:** `npm run deploy:prod` → `npm run gtm:gsc-preflight`
