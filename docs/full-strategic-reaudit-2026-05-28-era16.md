# KitchenOS Full Strategic Re-Audit — Post Evolution Era 16

**Date:** 2026-05-28  
**Method:** Read-only inspection of live repository (`main` @ `c88be6b`); inventory commands executed locally; **no** product code changes; **no** deploy/push/migrations  
**Supersedes:** `docs/full-strategic-reaudit-2026-05-28-era4.md` for **post–Era 16** inventory, certification posture, commercial/enterprise gaps, and Era 17+ execution facts  
**Companions:** `docs/era16-cycle-completion-scorecard-2026-05-28.md`, `docs/next-master-prompt-input-2026-05-28-era16.md` (Era 16 handoff), `docs/next-master-prompt-input-2026-05-28-era17.md` (Era 17 master prompt input), `docs/era17-strategic-execution-map-2026-05-28.md`

---

## Executive Summary

KitchenOS remains a **large, production-shaped food-operations monolith** with a **certified governance spine** through Evolution Era 16 (cycles 1–14). Era 16 converted **policy foundations** into CI-enforced commercial proof artifacts (SSO R2 pilot wiring, webhook matrix, mutation linter, pilot GO/NO-GO pack, operational sign-off paths). **It did not** deliver production enterprise SSO, live marketplace ops at scale, staging-first-green GitHub evidence, or Toast/Square feature parity.

**Live scale (2026-05-28, `c88be6b`):** **700** App Router pages, **175** API routes, **145** action modules under `actions/`, **604** service TS files, **745** component files, **365** Prisma models, **268** Prisma enums, **698** `*.test.ts` files, **58** Playwright specs, **1,482** markdown docs under `docs/`, **17** GitHub workflows, **16** production cron routes (disk = allowlist), **49** webhook route files, **8** public API v1 routes, **57** feature-maturity matrix rows, **18** domain mutation registry entries, **59** canonical permission keys.

**Strongest assets:** Order spine; POS + storefront **money-path CI** with honest optional browser/Stripe tiers; RBAC wave 4 + domain mutation registry + **Era 16 mutation linter**; **16-route** cron surface; governance bundle partitions; procurement + commercial pilot honesty; webhook security matrix (46 classified routes) + Uber Direct/Slack replay dedupe; SSO R2 **pilot_foundation** (Supabase SAML path, gated login, admin wiring).

**Weakest assets (commercially material):** No **pilot_ready** SSO (no IdP staging login proof); no GitHub **first green** staging workflow PASS recorded; Woo/Shopify live smoke **SKIPPED WITH REASON** without credentials; marketplace aggregators **PLACEHOLDER**; POS hardware/offline **not certified**; KDS **no rush-hour** certification; **POS-only** inventory depletion; **dual-ledger** rewards; Public API **beta** without per-route scope enforcement or SLA; **1,482** docs with sprawl outside ~51 canonical index links.

**Era 16 verdict:** **Complete** (cycles 1–14). Governance scorecard **100/100** = certification/honesty plateau, **not** competitor parity.

**Blended overall (investor/CTO realism):** **87/100** (+1 vs Era 4 re-audit 86/100). Blocks next +10: IdP SSO smoke → `pilot_ready`, staging workflows first green PASS, live Woo/Shopify workflow artifact, 2–3 paid pilots with signed qualified contracts.

**Era 17 theme (recommended):** **Commercial ops proof** — convert Era 16 foundations into **first-green evidence** and **paid pilot execution** without claiming production enterprise delivery.

---

## 1. Git / Worktree / Era State

| Item | Evidence | Status | Risk |
|------|----------|--------|------|
| Branch | `git branch --show-current` → `main` | **main** | Low |
| HEAD | `git rev-parse HEAD` → `c88be6ba1d6f382884f8204da61ace13dfb75b61` | **c88be6b** | Low |
| Working tree | `git status` → clean | **Clean** | Low |
| Untracked files | None | **None** | Low |
| Era 16 closure commit | `c88be6b` — `feat(era16): complete commercial proof cycles 1–14 with scorecard and Era 17 handoff` | **Real** | Low |
| Prior scorecard stale git | `era16-cycle-completion-scorecard` cited `bab3d24` uncommitted | **Superseded** by this audit | Low |
| Era 4–15 reopen? | No regression in `git log`; era policies intact | **Do not reopen** | Medium if forced |
| Generated artifacts | `artifacts/*.json` from smoke scripts — typically gitignored | Verify not committed | Medium |
| `tests/node_modules/` | Era 4 noted on disk | Hygiene policy exists — verify not tracked | Medium |
| npm in audit shell | `npm`/`npx` not on PATH in audit environment | **Validate locally** before release | Medium |

