# Sales-safe claims registry

**Policy:** `sales-safe-claims-registry-v1`  
**Updated:** 2026-06-02  
**Owner:** Founder + Sales + Engineering (claims gate)  
**Machine registry:** [`config/marketing/claims-registry.json`](../config/marketing/claims-registry.json)  
**Feature ledger:** [`artifacts/competitor-feature-tracker.json`](../artifacts/competitor-feature-tracker.json) → `salesSafeFeatures`

This document is the **human-readable sales registry** — what reps, decks, and public pages may say without Legal review on every call. When in doubt, default to **ONLY_WITH_CAVEAT** or **NO**.

---

## Verdict vocabulary

| Verdict | Meaning | Use in materials |
|---------|---------|------------------|
| **YES** | Verified in code + audit; safe without qualification | Headlines, compare pages, SOW scope |
| **ONLY_WITH_CAVEAT** | Shipped but BETA, partial, or pilot-dependent | Discovery + demo with honesty UI |
| **ILLUSTRATIVE** | Model/ROI estimate — not customer proof | Calculator footnotes only |
| **NO** | Not delivered or blocked | Never sell; roadmap language only |
| **DEPRECATED** | Was claimed; retracted | Remove from all surfaces |

**Engineering shipped ≠ sales-safe.** Use `salesSafeFeatures` in competitor tracker, not `engineeringDelivery`.

---

## Registry layers (how they connect)

| Layer | Path | Purpose |
|-------|------|---------|
| **This doc** | `docs/sales-safe-claims-registry.md` | Sales playbook + GTM training |
| **Marketing rows** | `config/marketing/claims-registry.json` | Page-level claim audit (CI) |
| **Feature ledger** | `artifacts/competitor-feature-tracker.json` | 25 sales-safe feature verdicts + **8/8 competitor wedge claims** (`salesSafeCompetitorClaims`) |
| **AI modules** | `docs/ai-moats-honest-positioning.md` | Seven-module honest wording |
| **Integrations** | `docs/live-integration-definition-of-done.md` | LIVE vs BETA gate |
| **Forbidden scan** | `lib/governance/marketing-claims-governance-policy.ts` | CI phrase blocklist |
| **Pilot gate** | `tests/unit/forbidden-claims-enforcement.test.ts` | Era 17 sales claim patterns |

---

## YES — safe without caveat

| Claim | Evidence | Page / surface |
|-------|----------|----------------|
| OS Kitchen unifies storefront, POS, production, packing, and routes in one platform | Codebase surface audit | `/`, product deck |
| Starter, Pro, Team, Enterprise tiers publicly visible | `app/pricing/page.tsx` | `/pricing` |
| Interactive demo available without API keys | `app/demo/page.tsx` | `/demo` |
| Signed revenue export JSON for lender conversations — **not a credit decision** | `revenue-attestation-service.ts` | `/dashboard/analytics/capital` |
| Third-party financing resources — **not loans or credit decisions** | Capital disclosures doc | `/resources/restaurant-financing` |
| **Bill splitting complete** | Only `salesSafeVerdict: yes` in competitor audit; unit + E2E | POS / order flows |
| **7 proprietary AI modules in production** (engineering) | `artifacts/ai-moats-tracker.json` 22/22 | With per-module maturity caveats in same sentence |
| **Integration honesty UI** — BETA badges, SKIPPED banners, preview camera banner | Shipped components | Demo differentiator |

**Required qualifier for AI headline:** add “each at qualified maturity; pilot proof in progress” — see [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md).

---

## ONLY_WITH_CAVEAT — shipped, not fully proven

From `salesSafeFeatures` (22 partial + patterns). Always show Integration Health or maturity label in demo.

### Channels & delivery

| Feature key | Caveat to state aloud |
|-------------|----------------------|
| `doordash-ingest` | BETA — env-gated E2E; not LIVE marketplace ops |
| `uber-eats-ingest` | BETA — partner credentials required |
| `grubhub-ingest` | BETA — placeholder honesty in registry |
| `delivery-analytics-unified` | Aggregated reporting OK; live connection health needs caveat |
| `bidirectional-inventory-sync` | Shopify/Woo compare — live sync unproven |
| `shopify-markets-rfc` | Deep B2B code — live tenant smoke SKIPPED |

