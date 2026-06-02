# Sales demo environment setup — OS Kitchen

**Policy:** `sales-demo-environment-v1`  
**Date:** 2026-06-02  
**Owner:** Founder + Sales + CS  
**Audience:** Sales reps, founders doing demos, CS onboarding previews  
**Status:** **Operational guide** — staging-first; production demo requires explicit gates

This document defines **how to configure, seed, and run** OS Kitchen sales demos without overstating product maturity. It connects public `/demo`, staging owner workspaces, golden scenarios, and honesty UI.

**Hard rule:** Demos use **simulated or seeded data** — never imply signed customers, LIVE integrations, or production marketplace GMV.

**Related:** [`demo-video-script-today.md`](./demo-video-script-today.md) · [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · [`staging-environment-checklist.md`](./staging-environment-checklist.md) · [`nav-sprawl-audit.md`](./nav-sprawl-audit.md)

---

## Executive summary

| Demo mode | URL / entry | Data | Best for |
|-----------|-------------|------|----------|
| **Public demo hub** | `/demo` | Simulated import into signed-in workspace | Self-serve prospects, website |
| **Today Command Center** | `/dashboard/today` | Golden scenario seed or quiet state | Primary 90-sec sales narrative |
| **Executive dashboard demo** | `/dashboard/analytics/executive-demo` | Hard-coded synthetic KPIs | Investor / CFO preview |
| **Marketplace walkthrough** | `/dashboard/marketplace/*` | Empty until vendor seed — use limitation sheet | Design partner only |
| **Kitchen camera** | `/dashboard/kitchen/camera` | Synthetic preview banner (no live stream) | Honesty UI differentiator |

**Pilot gate (June 2026):** `artifacts/pilot-gono-go-summary.json` → **NO-GO** — use this doc for **qualified previews**, not paid pilot kickoff without staging checklist PASS.

---

## Environment tiers

### Tier A — Local / preview (engineering)

| Setting | Value | Notes |
|---------|-------|-------|
| `DATABASE_URL` | Local or preview branch DB | Never demo on production DB |
| `NEXT_PUBLIC_NAV_RELEASE_PROFILE` | `pilot` | Hides deep nav sprawl |
| `DEMO_MODE_ENABLED` | optional locally | Import/reset allowed on localhost |
| `KITCHEN_CAMERA_SYNTHETIC` | `1` | Amber preview banner on camera routes |

**Use for:** UI QA, script rehearsal, Loom recording from dev machine.

### Tier B — Staging sales workspace (recommended)

| Setting | Value | Notes |
|---------|-------|-------|
| Host | Staging URL from [`staging-environment-checklist.md`](./staging-environment-checklist.md) §1 | HTTPS required |
| `NEXT_PUBLIC_APP_ENV` | `staging` | Staging badge if enabled |
| `NEXT_PUBLIC_APP_URL` | Canonical staging URL | Matches browser bar |
| `NEXT_PUBLIC_NAV_RELEASE_PROFILE` | **`pilot`** | **Required** for sales — see [`nav-sprawl-audit.md`](./nav-sprawl-audit.md) |
| `DEMO_MODE_ENABLED` | `true` on staging project | Enables golden scenario import |
| `KITCHEN_CAMERA_SYNTHETIC` | `1` | Keep honesty banner visible |
| `SENTRY_DSN` | Set per [`sentry-setup.md`](./sentry-setup.md) | Catch demo-session errors |
| Stripe | **Test mode** keys only | `sk_test_…` |

**Dedicated account:** One **owner** login per sales pod (e.g. `sales-demo@staging.os-kitchen.com`) — do not share production credentials.

### Tier C — Supervised production demo (founder-only)

| Gate | Requirement |
|------|-------------|
| `DEMO_MODE_ENABLED` | `true` — explicit Vercel production flag |
| Workspace | Isolated demo tenant — labeled in UI |
| Reset | `scripts/reset-demo-tenant.ts` with `--confirm-email` |
| Approval | Founder sign-off per session |

**Avoid** unless prospect requires production URL. Prefer staging + screen share.

---

## Required environment variables (sales demo)

### Always set on staging demo project

```bash
NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot
NEXT_PUBLIC_APP_ENV=staging
DEMO_MODE_ENABLED=true
KITCHEN_CAMERA_SYNTHETIC=1
```

### Core platform (from staging checklist)

`DATABASE_URL`, `DIRECT_URL`, Supabase keys, `ENCRYPTION_KEY`, `CRON_SECRET`, Upstash rate limit, Stripe test keys — see [`staging-environment-checklist.md`](./staging-environment-checklist.md) §3.

### Do not set for standard sales demo

| Variable | Why skip |
|----------|----------|
| Live DoorDash / Uber / Grubhub keys | Implies LIVE integration — use Integration Health BETA labels instead |
| `MARKETPLACE_VENDOR_STRIPE_CONNECT=1` | Only for marketplace seed smoke — not default demo |
| Production Stripe `sk_live_…` | Never on demo workspace |

---

## Workspace setup (15-minute checklist)

| # | Step | Owner | Verify |
|---|------|-------|--------|
| 1 | Create or reset **owner** account on staging | Sales/Ops | Login → owner role |
| 2 | Set `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` + redeploy | Ops | Sidebar lacks deep orphan modules |
| 3 | Visit `/demo` → pick vertical (e.g. meal-prep) → import golden scenario | Sales | Demo banner visible in dashboard |
| 4 | Open `/dashboard/today` — briefing + KPIs populated | Sales | [`demo-video-script-today.md`](./demo-video-script-today.md) §Pre-recording |
| 5 | Confirm Integration Health shows **BETA** / **SKIPPED** honestly | Sales | No LIVE badges unless real smoke PASS |
| 6 | Open kitchen camera — **Preview mode** amber banner | Sales | `KitchenCameraPreviewBanner` visible |
| 7 | Bookmark `/dashboard/analytics/executive-demo` for CFO beat | Sales | Synthetic disclaimer at top |
| 8 | Attach [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) to follow-up email | Sales | Top 3 limitations read aloud |
| 9 | Clear browser extensions / DND before live call | Sales | Clean screen share |
| 10 | After demo: optional reset via `/dashboard/demo/scenarios` | Sales | No stale data for next rep |

**Validate nav profile:**

```bash
# In browser devtools console on staging
document.documentElement.dataset.navReleaseProfile
# Expect: "pilot" or verify sidebar item count reduced vs full
```

---

## Golden demo scenarios

Six scenarios in `lib/demo/golden-demo-scenarios.ts` — import from `/demo` or `/dashboard/demo/scenarios`.

| Scenario ID | Title | Vertical | Sales use |
|-------------|-------|----------|-----------|
| `meal-prep-weekly` | Meal prep weekly operations | meal-prep | **Default** — Today Command Center density |
| `cafe-pos` | Cafe POS counter sale | cafe | In-venue POS narrative |
| `bakery-preorder` | Bakery preorder pickup | bakery | Pickup window story |
| `catering-event` | Catering event | catering | Event / loadout ops |
| `ghost-channel` | Ghost kitchen channels | ghost-kitchen | Integration Health + mapping blocker |
| `multi-brand-commissary` | Multi-brand commissary | commissary | Enterprise-adjacent (caveat-heavy) |

**Safety notes (always true):**

- Seeding replaces demo operational data in **your workspace only**
- Production hosts require `DEMO_MODE_ENABLED`
- **No live marketplace credentials or payment capture** are created

**Reset:** Dashboard demo banner → **Reset demo workspace** (`components/demo/golden-demo-scenario-controls.tsx`).

---

## Recommended demo flow (20 minutes live)

| Minute | Route | Narrative |
|--------|-------|-----------|
| 0–2 | `/dashboard/today` | Hook — single command center ([`demo-video-script-today.md`](./demo-video-script-today.md)) |
| 2–5 | Today → attention / readiness | Blockers, setup gaps, honesty on BETA integrations |
| 5–8 | `/dashboard/orders` or production | Ops depth — orders → kitchen → packing |
| 8–10 | `/dashboard/integrations` or health | Integration maturity UI — **not** “all connected” |
| 10–12 | `/dashboard/analytics/executive-demo` | CFO view — **synthetic disclaimer** required |
| 12–15 | `/dashboard/marketplace/catalog` | Only if seeded — else read limitation: “BETA scaffold” |
| 15–18 | AI module (1) | e.g. scheduling or forecast — show qualified maturity |
| 18–20 | `/pricing` + `/book-demo` | Close — attach limitation sheet |

**90-second variant:** Today only — full script in [`demo-video-script-today.md`](./demo-video-script-today.md).

---

## Demo routes reference

| Route | Purpose | Honesty |
|-------|---------|---------|
| `/demo` | Public hub, vertical picker | “Simulated data · No API keys required” |
| `/dashboard/today` | Primary sales hero | Deterministic briefing — not AGI |
| `/dashboard/demo/scenarios` | Seed / reset controls | Requires `DEMO_MODE_ENABLED` on prod |
| `/dashboard/analytics/executive-demo` | Synthetic executive KPIs | Disclaimer: illustrative numbers |
| `/dashboard/kitchen/camera` | Camera-ready platform story | Preview banner when synthetic |
| `/dashboard/marketplace/*` | B2B catalog | Empty OK — [`MarketplaceDataUnavailable`](./marketplace-pricing-strategy.md) |
| `/platform/*` | **Do not demo** to prospects | Internal admin only |

**Do not paste** URLs from `NEXT_PUBLIC_NAV_RELEASE_PROFILE=full` sessions — 239+ orphan routes remain accessible by URL ([`nav-sprawl-audit.md`](./nav-sprawl-audit.md)).

---

## What to show vs hide

### Show (differentiators)

| Surface | Why |
|---------|-----|
| Today Command Center | Unified ops hub |
| Integration Health BETA badges | Honesty vs competitors |
| Kitchen camera preview banner | Trust / no fake AI detection |
| Bill splitting (POS) | Only sales-safe **YES** feature |
| 7 AI modules (one deep dive) | With qualified maturity caveat |
| Published `/pricing` | Transparent software pricing |

### Hide or caveat

| Surface | Action |
|---------|--------|
| Uber Direct | PLACEHOLDER — do not demo as live |
| SSO / SCIM settings | Pilot foundation — email/password default |
| Empty marketplace | Say “design partner onboarding” — don’t fake vendors |
| Franchise / commissary deep links | Enterprise scope only |
| `/platform` admin | Internal |
| Customer logos / testimonials on `/` | Illustrative unless labeled |

---

## Pre-call and post-call checklists

### Pre-call (5 min)

- [ ] Staging deploy green; `/api/health` OK
- [ ] Logged in as demo owner
- [ ] Golden scenario seeded (or quiet-state script ready)
- [ ] `pilot` nav profile active
- [ ] Limitation sheet PDF/link ready
- [ ] Recording consent if capturing Loom

### Post-call (5 min)

- [ ] Send limitation sheet + relevant ICP landing (`/shopify`, `/meal-prep`, etc.)
- [ ] Log prospect in CRM with **no LIVE integration claims**
- [ ] Reset demo workspace if scenario was destructive
- [ ] Note blockers for product (integration asked, marketplace, SSO)

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Empty Today page | No seed / quiet workspace | Import `meal-prep-weekly` from `/demo` |
| Demo import blocked | `DEMO_MODE_ENABLED` off | Enable on staging Vercel env + redeploy |
| Full nav sprawl visible | `pilot` profile not set | Set `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` |
| LIVE integration badge | Real keys on staging tenant | Remove keys or use clean demo workspace |
| Camera shows detections without hardware | Synthetic flag off | Set `KITCHEN_CAMERA_SYNTHETIC=1` |
| Marketplace empty | No vendor seed | Expected — use [`vendor-seeding-strategy.md`](./vendor-seeding-strategy.md) or skip |
| Executive demo shows real data | Wrong URL | Use `/executive-demo` not `/executive` |

**Health check:**

```bash
curl -sf "$STAGING_URL/api/health" | jq '.status, .checks.database, .checks.sentryServer'
```

---

## CI and smoke alignment

| Check | Command / workflow | Demo relevance |
|-------|-------------------|----------------|
| Forbidden claims | `npm run verify-claims` | Demo script phrases |
| P0 staging smokes | `.github/workflows/p0-staging-smokes.yml` | Staging demo credibility |
| Kitchen camera banner | `tests/unit/kitchen-camera-synthetic-mode.test.ts` | Banner env contract |
| Executive demo | `tests/unit/executive-dashboard-demo.test.ts` | Synthetic disclaimer |

**Current state:** P0 smokes **SKIPPED** in CI until credentialed runs — do not claim “staging smokes PASS” in demo narrative.

---

## Sales-safe language (demo close)

**Say:**

> “This is a staging workspace with simulated operational data. Integrations you see marked BETA need your credentials and our smoke checklist before go-live. I'll send our limitation sheet — it lists exactly what we commit to in a pilot.”

**Do not say:**

> “This is exactly how it runs in production for our customers” (0 signed customers)  
> “All integrations work out of the box” (0 LIVE)  
> “Marketplace suppliers are live nationwide” (BETA scaffold)

Full registry: [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)

---

## Related artifacts

| Doc | Use |
|-----|-----|
| [`demo-video-script-today.md`](./demo-video-script-today.md) | 90-sec recording script |
| [`marketing-page-audit.md`](./marketing-page-audit.md) | Public page honesty before demo |
| [`marketplace-pricing-strategy.md`](./marketplace-pricing-strategy.md) | Vendor commercial terms if asked |
| [`vendor-seeding-strategy.md`](./vendor-seeding-strategy.md) | When marketplace demo is ready |
| [`design-partner-email-sequence.md`](./design-partner-email-sequence.md) | Post-demo nurture |
| [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) | After demo → pilot conversion |

---

*Generated as Task 97 — P2 PM. Next: [`q3-2026-okrs.md`](./q3-2026-okrs.md) (Task 98).*