**Recent commit themes (last 30):** Era 16 commercial proof closure; Era 15 ops recert (KDS, procurement, staging, typecheck, production calendar); Era 14 GTM recert; cron surface restore; Eras 11–13 governance/KDS/staging.

---

## 2. Fresh Repository Inventory

| Metric | Count | Evidence Command | Notes |
|--------|------:|------------------|-------|
| App Router pages | **700** | `find app -path '*/page.tsx' \| wc -l` | +1 vs Era 4 audit |
| API routes | **175** | `find app/api -name 'route.ts' \| wc -l` | Stable |
| Public API v1 routes | **8** | `find app/api/public -name 'route.ts' \| wc -l` | Beta posture |
| Webhook routes | **49** | `find app/api -name 'route.ts' \| grep -i webhook \| wc -l` | Matrix cert: **46** classified |
| Cron routes (disk) | **16** | `find app/api/cron -name 'route.ts' \| wc -l` | = production allowlist |
| Production cron allowlist | **16** | `services/cron/production-manifest.ts` | Validators in CI |
| Server action modules (`actions/`) | **145** | `find actions -type f -name '*.ts' \| wc -l` | |
| `actions.ts` / `*-actions.ts` at repo root pattern | **12** | `find . -name 'actions.ts' -o -name '*-actions.ts'` | |
| Services (`services/`) | **604** | `find services -type f -name '*.ts' \| wc -l` | |
| Components | **745** | `find components -type f \| wc -l` | |
| Hooks | **3** | `find hooks -type f \| wc -l` | Minimal client hooks |
| Stores (Zustand) | **1** | `stores/ui-store.ts` | |
| Prisma models | **365** | `grep -c '^model ' prisma/schema.prisma` | Typecheck pressure |
| Prisma enums | **268** | `grep -c '^enum ' prisma/schema.prisma` | |
| Vitest/unit `*.test.ts` | **698** | `find . -name '*.test.ts' -not -path '*/node_modules/*'` | |
| Playwright `*.spec.ts` | **58** | `find . -name '*.spec.ts' -not -path '*/node_modules/*'` | +22 vs Era 4 |
| Docs (`docs/*.md`) | **1,482** | `find docs -name '*.md' \| wc -l` | Sprawl risk |
| Canonical doc links (index) | **~51** unique | `docs/canonical-doc-index.md` | vs 1,482 total |
| Deprecated audit families | **1** gateway | `docs/_DEPRECATED_AUDIT_FAMILY.md` | Do not treat `*_AUDIT*` as truth |
| `package.json` scripts | **531** | `Object.keys(scripts).length` | |
| CI workflows | **17** | `find .github/workflows -type f \| wc -l` | |
| Staging workflows | **4** | `*staging*` in `.github/workflows/` | e2e, KDS, woo-shopify, storefront-gate |
| Smoke scripts (`smoke:*`) | **30** | `package.json` filter | Era 16 adds 5 anchors |
| SSO-related source refs | **77** files | `grep -rl enterprise-sso\|saml` lib app docs | Foundation, not production |
| Auth-related files | **14** | `find lib app actions *auth*` | |
| Domain mutation registry entries | **18** | `domain-mutation-registry.ts` `id:` count | |
| Feature maturity rows | **57** | `feature-maturity-matrix.md` | |
| Integration registry | **8** (4 PLACEHOLDER, 4 BETA, 0 LIVE) | `integration-registry.ts` | |
| TODO/FIXME in lib+app | **8** / **5** files | `grep -rE TODO\|FIXME lib app` | Low vs sprawl |
| Hardcoded email patterns | **25** / **17** files | regex grep lib app | Mostly placeholders/docs |
| Permission keys | **59** | `lib/permissions/permissions.ts` | |

