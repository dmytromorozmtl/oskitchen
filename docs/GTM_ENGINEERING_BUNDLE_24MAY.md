# GTM Engineering Bundle — Interconnected Release (24 May 2026)

This document ties together the Week 1 engineering deliverables that support GTM, SEO, security, and QA. Each item links to code, tests, and operator-facing URLs on https://os-kitchen.com.

---

## Flow diagram

```mermaid
flowchart LR
  subgraph publish [Publish]
    Blog[Blog post + OG]
    Solutions[Solution guide links]
    Sitemap[sitemap.xml]
  end
  subgraph verify [Verify]
    GSC[GSC preflight]
    A11y[axe CI]
    Health[health contract]
  end
  subgraph secure [Secure]
    WS[workspace backfill dry-run]
    Gate[workspace audit gate]
  end
  subgraph sell [Sell]
    Deck[/deck PDF]
    ROI[/roi-calculator]
  end
  Blog --> Sitemap
  Solutions --> Blog
  Sitemap --> GSC
  publish --> verify
  secure --> Gate
  sell --> GSC
```

---

## 1. Content & SEO

| Asset | URL | Code |
|-------|-----|------|
| Meal prep order queue (June W1) | `/blog/meal-prep-order-queue-cut-packing-errors` | `lib/marketing/blog-content/meal-prep-order-queue.tsx` |
| OG image | auto `/opengraph-image` | `app/blog/.../opengraph-image.tsx` |
| Related articles | bottom of every blog post | `lib/marketing/blog-related.ts` + `BlogArticleShell` |
| Solution cross-links | `/solutions/meal-prep` etc. | `SolutionGuideLinks` + `SOLUTION_GUIDE_LINKS` |
| Sitemap | `/sitemap.xml` | `lib/marketing/sitemap-urls.ts` |

**After deploy:** GSC → URL inspection → Request indexing for blog + solution pages.

---

## 2. POS accessibility

| Standard | Implementation |
|----------|----------------|
| WCAG 2.5.5 (44px min) | `lib/pos/touch-targets.ts` — 48px on primary taps |
| Regression test | `tests/unit/pos-touch-targets.test.ts` |
| Runbook | `docs/QA_ACCESSIBILITY_POS_KDS.md` |

---

## 3. CI & contracts

| Check | Location |
|-------|----------|
| Marketing a11y (9 paths) | `tests/e2e/a11y-marketing.spec.ts` in `ci.yml` |
| Health API shape | `lib/api/health-contract.ts` + `tests/unit/api-health-contract.test.ts` |
| Deploy health probe | `scripts/deploy-prebuilt-prod.sh` step 6 |

---

## 4. GSC & Week 1 gates

```bash
npm run gtm:week1              # tests + workspace gate + gsc preflight
npm run gtm:gsc-preflight        # production SEO probe
npm run gtm:gsc-preflight:strict # fails until live verification meta exists
```

Setup: `docs/GSC_SETUP.md` · Checklist: `docs/WEEK_1_LAUNCH_CHECKLIST.md`

---

## 5. workspaceId migration

```bash
npm run workspace:audit
npm run workspace:backfill:dry-run   # counts pending rows
```

Runbook: `docs/WORKSPACE_MIGRATION_RUNBOOK.md`

---

## 6. Deploy

```bash
NODE_OPTIONS="--max-old-space-size=8192" npm run deploy:prod
```

Deploy skips standalone `tsc` (Desktop/iCloud); TypeScript is validated during `next build`. See `scripts/deploy-prebuilt-prod.sh`.

---

## Manual P0 (not automatable)

1. GSC verification token in Vercel  
2. Three paid pilots + signed case study permission  
3. Legal review before pilot contracts  
4. `SENTRY_DSN` + `NEXT_PUBLIC_POSTHOG_KEY` in production env  

Status tracker: `docs/GTM_BACKLOG_STATUS.md` · Gap analysis: `docs/GTM_GAP_ANALYSIS_24MAY.md`
