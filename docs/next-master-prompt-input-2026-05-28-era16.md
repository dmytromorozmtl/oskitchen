# Next Master Prompt Input — OS Kitchen Era 17

**Date:** 2026-05-28  
**Purpose:** Canonical facts for Evolution Era 16 completion — **superseded** by `docs/next-master-prompt-input-2026-05-28-era17.md` for recurring prompts  
**Era 16 scorecard:** `docs/era16-cycle-completion-scorecard-2026-05-28.md`  
**Strategic baseline:** `docs/full-strategic-reaudit-2026-05-28-era4.md`

> **For recurring Era 16 prompts:** Era 16 is **complete** (cycles 1–13). Use this document as the Era 17 handoff. Prior era inputs remain historical: `docs/next-master-prompt-input-2026-05-27-era15.md`.

---

## 1. Era 16 Outcomes (Facts Only)

All twelve Era 16 delivery cycles from era15 handoff **completed** (cycles 1–12). Policy IDs in `lib/governance/era16-scorecard-policy.ts`.

| Theme | Outcome |
|-------|---------|
| SSO R2 | `design_locked` → **schema_ready** + **pilot_foundation** (`supabase_saml_sso`); **not production SSO** |
| Live Woo/Shopify | `era16-channel-live-smoke-v1`; SKIPPED WITH REASON without credentials |
| Webhook security | 46-route matrix + Uber Direct/Slack replay dedupe |
| Mutation linter | Static scan blocks ungoverned sensitive actions |
| Commercial pilot | Role checklists + GO/NO-GO evaluator in runbook |
| Ops sign-off | KDS + production calendar PASSED/FAILED/SKIPPED artifact |
| Typecheck | Per-slice PASSED/FAILED summary; `typecheck:full` canonical |
| Public API | Partner confidence pack; OpenAPI bearer; **beta** |

**Overall score:** **100/100** sustained (Era 15 end 100; sub-areas +1 to +5 in Security, QA, Enterprise, etc.).

**Era 4–15:** Complete. **Era 16:** Complete. **Do not re-run** Era 4–15 cycles or claim items Era 16 explicitly deferred.

---

## 2. What Remains Open (P0 for Era 17 consideration)

| ID | Item | Notes |
|----|------|-------|
| E17-P0-1 | SSO R2 IdP staging smoke | Move **pilot_foundation** → **pilot_ready** with real IdP proof only |
| E17-P0-2 | Staging workflows first green | GitHub secrets + first PASS on e2e-staging / woo-shopify workflows |
| E17-P0-3 | Storefront inventory hook | Only if `era5-pos-only-gtm-lock-v1` lifted by explicit era decision |

---

## 3. What Remains Open (P1)

- Fine-grained Public API scope enforcement per route.
- Additional webhook replay hardening beyond Uber Direct + Slack.
- Full typecheck OOM profiling if `quality` job fails in CI.
- Unified cross-channel rewards — `deferred_locked`.
- Production calendar / KDS **manual** staging sign-off with operator email + URL.
- Commit + merge uncommitted Era 16 work; verify CI green on remote.

---

## 4. Era 17 Strategic Themes (Suggested)

Pick **one theme per cycle**; do not reopen Era 4–16 unless regression proven via `git log` + scorecard docs.

1. **SSO R2 pilot_ready** — IdP staging login → dashboard; no production SAML claim for all tenants.
2. **Staging first green** — record PASS/FAIL for GitHub staging workflows with secrets.
3. **Live channel first green** — Woo/Shopify workflow_dispatch evidence artifact.
4. **Webhook replay expansion** — next P1 routes from security matrix.
5. **Public API scope enforcement** — bounded per-route scope checks.
6. **Full strategic re-audit** — only if commercial scale or architecture shifts materially.

**Do not prioritize without explicit era decision:** offline POS, hardware ecosystem, DoorDash live build, unified inventory/rewards, experimental crons, AI expansion, **re-implementing POS browser E2E policy**.

---

## 5. CI / Governance Facts

- Default quality job: `npm run test:ci:governance-bundles` (four partitions; scorecard cert last in `partition-product-kds`).
- Scorecard cert: `npm run test:ci:scorecard:cert` (era4–**era16** policy tests).
- Era 16 smoke scripts: `smoke:enterprise-sso-r2-pilot`, `smoke:woo-shopify-live`, `smoke:operational-signoff-era16`, `smoke:public-api-live`, `typecheck:report:slices`.
- Production crons: **16** allowlisted routes only.
- POS money path: tier-2b always-on; browser optional — **certified — do not redo**.

---

## 6. Documentation Rules

- Update **canonical doc set** + `docs/canonical-doc-index.md` only.
- Maturity claims must match policy IDs and CI certs.
- Paid pilots: `docs/commercial-pilot-runbook.md` + `era16-commercial-pilot-evidence-pack-v1`.

---

## 7. Re-audit Decision

**Full re-audit:** **Complete** — see `docs/full-strategic-reaudit-2026-05-28-era16.md`. Use `docs/next-master-prompt-input-2026-05-28-era17.md` for Era 17 master prompt.

---

## Scorecard (Evolution Era 16 end — 2026-05-28)

| Area | Era 15 end | Era 16 end | Δ |
|------|----------:|-----------:|--:|
| Overall | 100 | **100** | +0 |
| Security | 82 | **85** | +3 |
| QA | 94 | **96** | +2 |
| DevOps | 100 | **100** | +0 |
| RBAC | 90 | **91** | +1 |
| Inventory | 72 | **72** | +0 |
| POS | 74 | **74** | +0 |
| Integrations | 60 | **62** | +2 |
| KDS | 74 | **75** | +1 |
| Enterprise readiness | 67 | **72** | +5 |
| Marketing/sales | 83 | **85** | +2 |
| Storefront | 83 | **83** | +0 |

---

## 8. Recommended Era 17 Master Prompt Theme

**Commercial ops proof** — convert Era 16 policy foundations into first-green staging evidence (SSO IdP smoke, Woo/Shopify workflow, e2e-staging) without claiming production enterprise delivery.