---

## 3. Era 16 Completion Verification

| Era 16 Item | Status | Evidence | Tests / Scripts | Docs | Remaining Risk | Era 17 Priority |
|-------------|--------|----------|-----------------|------|----------------|-----------------|
| 1. SSO R2 path decision | **Completed** | `era16-enterprise-sso-r2-pilot-v1`, `enterprise-sso-r2-pilot-design.md` | `test:ci:enterprise-sso-r2-pilot-era16:cert` | procurement, matrix | Not production SSO | **P0** IdP smoke |
| 2. SSO schema / settings | **Completed** | `era16-enterprise-sso-r2-schema-v1`, `schema_ready` | chained SSO cert | feature matrix | No SCIM | P1 |
| 3. SSO runtime adapter | **Completed** | `era16-enterprise-sso-r2-runtime-v1`, `pilot_foundation`, callback | unit + smoke wiring | SSO design doc | No live IdP proof | **P0** |
| 4. SSO pilot admin wiring | **Completed** | `era16-enterprise-sso-r2-admin-v1`, gated login | `smoke:enterprise-sso-r2-pilot` | runbook § SSO | Smoke ≠ attestation | **P0** |
| 5. Woo/Shopify live smoke | **Completed** (orchestrator) | `era16-channel-live-smoke-v1` | `smoke:woo-shopify-live`, channel cert | runbook | **SKIPPED** without creds | **P0** |
| 6. Webhook abuse matrix | **Completed** | `era16-webhook-security-matrix-v1`, 46 routes | `test:ci:webhook-security-era16:cert` | security summary | Not full replay ops | P1 |
| 7. Webhook replay monitoring | **Partial** | Uber Direct + Slack dedupe | `test:ci:webhook-replay-hardening-era16:cert` | — | Other routes P1 | P1 |
| 8. Mutation registry linter | **Completed** | `era16-mutation-registry-linter-v1` | in `test:security` | rbac doc | New actions discipline | P2 sustain |
| 9. Commercial pilot GO/NO-GO | **Completed** | `era16-commercial-pilot-evidence-pack-v1` | commercial-pilot cert | `commercial-pilot-runbook.md` | No paid customer yet | **P0** execute |
| 10. KDS / production sign-off | **Completed** (qualified) | `era16-operational-signoff-v1` | `smoke:operational-signoff-era16` | kds checklists | Not rush-hour | P1 manual ops |
| 11. Typecheck slices | **Completed** | `era16-typecheck-slice-report-v1` | `typecheck:report:slices` | devops | Full OOM risk | P2 |
| 12. Public API partner pack | **Completed** | `era16-public-api-partner-confidence-v1` | public-api certs | API contract doc | Beta, no SLA | P1 scopes |
| 13. Scorecard refresh | **Completed** | `era16-scorecard-refresh-v1` | `test:ci:scorecard:cert` | era16 scorecard | 100 ≠ parity | — |
| 14. Staging first green evidence | **Completed** (path only) | `era16-staging-workflows-first-green-v1` | `smoke:staging-workflows-first-green` | GITHUB_E2E_STAGING_SECRETS | **No GitHub PASS** | **P0** |

**Regressions:** None detected vs Era 15 closure for cron count (16), POS money-path policy, inventory POS-only lock.

---

## 4. Architecture Audit (24 Areas — Summary)