### Operations & POS

| Feature key | Caveat |
|-------------|--------|
| `offline-mode-default` | Cash/mark-paid queue only — **no offline card** |
| `floor-plan-editor` | Layout editor BETA — not realtime occupancy |
| `handheld-ordering` | PWA BETA — not native handheld hardware |
| `multi-location-dashboard` | PlanGate `multi_location` |
| `advanced-reporting` | Internal period compare — not industry benchmarks |

### Labor & CRM

| Feature key | Caveat |
|-------------|--------|
| `ai-scheduling` | Heuristic planner — label AI-assisted, not ML black box |
| `tip-pooling` | BETA labor module |
| `labor-cost-realtime` | Polling snapshot — not sub-second POS labor |
| `team-communication` | Ops feed — not Slack-style chat |
| `reservations-system` | Calendar + public booking BETA |
| `waitlist-management` | Waitlist SMS — no reservation confirmation SMS |
| `restaurant-loyalty` | Dual ledger — cross-channel deferred |

### Marketplace & extensions

| Feature key | Caveat |
|-------------|--------|
| `app-marketplace-rfc` | Extensions catalog BETA — not self-serve app store |
| `restaurant-capital-rfc` | Referral/OAuth hub — OS Kitchen does not originate loans |

**B2B HoReCa marketplace (buyer):** catalog → cart → checkout → PO path shipped — **BETA**; migration + vendor seeding required. Say “scaffold live in engineering; pilot tenant dependent.”

---

## NO — do not sell

| Claim area | Why NO | Say instead |
|------------|--------|-------------|
| `live-smoke-woocommerce` | Artifact SKIPPED — vault 0/11 | “Setup-ready — staging smoke pending ops vault” |
| `live-smoke-shopify` | Artifact SKIPPED | Same |
| `live-smoke-combined` | Artifact SKIPPED | Same |
| `woocommerce-subscriptions-rfc` | RFC only — no Woo bridge product | “Roadmap — not available” |
| **0 LIVE third-party integrations** (June 2026) | LIVE DoD gates not met | “7 BETA + 1 PLACEHOLDER — see Integration Health” |
| **0 signed LOI / paid pilot** | No customer proof | “Design partner program open” |
| Production **SSO / SOC2 Type II / SCIM** | Pilot foundation only | “Enterprise roadmap — not production today” |
| **Unified cross-channel inventory** | POS-only depletion certified | “POS depletion when recipes configured” |
| **Unified rewards / gift cards across channels** | Dual ledger lock | “Separate POS vs storefront balances” |
| **Rush-hour KDS certified** | No ops sign-off | “Qualified KDS — not rush-hour certified” |
| **Toast/Square hardware parity** | Software-first POS | “Browser/tablet POS — no proprietary terminal” |
| **Uber Direct live dispatch** | PLACEHOLDER | “On roadmap — placeholder in UI” |

---

## ILLUSTRATIVE — ROI and estimates only

| Claim | Registry status | Rule |
|-------|-----------------|------|
| “Reduces food cost by X%” | `illustrative` in claims-registry.json | Footnote: internal estimate, not case study |
| “Saves operators hours every week” | `illustrative` | ROI calculator assumptions only |

Never use illustrative rows in investor metrics or pilot SOW without customer-specific measurement plan.

---

## Forbidden phrases (CI-enforced)

From `MARKETING_CLAIMS_FORBIDDEN_PHRASES` + pilot forbidden-claims test. **Never use**, even negated in headlines:

- `production-certified hardware pos`
- `soc 2 type ii certified`
- `enterprise sso included`
- `unified cross-channel inventory depletion`
- `storefront orders deplete stock`
- `unified gift card balance across channels`
- `rush-hour kds certified`
- `live doordash integration` / `live uber eats sync`
- `toast-class kds at rush hour`
- `instant funding` / `guaranteed loan approval` / `kitchenos capital` / `pre-approved loan offer`

