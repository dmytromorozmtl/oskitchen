# Next Master Prompt Input — KitchenOS Evolution Era 18

**Date:** 2026-05-28  
**Purpose:** Canonical facts for the **Evolution Era 18** master prompt and recurring cycle prompts  
**Policy:** `era17-era18-handoff-input-v1`  
**Strategic baseline:** `docs/full-strategic-reaudit-2026-05-28-era16.md` (unchanged until re-audit trigger)  
**Era 17 closure:** `docs/era17-cycle-completion-scorecard-2026-05-28.md` @ `d2a1e26`  
**Execution map (historical):** `docs/era17-strategic-execution-map-2026-05-28.md`

> **For recurring Era 18 prompts:** Era 17 is **complete** (cycles 1–45). Do **not** re-run Era 4–17 delivery cycles unless live regression is proven (`git log` + failing cert). Prior handoff: `docs/next-master-prompt-input-2026-05-28-era17.md` (historical).

---

## Era 17 outcomes

Evolution Era 17 (cycles 1–45) **completed the commercial ops proof delivery theme** at the **policy and governance** layer:

| Theme | Outcome |
|-------|---------|
| SSO | IdP staging smoke plan + honest login skip path; **`pilot_foundation`** unchanged |
| Staging / channels | First-green orchestrators; Woo/Shopify live smoke paths; P0 unblock orchestrator (`era17-p0-staging-proof-unblock-v1`); **SKIPPED WITH REASON** without credentials |
| Commercial pilot | GO/NO-GO evaluator, forbidden-claims gate, ICP/contract templates, golden path wiring |
| Security | Webhook replay P1 expansion, public POST abuse review, Public API per-route scopes |
| POS / KDS / ops | Tablet UX, operator runbooks, manager discount depth, KDS/production drill wiring |
| GTM | Investor one-pager (template), competitor matrix refresh, internal case study draft |
| Governance | Scorecard **era17-scorecard-refresh-v1**; cycles 1–44 delivery + Cycle 45 handoff |

**Governance score:** **100/100** sustained. **Blended realism:** **89/100** (+2 from Era 16 **87**).

**Era 4–17:** Delivery cycles complete at policy layer. **Do not re-run** unless regression proven.

---

## Era 17 success criteria

From `docs/era17-strategic-execution-map-2026-05-28.md` — **NOT MET** as of Era 17 closure:

| Criterion | Status |
|-----------|--------|
| Paid pilot with signed contract + GO/NO-GO artifact | **NOT MET** — NO-GO locally |
| SSO `pilot_ready` with IdP staging evidence | **NOT MET** — `pilot_foundation`; login proof SKIPPED |
| Two of three staging workflows GitHub PASS | **NOT MET** — awaiting operator + secrets |
| Woo or Shopify live smoke PASS on staging | **NOT MET** — awaiting credentials |
| Governance bundles green + claims strict | **MET** |
| Era 17 scorecard without inflation | **MET** — blended **89**, explicit gaps |

Era 18 must **execute** the unmet criteria — not rewrite Era 17 policies.

---

## Open P0 for Era 18

| ID | Item | Evidence required |
|----|------|-------------------|
| E18-P0-1 | SSO IdP staging login → `pilot_ready` | `artifacts/enterprise-sso-idp-staging-smoke-summary.json` with `loginProofStatus: proof_passed` |
| E18-P0-2 | GitHub staging workflows first green | `artifacts/staging-workflows-first-green-summary.json` with PASS + run URLs |
| E18-P0-3 | Woo/Shopify live smoke PASS | `artifacts/channel-live-smoke-summary.json` overall PASSED |
| E18-P0-4 | First paid pilot execution | Signed LOI/contract + GO/NO-GO GO with qualifications |
| E18-P0-5 | Forbidden-claims before sales | Re-run on release branch before contract (`smoke:pilot-forbidden-claims-enforcement`) |

**Operator prerequisites (unchanged):**

- `E2E_STAGING_BASE_URL`, `SSO_STAGING_*` (6 vars), GitHub staging secrets, Woo/Shopify staging credentials, `DATABASE_URL` for channel smoke.

Missing credentials → **SKIPPED WITH REASON** — never fake PASS.

---

## Era 18 strategic theme

**Staging proof and first paid pilot**

Era 18 converts Era 17 **policy foundations** into **runtime evidence** and **revenue pilot execution**:

1. Run **`npm run smoke:p0-staging-proof-unblock`** — aggregates P0 #1–#3 child smokes; review **`artifacts/p0-staging-proof-unblock-summary.json`** (`p0ProofStatus`, `allMissingEnvVars`).
2. Execute P0 staging smokes with real credentials (SSO, GitHub, Woo/Shopify) when child artifacts still show skip.
3. Promote SSO to `pilot_ready` **only** after IdP login artifact (`era17-enterprise-sso-pilot-ready-v1`).
4. Run paid pilot GO/NO-GO → contract → operator golden path → metrics baseline → retrospective.
5. Sustain governance (16 crons, mutation linter, claims strict, forbidden-claims gate).
6. Incremental scorecard at Era 18 boundary — **no inflation** without proof artifacts.

**Do not prioritize without explicit era unlock:** offline POS, hardware cert, marketplace LIVE (DoorDash/Uber/Grubhub), unified inventory/rewards, SOC2/SCIM, broad AI expansion, POS browser E2E redo.

---

## Re-audit decision

**Full re-audit at Era 18 start:** **No** — continue from `docs/full-strategic-reaudit-2026-05-28-era16.md`.

**Trigger full re-audit when any of:**

1. First paid pilot completes with signed contract and captured metrics.
2. SSO reaches `pilot_ready` with IdP staging login artifact.
3. Repo scale shifts materially (>50 new API routes or major auth rewrite).

Until then: incremental Era 18 scorecard + execution map updates only.

---

## Scorecard (Era 17 end)

| Area | Era 16 end | Era 17 end | Δ |
|------|----------:|-----------:|--:|
| Overall (governance) | 100 | **100** | +0 |
| Security | 85 | **87** | +2 |
| QA | 96 | **97** | +1 |
| DevOps | 100 | **100** | +0 |
| RBAC | 91 | **92** | +1 |
| Inventory | 72 | **73** | +1 |
| POS | 74 | **76** | +2 |
| Integrations | 62 | **63** | +1 |
| KDS | 75 | **76** | +1 |
| Enterprise readiness | 72 | **73** | +1 |
| Marketing/sales | 85 | **88** | +3 |
| Storefront | 83 | **83** | +0 |

**Blended overall:** **89/100** — not governance 100; not Toast/Square parity.

Full detail: `docs/era17-cycle-completion-scorecard-2026-05-28.md`.

---

## Recommended Era 18 master prompt theme

**Execute commercial proof — evidence over policy**

Each Era 18 cycle must:

1. Prefer **PASS artifacts** (smoke JSON, GitHub run URLs, signed operator attestation) over new policy modules when Era 17 cert exists.
2. State explicit **non-claims** every cycle.
3. Run validation commands for touched workstreams.
4. Default **no** Era 4–17 redelivery unless regression proven.

**Suggested Era 18 cycle bands (draft):**

| Band | Theme |
|------|-------|
| A | SSO IdP proof → `pilot_ready` → operator runbook → procurement sync |
| B | Staging GitHub first green + live Woo/Shopify PASS |
| C | Paid pilot execution (GO → contract → golden path → metrics → retro) |
| D | Operational sign-off hygiene + KDS/production staging proof |
| E | Era 18 scorecard + conditional full re-audit |

---

## CI / governance facts (carry forward)

- Default quality: `npm run test:ci:governance-bundles`
- Scorecard: `npm run test:ci:scorecard:cert` (era4–era17)
- Handoff cert: `test:ci:era17-era18-handoff:cert`
- Production crons: **16** only
- POS money path: tier-2b — **certified — do not redo**
- Claims: `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` before external materials

---

## Documentation rules

- Update canonical set + `docs/canonical-doc-index.md` at era boundaries
- Maturity claims must match policy IDs and smoke artifacts
- Paid pilots: `docs/commercial-pilot-runbook.md` + forbidden-claims gate

---

## Recommended first Era 18 cycles

1. **Ops:** Configure staging secrets; re-run `smoke:enterprise-sso-idp-staging`, `smoke:staging-workflows-first-green`, `smoke:woo-shopify-live`.
2. **If SSO proof_passed:** Cycle `era17-enterprise-sso-pilot-ready-v1` gate only with artifact.
3. **Commercial:** Execute pilot golden path on staging; pursue first LOI with honest NO-GO/GO artifact.
4. **Do not** publish Era 18 scorecard until at least one P0 proof artifact moves from SKIPPED to PASSED or explicit FAIL with remediation plan.