| # | Area | Implementation | Strongest | Weakest | Scale | Security | Maintain | Product | Competitor Gap | Era 17 Action |
|---|------|----------------|-----------|---------|-------|----------|----------|---------|-----------------|---------------|
| 1 | App Router | 700 pages, dashboard + platform + storefront | Breadth | Nav/IA drift | High | Low | Medium | Surface area | N/A | Page maturity on new routes |
| 2 | Auth/session | Supabase + workspace bootstrap | SMB path | Enterprise IdP | Medium | Medium | Good | SSO gap | Okta-native | **IdP staging proof** |
| 3 | SSO pilot | `pilot_foundation` | Honest docs | No `pilot_ready` | Low | Medium | Good | Enterprise block | All majors have SSO | **P0** |
| 4 | Tenant/workspace | `requireTenantActor` widespread | Order spine | Many code paths | Medium | Medium | Medium | — | — | Cross-tenant tests |
| 5 | RBAC | 59 keys, wave 4, registry | CI negative tests | Helper sprawl | Medium | Medium | Medium | — | — | Sustain linter |
| 6 | Mutation registry | 18 domain helpers | Central registry | Not all actions | Low | Medium | Good | — | — | Linter sustain |
| 7 | Audit logging | `services/audit/` | Denial audits | Export maturity | Medium | Low | Good | — | — | Retention runbooks |
| 8 | Order spine | `order-creation-service` | Idempotent patterns | Channel branches | Medium | Low | Good | Core sell | Parity on depth | Pilot golden path |
| 9 | POS | beta certified software | Money-path CI | Hardware/offline | Medium | Medium | Medium | Mis-sell risk | Toast hardware | Depth, not E2E redo |
| 10 | Storefront | pilot_ready checkout | Stripe matrix | Depletion gap | Medium | Medium | Medium | Stock honesty | Shopify native | Keep POS-only unless era unlock |
| 11 | KDS | pilot_ready qualified | Staging smoke | Rush-hour | Medium | Low | Medium | Ops trust | Toast KDS polish | Manual sign-off |
| 12 | Inventory | POS-only depletion | Policy locked | SF/API gap | Medium | Medium | Good | GTM trap | Unified stock norm | **Do not unlock** without era decision |
| 13 | CRM/loyalty | pilot_ready/beta | Profiles | Dual ledger | Medium | Medium | Medium | Rewards confusion | Klaviyo depth | Honest dual ledger |
| 14 | Staff/scheduling | beta | RBAC tests | Payroll cert | Medium | Low | Medium | — | 7shifts depth | Preview payroll only |
| 15 | Billing | pilot_ready | Stripe webhooks | Enterprise invoicing | Low | Medium | Good | — | — | Sustain |
| 16 | Integrations | golden path Woo/Shopify | Honesty registry | 0 LIVE registry | Low | High if mis-sold | Good | Placeholder nav | Live marketplaces | **Live smoke P0** |
| 17 | Public API | 8 routes beta | Contract tests | Scopes/SLA | Low | Medium | Good | Partner trust | Mature API programs | Per-route scopes |
| 18 | Webhooks | 49 routes | Era 16 matrix | Replay ops partial | Medium | **High** | Medium | — | — | Expand replay P1 |
| 19 | Cron/jobs | 16 prod | Validators | Ops discipline | Low | Low | Excellent | — | — | Sustain 16 gate |
| 20 | DevOps/CI | governance bundles | Partition CIs | Staging not green | Medium | Low | Good | Release confidence | — | **First green P0** |
| 21 | Enterprise procurement | honest pack | No false SOC2 | SSO not delivered | Low | Medium | Good | Deal friction | — | SSO pilot_ready |
| 22 | Analytics | beta exports | RBAC on export | KPI definitions | Medium | Medium | Medium | — | — | P2 |
| 23 | AI/copilot | preview | Budget limits | Explainability | Low | Medium | Medium | — | — | Hidden/beta |
| 24 | Platform admin | internal_only | Impersonation audits | Access review | Low | **High** | Good | — | — | Internal only |

**Architecture scores (0–100):** coherence **85**, scalability **71**, maintainability **73**, testability **89**, security architecture **87**, operational realism **80**, enterprise readiness **74** (up from 68 at Era 4 re-audit — foundation only).

---

## 5. Product Maturity Audit (Feature Families)

Aligned with `docs/feature-maturity-matrix.md` (57 rows). Condensed:

| Feature | Status | Sales Claim? | Missing / Gap | Competitor Gap | Era 17 Action |
|---------|--------|--------------|---------------|----------------|---------------|
| Marketing site | live | yes | attribution | — | claims registry |
| Auth / SSO | live + pilot_foundation | limited | IdP proof, SCIM | Enterprise SSO standard | **IdP smoke** |
| Dashboard shell | beta | no | IA polish | Toast nav | maturity notices |
| Order center / hub | pilot_ready | yes qualified | stuck-state UX | — | pilot ops |
| Storefront core | pilot_ready | yes qualified | depletion | unified stock | keep lock |
| POS checkout | beta | qualified | hardware | Toast terminal ecosystem | software depth |
| POS terminal API | preview | no | device lifecycle | Square Terminal | stay preview |
| KDS | pilot_ready | qualified no rush | rush-hour | Toast expo | ops sign-off |
| Production calendar | pilot_ready | qualified | drag-drop, KDS sync | — | operator checklist |
| Inventory | beta POS-only | no unified | SF depletion | all-in-one stock | **defer** |
| Loyalty/gift | beta dual ledger | no unified | cross-channel E2E | — | **defer** |
| Integrations Woo/Shopify | pilot_ready | qualified | live proof | native channels | **smoke P0** |
| Marketplace DD/Uber/GH | placeholder | **no** | partner APIs | live ops | hidden |
| Public API | beta | no | scopes, SLA | partner programs | scope enforcement |
| Enterprise procurement | beta | no SSO/SOC2 | attestations | — | pilot_ready SSO |

**Production/pilot-ready (honest):** Order spine, storefront checkout (qualified), POS software money path (qualified), packing, production board (qualified), CRM (qualified), billing (qualified), Woo/Shopify golden path (qualified, needs live smoke), commercial pilot pack (governance).

**Governance-certified only (not market-competitive):** KDS rush-hour, POS offline/hardware, unified inventory/rewards, marketplace integrations, enterprise SSO production, Public API enterprise SLA, SOC2 Type II.

---

## 6. Competitor Gap Audit (Abbreviated)

| Competitor | Stronger Than KitchenOS | KitchenOS Advantage | Gap | Leapfrog Opportunity | Era 17 Priority |
|------------|-------------------------|---------------------|-----|------------------------|-----------------|
| Toast | POS hardware, offline, KDS rush, payments ecosystem | Broad ops modules on one spine; honesty CI | Hardware, offline, depth | Unified ops narrative **if** pilots prove | POS depth P1; hardware defer |
| Square | Terminal, SMB UX, payments | Similar to Toast gap | Terminal cert | Partner API pack | Terminal preview only |
| Lightspeed | Multi-site, KDS | Production calendar | KDS polish | Operator calendar + KDS bundle | Ops sign-off P1 |
| TouchBistro | iPad FOH | — | Table service depth | — | defer |
| Clover | App marketplace | — | Ecosystem | — | defer |
| SpotOn | GTM/local | — | — | — | defer |
| Revel | Enterprise POS | Procurement honesty | Feature depth | — | defer |
| Oracle Simphony | Enterprise scale | — | Everything enterprise | — | SSO path only |
| Shopify | Commerce, apps | Kitchen order spine from webhooks | Native admin | Golden path + live smoke | **P0** |
| WooCommerce | OSS commerce | Same | Same | Same | **P0** |
| DoorDash/Uber Direct | Live delivery | Placeholder honesty | Live APIs | — | **hidden** |
| 7shifts/Homebase | Labor depth | In-app staff | Scheduling polish | — | P2 |
| QuickBooks/Xero | Accounting depth | Beta connectors | Certified sync | — | P2 |
| Klaviyo/Mailchimp | Marketing automation | CRM base | Campaign builder | — | preview only |

---

## 7. Commercial Pilot Readiness

| Dimension | Assessment |
|-----------|------------|
| **Pilot readiness score** | **72/100** (governance strong; ops evidence weak) |
| **GO conditions** | Tier 0 CI green; claims strict; 16 crons; qualified contract; staging manual golden path; optional smoke artifacts |
| **NO-GO conditions** | Missing governance bundles; experimental crons; enterprise SSO/SOC2 claims; unified inventory/rewards claims; rush-hour KDS claim |
| **Ideal ICP** | Single-location or small multi-unit **pilot** with owner-operator, Woo **or** Shopify, needs kitchen + storefront + POS software path; accepts qualified beta labels |
| **Pilot package** | Order hub, storefront, POS tier-2b, KDS qualified, production calendar qualified, Woo/Shopify, CRM, packing |
| **Forbidden claims** | See `era16-commercial-pilot-evidence-pack-v1` forbidden list |
| **Support boundaries** | No 24/7 SLA; no marketplace live ops; break-glass SSO manual |
| **Success metrics** | Orders/day, checkout success, KDS bump latency, pilot GO/NO-GO checklist PASS |