**Hype terms (task 17):** `untouchable`, `unbreakable moat`, `100% accurate`, `always correct`, `perfect predictions` — replace with **“7 proprietary AI modules in production”** where differentiation is needed.

**Roadmap terms** (Uber Eats, DoorDash, Stripe Terminal, SMS) may appear **only** within 200 chars of a safe qualifier: `beta`, `roadmap`, `placeholder`, `not live today`, etc.

---

## AI module claims (quick reference)

| Module | Safe one-liner | Verdict |
|--------|----------------|---------|
| AI Restaurant Brain | Deterministic daily briefing on Today | ONLY_WITH_CAVEAT |
| Digital Twin | Station simulation from orders | ONLY_WITH_CAVEAT (BETA) |
| Universal Menu Engine | Cross-channel menu model | ONLY_WITH_CAVEAT (BETA) |
| Food Cost AI | Recipe costing + margin alerts | ONLY_WITH_CAVEAT |
| AI Purchasing | EOQ-style suggestions + approval gate | ONLY_WITH_CAVEAT (BETA) |
| Kitchen Camera AI | Camera-ready + synthetic preview default | ONLY_WITH_CAVEAT — see kitchen camera doc |
| Benchmark Network | Cohort comparisons | ONLY_WITH_CAVEAT (BETA) |

Full module copy: [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md)

---

## Competitive claims

| Claim type | Rule | Source |
|------------|------|--------|
| vs Toast/Square/Lightspeed | Use qualified wins only — never “beat on everything” | [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) |
| Feature parity | Match `salesSafeVerdict` in tracker | `salesSafeFeatures` |
| Customer logos | **None** without signed case study | 0 LOI June 2026 |
| “Production-ready integrations” | **NO** — 0 LIVE | [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md) |

---

## Demo talk track (approved)

**Open with:**
> “OS Kitchen is a unified operating system for commissaries and multi-channel operators — seven AI modules in the codebase, honest BETA labels on integrations, and a B2B marketplace scaffold. We're pre-scale on customers and LIVE partner proof.”

**When asked about integrations:**
> “Screen-share Integration Health — green means configured, PASS means smoke artifact, SKIPPED means we haven't run it with your credentials yet.”

**When asked about AI:**
> “Each module is real code with defined maturity — not AGI. Kitchen camera is preview mode until you connect a stream.”

**When asked vs Toast:**
> “Toast wins hardware and install base. We win unified order-to-fulfillment depth and B2B buyer marketplace vision — if pilot proof lands.”

---

## Adding or updating a claim

1. **Propose** claim text + target page + evidence path (PR or Notion).
2. **Classify** YES / ONLY_WITH_CAVEAT / ILLUSTRATIVE / NO using this doc.
3. **Add row** to `config/marketing/claims-registry.json` if public-facing.
4. **Update** `salesSafeFeatures` in competitor tracker if feature-level.
5. **Run gates:**
   ```bash
   MARKETING_CLAIMS_STRICT=1 npm run verify-claims
   npm run audit:marketing-claims
   npm run test:ci:claims-registry:cert
   ./node_modules/.bin/vitest run tests/unit/forbidden-claims-enforcement.test.ts
   ```
6. **Legal + Founder** sign-off for any new **YES** on integrations, AI outcomes, or enterprise compliance.

---

## Review cadence

| When | Action |
|------|--------|
| Before each pilot kickoff | Re-read YES + NO sections; run step 6 commands |
| After integration promoted BETA→LIVE | Update LIVE DoD artifact + this doc + tracker |
| Monthly GTM sync | Reconcile claims-registry.json dates |
| Before investor deck | Cross-check [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) + pilot GO/NO-GO |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) | One-pager for prospects (Task 58) |
| [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) | Step 6 forbidden claims verify |
| [`status-color-tokens.md`](./status-color-tokens.md) | LIVE/BETA/SKIPPED/PASS/NO-GO UI |
| [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) | Engineering maturity vocabulary |
| [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) | GO/NO-GO process |