**Blocking paid pilots:** (1) No reference customer; (2) staging/GitHub first green not recorded; (3) sales discipline on forbidden claims; (4) SSO enterprise buyers need qualification.

---

## 8. Enterprise Readiness

| Capability | State | Evidence | Gap | Era 17 Work | Sales Claim |
|------------|-------|----------|-----|-------------|-------------|
| SSO | pilot_foundation | era16 SSO policies, admin UI | IdP smoke, `pilot_ready` | **P0** | Qualified pilot only |
| SCIM | not_implemented | roadmap | Full build | P2+ | **No** |
| SOC2 Type II | not_certified | procurement pack honest | Attestation | long | **No** |
| Tenant isolation | strong baseline | tenant actors, tests | pen test | P1 | Qualified |
| Audit logs | beta | export RBAC | retention | P2 | Qualified |
| Security questionnaire | beta pack | enterprise-procurement-pack | SSO answers | update after IdP | Honest |
| Backup/restore | documented partial | devops doc | drill proof | P1 ops | Qualified |
| Incident response | documented | pack | tabletop | P2 | Internal |
| Subprocessors | listed | pack | updates | sustain | Yes |
| Support impersonation | internal | platform actions | access review | sustain | Internal only |

**Enterprise readiness score (blended): 74/100** (governance 72 → foundation +2; not 90+ until `pilot_ready` SSO + staging proof).

---

## 9. Security / RBAC / Tenant

### RBAC Coverage Summary

| Metric | Value |
|--------|------:|
| Permission keys | 59 |
| Domain mutation registry entries | 18 |
| Mutation linter | blocks new ungoverned sensitive `actions/` |
| RBAC wave 4 | in `test:security` |
| Era 16 webhook matrix | 46 routes classified |

### Sensitive Mutations — Linter Posture

Static scan per `mutation-registry-linter-era16-policy.ts` — **policy complete**; residual = legacy actions grandfathered until touched.

### Public Routes / Webhook Risk

| Risk | Mitigation | Gap |
|------|------------|-----|
| 49 webhook ingress files | Signature + matrix | Not all replay-hardened |
| 8 public API routes | API key + tenant scope | Fine-grained scopes |
| Storefront POST checkout | captcha/rate limits | abuse monitoring ops |
| Cron routes | auth secret | 16-route gate |

### Tenant Isolation Critical Flows

Storefront checkout, POS, public API, webhooks, KDS — **medium** risk; cross-tenant tests exist subset; expand in Era 17 P1.

### SSO Security Risks

`sso_workspace_id` callback mapping; break-glass; **no** production SAML for all tenants; IdP misconfiguration → login_denied audits (expected).

---

## 10. Money-Path Audit

| Money Path | State | Tests/CI | Idempotency | Failure Recovery | Sales Claim | Era 17 |
|------------|-------|----------|-------------|------------------|-------------|--------|
| Storefront checkout | live | tier-2 cert | yes | pay-later path | qualified | Stripe secrets ops |
| POS checkout | beta certified | tier-2b always-on | yes | cancel/retry tested | qualified | no E2E redo |
| POS refund/void | beta | unit tests | partial | stripe rollback | qualified | depth P2 |
| Stripe webhooks | live | security bundle | yes | documented | qualified | — |
| POS inventory depletion | POS-only | depletion cert | N/A | — | **no unified** | locked |
| Gift/loyalty redeem | dual ledger | cross-channel cert | partial | — | **no unified** | locked |
| Public API order | beta | public-api cert | yes | — | qualified | scopes |
| Woo/Shopify import | pilot | golden path | webhook | — | qualified | **live smoke** |
| Billing subscription | pilot_ready | billing tests | webhook | — | qualified | — |

---

## 11. POS Market Readiness

| Dimension | Score | Notes |
|-----------|------:|-------|
| POS software readiness | **74** | tier-2b certified |
| POS hardware readiness | **35** | Terminal preview |
| POS offline readiness | **20** | not production |
| POS SMB pilot readiness | **76** | software-only pilots |
| POS competitive readiness | **58** | vs Toast/Square |

**Must finish (Era 17):** operator runbooks, discount/manager override depth (unit), tablet UX polish. **Later:** Terminal LIVE, offline. **Do not claim:** hardware cert, offline, Toast parity.

---

## 12. KDS / Production Ops

| Dimension | Score |
|-----------|------:|
| KDS pilot score | **75** |
| KDS gap vs Toast/Lightspeed | Expo/rush-hour, hardware certs |
| Production ops score | **74** |

Era 17: manual staging sign-off with operator email; optional Playwright staging workflow PASS; **no** rush-hour certification claim.

---

## 13. Inventory Decision Matrix

| Option | Value | Risk | Complexity | Tests | Recommendation |
|--------|-------|------|------------|-------|----------------|
| A. Keep POS-only (lock) | Honest GTM | Competitor gap | Low | existing cert | **Default Era 17** |
| B. Storefront depletion hook | Unified stock story | High mis-sync | High | new integration suite | **No** without explicit era unlock |
| C. API-only depletion | Partner use | Medium | Medium | new tests | Defer |
| D. Manual adjustment only | Safe | Weak automation | Low | existing | Pilot workaround |

**Era 17:** Keep **A**; sell "POS kitchen depletion when recipes configured" only.

---

## 14. Integrations / Channels

| Integration | State | Smoke | Production Claim | Era 17 |
|-------------|-------|-------|------------------|--------|
| Stripe | live/beta | CI | qualified | sustain |
| Stripe Terminal | preview | limited | **no** | preview |
| Shopify | pilot_ready | SKIPPED live | qualified | **P0 live** |
| WooCommerce | pilot_ready | SKIPPED live | qualified | **P0 live** |
| DoorDash/Uber/GH | PLACEHOLDER | no | **no** | hidden |
| QuickBooks/Xero | BETA | partial | qualified beta | P2 |
| 7shifts/Homebase | BETA | partial | no | P2 |
| Twilio/GA4/PostHog/Sentry | mixed | observability | internal/qualified | sustain |

**Productize first:** Woo/Shopify live proof. **Keep hidden:** marketplace placeholders. **Pilot:** Stripe + one channel.

---

## 15. Public API / Webhooks

| Score | Value |
|-------|------:|
| API readiness | **78** |
| Webhook security | **76** (+4 matrix/replay) |
| Partner confidence | **72** (partner pack; beta) |

Era 17: per-route scope enforcement; expand replay hardening; optional `smoke:public-api-live` with credentials.

---

## 16. DevOps / CI / Staging

| Score | Value |
|-------|------:|
| CI reliability (governance) | **100** |
| Staging readiness (ops proof) | **45** |
| Release confidence | **78** |

**Era 17 DevOps P0:** GitHub `e2e-staging.yml`, `woo-shopify-staging-smoke.yml`, `playwright-kds-staging.yml` first **PASS** with secrets documented in `docs/GITHUB_E2E_STAGING_SECRETS.md`.

**Not run in this audit:** `npm run test:ci:*` (npm unavailable in audit shell) — **run locally before release**.

---

## 17. UX / Operator Experience (Selected)

| UX Area | State | Operator Pain | Competitor Standard | Era 17 |
|---------|-------|---------------|---------------------|--------|
| Dashboard nav | beta + badges | preview confusion | polished IA | maturity sweep on add |
| POS | beta | tablet density | Toast speed | P1 polish |
| KDS | pilot_ready | realtime SLO unknown | bump speed | staging proof |
| Production calendar | pilot_ready | no drag-drop | week grid | checklist |
| SSO admin | pilot | IdP setup complexity | self-serve | runbook + smoke |
| Integration setup | beta | credential friction | wizards | live smoke docs |

---

## 18. Documentation / Claims Governance

| Score | Value |
|-------|------:|
| Docs health | **65** (sprawl) |
| Sales honesty | **88** (certs + registry) |

**Contradictions to watch:** inventory (matrix vs old audits), rewards dual-ledger, SSO (`pilot_foundation` vs marketing), SOC2, POS offline, KDS rush-hour, integration LIVE vs PLACEHOLDER.

**Era 17 doc tasks:** Link this re-audit in canonical index; deprecate era4 re-audit for strategic decisions; banner high-traffic stale audits per `_DEPRECATED_AUDIT_FAMILY.md`.

---

## 19. Investor / Acquisition Readiness

| Dimension | Score |
|-----------|------:|
| Investor DD readiness | **74/100** (+2) |

**Top concerns:** No paid pilots; SSO not `pilot_ready`; staging proof; 365-model monolith; AI-assisted velocity risk.  
**Strongest story:** Honest governance + broad platform + order spine + commercial pilot pack.  
**Weakest DD area:** Enterprise attestations + live integration proof.  
**Era 17 plan:** 1–2 paid pilots + first-green artifacts + SSO IdP smoke → credible Series A ops narrative.

---

## 20. Updated Scorecard (Blended Realism)

Governance internal (Era 16): **100/100**. Blended product/investor scores below.

| Area | Era 4 Re-audit | Era 16 End (Gov) | Blended Now | Δ | Blocks +10 |
|------|---------------:|-----------------:|------------:|--:|------------|
| Overall | 86 | 100 | **87** | +1 | pilots + staging green |
| Product strategy | 78 | — | **79** | +1 | focused commercial proof |
| Architecture | 84 | — | **85** | +1 | — |
| Backend/API | 85 | — | **86** | +1 | API scopes |
| Frontend/UX | 78 | — | **78** | 0 | POS tablet |
| Database | 76 | — | **75** | -1 | 365 models |
| POS | 74 | 74 | **74** | 0 | hardware |
| POS competitive | 58 | — | **58** | 0 | offline |
| KDS | 74 | 75 | **75** | +1 | rush-hour proof |
| Storefront | 83 | 83 | **83** | 0 | depletion |
| Inventory | 72 | 72 | **72** | 0 | era unlock |
| CRM/loyalty | 68 | — | **68** | 0 | unified ledger |
| Staff/scheduling | 70 | — | **70** | 0 | — |
| Billing/payments | 75 | — | **75** | 0 | — |
| Integrations | 60 | 62 | **63** | +3 | live smoke PASS |
| Public API | 78 | — | **79** | +1 | partner pack |
| Webhooks | 72 | — | **76** | +4 | replay expansion |
| Security | 82 | 85 | **85** | +3 | — |
| RBAC | 90 | 91 | **91** | +1 | — |
| Tenant isolation | 85 | — | **85** | 0 | pen test |
| SSO/enterprise identity | — | — | **58** | — | IdP proof |
| DevOps | 100 | 100 | **82** | * | staging green * |
| QA | 94 | 96 | **96** | +2 | — |
| Performance | 71 | — | **70** | -1 | typecheck OOM |
| Enterprise readiness | 67 | 72 | **74** | +7 | pilot_ready SSO |
| Marketing/sales | 83 | 85 | **86** | +3 | pilot execution |
| Commercial pilot readiness | — | — | **72** | — | first customer |
| Investor DD | 72 | — | **74** | +2 | pilots |

*DevOps blended lowered vs governance 100: reflects missing operational first-green, not CI module absence.*

---

## 21–22. Era 17 Pointers

Full 30–50 cycle map: `docs/era17-strategic-execution-map-2026-05-28.md`  
Master prompt input: `docs/next-master-prompt-input-2026-05-28-era17.md`

---

## Validation Commands (reproducible)

```bash
git rev-parse HEAD
git status
find app -path '*/page.tsx' | wc -l
find app/api/cron -name route.ts | wc -l
grep -c '^model ' prisma/schema.prisma
npm run validate:production-crons
npm run validate:cron-inventory
npm run test:ci:governance-bundles
npm run test:ci:scorecard:cert
npm run smoke:staging-workflows-first-green
npm run smoke:woo-shopify-live
npm run smoke:enterprise-sso-r2-pilot
npm run smoke:operational-signoff-era16
```

---

**Re-audit decision:** This document fulfills the **post–Era 16 full strategic re-audit**. Era scorecards remain authoritative for cycle governance; **Era 17** must use this file + `docs/next-master-prompt-input-2026-05-28-era17.md`.
