# KitchenOS Implementation Backlog

Status: canonical execution backlog grouped by strategic priority
Primary evidence: `docs/system-reality-model.md`, `docs/p0-hardening-roadmap.md`, `docs/feature-maturity-matrix.md`, `docs/rbac-permission-architecture.md`

## Era 17 — Commercial identity / SSO IdP staging

### KOS-E17-045 — Pilot GO/NO-GO SSO pilot_ready gate (P0)
- ID: `KOS-E17-045`
- Title: Era 17 P0 #4 — wire SSO pilot_ready gate into GO/NO-GO evaluator
- Module: Commercial / GTM + Enterprise identity
- Priority: P0 (Workstream D + Workstream A Cycle 3)
- Status: **sso_pilot_ready_gate_wired**
- Decision: `era17-pilot-gono-go-v1` extends `era17-enterprise-sso-pilot-ready-v1` — blocks GO when `PILOT_GONOGO_SSO_PILOT_REQUIRED=1` and gate not promotionAllowed
- Evidence: `lib/commercial/pilot-gono-go-summary.ts` (`deriveSsoPilotReadyGatePass`), updated smoke orchestrator
- Next: Ops completes Cycle 2 IdP proof; re-run gate + GO/NO-GO with `PILOT_GONOGO_SSO_PILOT_REQUIRED=1` for SSO pilot contracts

### KOS-E17-044 — Enterprise SSO pilot_ready gate (Workstream A Cycle 3)
- ID: `KOS-E17-044`
- Title: Era 17 Workstream A Cycle 3 — pilot_ready gate evaluator (dormant until Cycle 2 proof)
- Module: Enterprise identity / Security
- Priority: P0 (SSO IdP staging login → pilot_ready path)
- Status: **awaiting_idp_login_proof**
- Decision: `era17-enterprise-sso-pilot-ready-v1` — promotes to pilot_ready only when IdP staging artifact shows proof_passed; default pilot_foundation
- Evidence: `lib/enterprise/enterprise-sso-pilot-ready-era17-policy.ts`, `scripts/smoke-enterprise-sso-pilot-ready-gate-era17.ts`, `artifacts/enterprise-sso-pilot-ready-gate-summary.json` (`ssoDeliveryStatus: pilot_foundation`, `gateOutcome: pilot_foundation_awaiting_proof`)
- Next: Ops completes Cycle 2 IdP login proof; re-run gate smoke for qualified promotionAllowed

### KOS-E17-043 — Pilot GO/NO-GO P0 staging proof gates (P0)
- ID: `KOS-E17-043`
- Title: Era 17 P0 #4 — wire p0-staging-proof-unblock into GO/NO-GO evaluator
- Module: Commercial / GTM
- Priority: P0 (Workstream D — paid pilot GO/NO-GO)
- Status: **p0_gates_wired**
- Decision: `era17-pilot-gono-go-v1` extends `era17-p0-staging-proof-unblock-v1` — four P0 evidence gates block GO until `p0ProofStatus: proof_passed`
- Evidence: `lib/commercial/pilot-gono-go-summary.ts` (`deriveP0StagingProofPass`, child gates), updated smoke orchestrator
- Next: Ops configures staging secrets; re-run `smoke:p0-staging-proof-unblock` then `smoke:pilot-gono-go` when all P0 proofs pass

### KOS-E18-008 — Shift variance acknowledgment gate (P1)
- ID: `KOS-E18-008`
- Title: Era 18 Workstream F Cycle 8 — bounded manager ack + note for non-zero variance
- Module: POS
- Priority: P1 (shift audit / financial trust)
- Status: **shift_variance_ack_wired**
- Decision: `era18-pos-shift-variance-ack-v1` — checkbox + note required; server validates via `getShiftCloseoutVariance`
- Evidence: `components/dashboard/pos-shift-close-form.tsx`, `actions/pos.ts`, `lib/pos/pos-shift-closeout-preview.ts`
- Next: Shift close history list with variance badges (bounded)

### KOS-E18-007 — KDS queue clarity polish (P1)
- ID: `KOS-E18-007`
- Title: Era 18 Workstream G Cycle 7 — queue strip, ticket numbers, prep/expo sections
- Module: Kitchen / KDS
- Priority: P1 (kitchen-native clarity vs Toast expo)
- Status: **kds_queue_clarity_wired**
- Decision: `era18-kds-queue-clarity-v1` — summary strip, oldest-first sort, prep vs ready sections
- Evidence: `components/kitchen/kds-daily-service.tsx`, `lib/kitchen/kds-queue-clarity-era18.ts`
- Next: KDS staging Playwright PASS when ops credentials configured (KOS-E17-015)

### KOS-E18-006 — Shift closeout variance preview UI (P1)
- ID: `KOS-E18-006`
- Title: Era 18 Workstream F Cycle 6 — live expected cash and variance preview on shift close
- Module: POS
- Priority: P1 (shift workflow / financial clarity)
- Status: **shift_closeout_preview_wired**
- Decision: `era18-pos-shift-closeout-preview-v1` — opening + cash sales + expected + live variance; note prompt for non-zero variance
- Evidence: `components/dashboard/pos-shift-close-form.tsx`, `lib/pos/pos-shift-closeout-preview.ts`, `services/pos/pos-shift-service.ts` (`listOpenShiftCloseoutPreviews`)
- Next: Shift close history with variance badges (bounded); no automated approval claim

### KOS-E18-005 — Persona default landing redirect (P1)
- ID: `KOS-E18-005`
- Title: Era 18 Workstream J Cycle 5 — staff post-auth lands on persona primary workflow
- Module: Dashboard / Auth / UX
- Priority: P1 (operator speed — fixes legacy STAFF → kitchen misroute)
- Status: **operator_default_landing_wired**
- Decision: `era18-operator-default-landing-v1` — sign-in, login page, signup, auth callback use `resolvePostAuthPathForSessionUser`
- Evidence: `lib/navigation/resolve-operator-post-auth-path.ts`, `lib/navigation/operator-home-era18.ts` (`resolveOperatorDefaultLandingPath`)
- Next: Shift variance close preview UI (bounded); optional `/dashboard` hub-only mode for staff bookmarks

### KOS-E18-004 — Pilot integration health strip (P1)
- ID: `KOS-E18-004`
- Title: Era 18 Workstream C Cycle 19 — compact integration health on manager operator home
- Module: Integrations / Dashboard
- Priority: P1 (pilot transparency)
- Status: **pilot_integration_health_strip_wired**
- Decision: `era18-pilot-integration-health-strip-v1` — real connection rows + webhook backlog; links to full `/dashboard/integration-health`
- Evidence: `components/dashboard/pilot-integration-health-strip.tsx`, `app/dashboard/page.tsx`
- Next: Woo/Shopify live smoke PASS when ops credentials configured

### KOS-E18-003 — Role-based operator home MVP (P1)
- ID: `KOS-E18-003`
- Title: Era 18 Workstream J Cycle 43 — focused dashboard home for cashier/kitchen/manager
- Module: Dashboard / UX
- Priority: P1 (operator speed, Square IA gap)
- Status: **operator_home_mvp_wired**
- Decision: `era18-operator-home-v1` — persona resolver + quick actions; owners keep `HomeOverview`
- Evidence: `lib/navigation/operator-home-era18.ts`, `components/dashboard/operator-home-panel.tsx`, `app/dashboard/page.tsx`
- Next: Deeper persona customization post-pilot; landing already wired (`era18-operator-default-landing-v1`)

### KOS-E18-002 — POS manager discount terminal UI (P1)
- ID: `KOS-E18-002`
- Title: Era 18 Workstream F Cycle 30 — manager discount UI on POS terminal
- Module: POS
- Priority: P1 (operator speed / pilot commercial depth)
- Status: **terminal_discount_ui_wired**
- Decision: `era18-pos-manager-discount-ui-v1` — fixed/percent/comp controls gated by `pos.discount.apply`; uses existing `pos-discount-guard`
- Evidence: `components/dashboard/pos-terminal-client.tsx`, `lib/pos/pos-terminal-discount-ui.ts`, `tests/unit/pos-terminal-discount-ui.test.ts`
- Next: Bounded manager variance acknowledgment UI; no Toast parity claim

### KOS-E18-001 — Era 18 P0 staging proof ops checklist (P0)
- ID: `KOS-E18-001`
- Title: Era 18 Cycle 1 — P0 staging secrets vault + ops checklist
- Module: Commercial / DevOps
- Priority: P0 (Workstream A Cycle 1)
- Status: **ops_checklist_complete**
- Decision: `era17-p0-staging-proof-unblock-v1` — env var catalog (11) + `docs/era18-p0-staging-proof-ops-checklist.md`; enhanced `--checklist-only` output
- Evidence: `lib/commercial/p0-staging-proof-unblock-era17-policy.ts` (`P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG`), `docs/era18-p0-staging-proof-ops-checklist.md`
- Next: **Ops** configures 11 env vars in vault; re-run `smoke:p0-staging-proof-unblock` until `p0ProofStatus: proof_passed` (Era 18 Cycle 2)

### KOS-E17-042 — P0 staging proof unblock orchestrator (P0)
- ID: `KOS-E17-042`
- Title: Era 17 P0 ops bundle — aggregate SSO + GitHub + channel live staging proofs
- Module: Commercial / DevOps
- Priority: P0 (unblock operator execution)
- Status: **awaiting_ops_credentials**
- Decision: `era17-p0-staging-proof-unblock-v1` — one smoke runs child P0 smokes #1–#3; honest SKIPPED when secrets missing
- Evidence: `lib/commercial/p0-staging-proof-unblock-era17-policy.ts`, `scripts/smoke-p0-staging-proof-unblock-era17.ts`, `artifacts/p0-staging-proof-unblock-summary.json` (`p0ProofStatus: awaiting_ops_credentials`, `overall: SKIPPED`)
- Next: Ops configures staging/IdP/channel secrets per `docs/era18-p0-staging-proof-ops-checklist.md`; re-run `smoke:p0-staging-proof-unblock`

### KOS-E17-041 — Enterprise SSO procurement sync (Workstream A Cycle 6 + Cycle 3 gate)
- ID: `KOS-E17-041`
- Title: Era 17 Workstream A Cycle 6 — procurement pack FAQ sync for pilot_foundation SSO (+ Cycle 3 gate section)
- Module: Enterprise identity / GTM
- Priority: P0 support depth (Workstream A Cycle 6 / Cycle 3 procurement)
- Status: **procurement_sync_complete**
- Decision: `era17-enterprise-sso-procurement-sync-v1` — buyer FAQ + security questionnaire aligned; extends `era17-enterprise-sso-pilot-ready-v1`; delivery **pilot_foundation** unchanged
- Evidence: `docs/enterprise-procurement-pack.md` (gate section + authoritative stance), `lib/enterprise/enterprise-sso-procurement-sync-era17-policy.ts`, `test:ci:enterprise-sso-procurement-sync-era17:cert`
- Next: P0 Cycle 2 IdP login proof when staging credentials available; re-run procurement cert after gate promotionAllowed

### KOS-E17-040 — Enterprise SSO tenant mapping hardening (Workstream A Cycle 5)
- ID: `KOS-E17-040`
- Title: Era 17 Workstream A Cycle 5 — callback guard tenant/domain deny matrix
- Module: Enterprise identity / Security
- Priority: P0 support depth (Workstream A Cycle 5)
- Status: **tenant_mapping_test_backed**
- Decision: `era17-enterprise-sso-tenant-mapping-v1` — six required deny/allow scenarios unit-tested; delivery **pilot_foundation** unchanged
- Evidence: `lib/enterprise/enterprise-sso-tenant-mapping-era17-policy.ts`, `tests/unit/enterprise-sso-tenant-mapping-era17.test.ts`, `test:ci:enterprise-sso-tenant-mapping-era17:cert`
- Next: Workstream A Cycle 6 — procurement pack sync; P0 Cycle 2 IdP login proof when staging credentials available

### KOS-E17-039 — Enterprise SSO operator runbook (Workstream A Cycle 4)
- ID: `KOS-E17-039`
- Title: Era 17 Workstream A Cycle 4 — qualified SSO pilot operator runbook
- Module: Enterprise identity / Support
- Priority: P0 support depth (Workstream A Cycle 4)
- Status: **operator_runbook_ready**
- Decision: `era17-enterprise-sso-operator-runbook-v1` — break-glass, rollback, entitlements, support boundaries; delivery **pilot_foundation** unchanged
- Evidence: `docs/enterprise-sso-operator-runbook-era17.md`, `lib/enterprise/enterprise-sso-operator-runbook-era17-policy.ts`, `smoke:enterprise-sso-operator-runbook`, `test:ci:enterprise-sso-operator-runbook-era17:cert`
- Next: Workstream A Cycle 5 — domain/email mapping hardening tests; P0 Cycle 2 IdP login proof when staging credentials available

### KOS-E17-038 — Era 18 handoff input (P2)
- ID: `KOS-E17-038`
- Title: Era 17 Cycle 45 — Era 18 master prompt input with honest P0 carry-forward
- Module: Governance / Platform
- Priority: P2 (Workstream L Cycle 45)
- Status: **era17_complete_awaiting_p0_ops_proof**
- Decision: `era17-era18-handoff-input-v1` — Era 17 success criteria **NOT MET**; Era 18 theme **staging_proof_and_first_paid_pilot**
- Evidence: `docs/next-master-prompt-input-2026-05-28-era18.md`, `lib/governance/era17-era18-handoff-policy.ts`, `test:ci:era17-era18-handoff:cert`
- Next: Era 18 Cycle 1 — execute P0 SSO IdP staging proof when credentials available

### KOS-E17-037 — Era 17 scorecard refresh (P2)
- ID: `KOS-E17-037`
- Title: Era 17 Cycle 44 — evidence-based scorecard without inflation
- Module: Governance / Platform
- Priority: P2 (Workstream L Cycle 44)
- Status: **scorecard_published_awaiting_p0_proof**
- Decision: `era17-scorecard-refresh-v1` — governance 100 sustained; blended **89/100**; Era 17 success criteria **NOT MET**
- Evidence: `docs/era17-cycle-completion-scorecard-2026-05-28.md`, `lib/governance/era17-scorecard-policy.ts`, `test:ci:scorecard:cert`
- Next: Era 18 handoff input — **done**; see KOS-E17-038

### KOS-E17-036 — Pilot case study draft (P2)
- ID: `KOS-E17-036`
- Title: Era 17 Cycle 43 — internal case study draft gated on customer approval + pilot metrics
- Module: GTM / Sales proof
- Priority: P2 (Workstream K Cycle 43)
- Status: **internal_draft_awaiting_customer_approval**
- Decision: `era17-pilot-case-study-draft-v1` — internal scaffold only; no public publish without signed permission and verified KPIs
- Evidence: `docs/pilot-case-study-draft-era17.md`, `lib/commercial/pilot-case-study-draft-summary.ts`, `scripts/smoke-pilot-case-study-draft-era17.ts`, `test:ci:pilot-case-study-draft-era17:cert`
- Next: Era 17 scorecard refresh — **done**; see KOS-E17-037

### KOS-E17-035 — Competitor feature gap matrix refresh (P2)
- ID: `KOS-E17-035`
- Title: Era 17 Cycle 42 — competitor matrix aligned to re-audit §6 and Era 17 evidence
- Module: GTM / Product strategy
- Priority: P2 (Workstream K Cycle 42)
- Status: **evidence_aligned_awaiting_pilot_proof**
- Decision: `era17-competitor-feature-gap-matrix-refresh-v1` — sixteen competitors + forbidden parity claims; no leapfrog without pilot proof
- Evidence: `docs/competitor-feature-gap-matrix.md`, `lib/commercial/competitor-feature-gap-matrix-summary.ts`, `scripts/smoke-competitor-feature-gap-matrix-era17.ts`, `test:ci:competitor-feature-gap-matrix-era17:cert`
- Next: Case study draft — **done**; see KOS-E17-036

### KOS-E17-034 — Investor narrative one-pager v2 (P2)
- ID: `KOS-E17-034`
- Title: Era 17 Cycle 41 — investor one-pager gated on pilot metrics baseline
- Module: GTM / Founder
- Priority: P2 (Workstream K Cycle 41)
- Status: **template_only_awaiting_pilot_metrics**
- Decision: `era17-investor-narrative-onepager-v2-v1` — template + smoke gate; no live KPI narrative without baseline overall PASSED
- Evidence: `docs/investor-narrative-onepager-era17.md`, `lib/commercial/investor-narrative-onepager-summary.ts`, `scripts/smoke-investor-narrative-onepager-era17.ts`, `test:ci:investor-narrative-onepager-era17:cert`
- Next: Re-run after pilot week-2 baseline `overall: PASSED`; competitor matrix refresh — **done**; see KOS-E17-035

### KOS-E17-033 — Integration setup wizard friction (P1)
- ID: `KOS-E17-033`
- Title: Era 17 Cycle 34 — streamlined 5-step Woo/Shopify pilot setup wizard
- Module: Integrations / UX
- Priority: P1 (Workstream H Cycle 34)
- Status: **pilot_setup_wizard_ready**
- Decision: `era17-channel-pilot-setup-wizard-v1` — in-app wizard + collapsed advanced toggles
- Evidence: `docs/channel-pilot-setup-wizard-era17.md`, `test:ci:channel-pilot-setup-wizard-era17:cert`
- Next: P0 credential-blocked smokes (SSO Cycle 2, Woo/Shopify live) or Public API per-route scopes (Cycle 35)

### KOS-E17-032 — Permission denied UX consistency (P1)
- ID: `KOS-E17-032`
- Title: Era 17 Cycle 33 — standardized POS/KDS/dashboard RBAC denial cards
- Module: UX / RBAC
- Priority: P1 (Workstream H Cycle 33)
- Status: **permission_denied_ux_consistent**
- Decision: `era17-permission-denied-ux-v1` — shared copy + `PermissionDeniedSurfaceCard`
- Evidence: `docs/permission-denied-ux-era17.md`, `test:ci:permission-denied-ux-era17:cert`
- Next: Integration setup wizard friction (Cycle 34) — **done**; see KOS-E17-033

### KOS-E17-031 — Nav maturity sweep (P1)
- ID: `KOS-E17-031`
- Title: Era 17 Cycle 32 — classify Era 17 preview routes + nav honesty recert
- Module: Dashboard / UX
- Priority: P1 (Workstream H Cycle 32)
- Status: **nav_maturity_sweep_recertified**
- Decision: `era17-nav-maturity-sweep-v1` — 5 preview routes + focused nav zero-gap audit
- Evidence: `test:ci:nav-maturity-sweep-era17:cert`, `npm run smoke:nav-maturity-sweep-era17`
- Next: Permission denied UX consistency (Cycle 33) — **done**; see KOS-E17-032

### KOS-E17-030 — Costing pilot spot check (P1)
- ID: `KOS-E17-030`
- Title: Era 17 Cycle 31 — recipe → margin report pilot menu spot check
- Module: Costing / Ops
- Priority: P1 (Workstream G Cycle 31)
- Status: **pilot_menu_margin_spotcheck_documented**
- Decision: `era17-costing-pilot-spotcheck-v1` — fixture math + operator checklist
- Evidence: `docs/costing-pilot-spotcheck-era17.md`, `test:ci:costing-pilot-spotcheck-era17:cert`
- Next: Workstream H nav maturity sweep (Cycle 32) — **done**; see KOS-E17-031

### KOS-E17-029 — Pilot inventory messaging (P1)
- ID: `KOS-E17-029`
- Title: Era 17 Cycle 29 — sales training for POS-only depletion
- Module: Inventory / GTM
- Priority: P1 (Workstream G Cycle 30)
- Status: **pilot_inventory_messaging_ready**
- Decision: `era17-pilot-inventory-messaging-v1` — safe/forbidden phrases + demo script
- Evidence: `docs/pilot-inventory-messaging-era17.md`, `test:ci:pilot-inventory-messaging-era17:cert`
- Next: Costing pilot spot check (Cycle 31) — **done**; see KOS-E17-030

### KOS-E17-028 — POS-only inventory lock recert (P1)
- ID: `KOS-E17-028`
- Title: Era 17 Cycle 28 — reconfirm storefront depletion remains deferred_locked
- Module: Inventory / GTM
- Priority: P1 (Workstream G Cycle 29)
- Status: **pos_only_lock_recertified**
- Decision: `era17-pos-only-inventory-lock-v1` — expanded entrypoint scan + recert artifact
- Evidence: `docs/pos-only-inventory-lock-era17.md`, `test:ci:pos-only-inventory-lock-era17:cert`
- Next: Pilot inventory messaging (Cycle 30) — **done**; see KOS-E17-029

### KOS-E17-027 — KDS qualified sales one-pager (P1)
- ID: `KOS-E17-027`
- Title: Era 17 Cycle 27 — sales-safe KDS pilot wording + evidence paths
- Module: Kitchen / GTM
- Priority: P1 (Workstream F Cycle 28)
- Status: **sales_onepager_ready**
- Decision: `era17-kds-qualified-sales-onepager-v1` — qualified pilot wording; no rush-hour claim
- Evidence: `docs/kds-qualified-sales-onepager-era17.md`, `test:ci:kds-qualified-sales-onepager-era17:cert`
- Next: POS-only inventory lock recert (Cycle 29) — **done**; see KOS-E17-028

### KOS-E17-026 — Partner webhook integration docs (P1)
- ID: `KOS-E17-026`
- Title: Era 17 Cycle 26 — partner-facing inbound/outbound webhook contract
- Module: Developer platform / Webhooks
- Priority: P1 (Workstream C Cycle 14)
- Status: **partner_webhook_docs_ready**
- Decision: `era17-partner-webhook-docs-v1` — partner doc + pack + smoke summary
- Evidence: `docs/partner-webhook-integration-era17.md`, `test:ci:partner-webhook-docs-era17:cert`
- Next: KDS qualified sales one-pager (Cycle 28) — **done**; see KOS-E17-027; Playwright proof remains ops-blocked (KOS-E17-015)

### KOS-E17-025 — POS receipt / shift closeout spot check (P1)
- ID: `KOS-E17-025`
- Title: Era 17 Cycle 25 — shift variance + receipt total spot check
- Module: POS / Ops
- Priority: P1 (Workstream E Cycle 24)
- Status: **closeout_math_spotcheck_documented**
- Decision: `era17-pos-receipt-shift-spotcheck-v1` — `pos-shift-closeout-math` + operator spot check doc
- Evidence: `docs/pos-receipt-shift-spotcheck-era17.md`, `test:ci:pos-receipt-shift-spotcheck-era17:cert`
- Next: Partner webhook docs (Cycle 14) — **done**; see KOS-E17-026 — **done**; see KOS-E17-026

### KOS-E17-024 — POS software-only operator runbook (P1)
- ID: `KOS-E17-024`
- Title: Era 17 Cycle 24 — daily golden path operator runbook for web-first POS
- Module: POS / Ops
- Priority: P1 (Workstream E Cycle 23)
- Status: **operator_runbook_ready**
- Decision: `era17-pos-operator-runbook-v1` — shifts, checkout, receipts, closeout + smoke summary
- Evidence: `docs/pos-software-only-operator-runbook-era17.md`, `test:ci:pos-operator-runbook-era17:cert`
- Next: Receipt / shift report spot check (Cycle 24) — **done**; see KOS-E17-025

### KOS-E17-023 — Public POST abuse review (P1)
- ID: `KOS-E17-023`
- Title: Era 17 Cycle 23 — rate limits on high-risk public POST routes
- Module: Security / Platform
- Priority: P1 (Workstream C Cycle 13)
- Status: **p1_public_post_guards_expanded**
- Decision: `era17-public-post-abuse-v1` — experiment auto-conclude, IoT ingest, billing portal guards
- Evidence: `lib/security/public-post-abuse-matrix.ts`, `docs/public-post-abuse-review-era17.md`, `test:ci:public-post-abuse-era17:cert`
- Next: Partner webhook docs (Cycle 14) — **done**; see KOS-E17-026

### KOS-E17-022 — POS manager discount / override depth (P1)
- ID: `KOS-E17-022`
- Title: Era 17 Cycle 22 — manager discount guard + COMPED RBAC edge cases
- Module: POS / RBAC
- Priority: P1 (Workstream E Cycle 21)
- Status: **discount_guard_depth_enforced**
- Decision: `era17-pos-manager-discount-v1` — `pos-discount-guard` + action/service validation
- Evidence: `lib/pos/pos-discount-guard.ts`, `docs/pos-manager-discount-operator-guide-era17.md`, `test:ci:pos-manager-discount-era17:cert`
- Next: Receipt / shift report spot check (Cycle 24); manager discount UI deferred

### KOS-E17-021 — Commerce webhook incident drill (P1)
- ID: `KOS-E17-021`
- Title: Era 17 Cycle 21 — Stripe/Woo/Shopify webhook incident operator checklist
- Module: Security / Ops
- Priority: P1 (Workstream C Cycle 12)
- Status: **awaiting_commerce_webhook_drill_execution**
- Decision: `era17-commerce-webhook-drill-v1` — six-step incident drill + summary artifact
- Evidence: `lib/security/commerce-webhook-drill-era17-policy.ts`, `docs/commerce-webhook-incident-drill-era17.md`, `test:ci:commerce-webhook-drill-era17:cert`
- Next: Partner webhook docs (Cycle 14) — **done**; see KOS-E17-026

### KOS-E17-020 — POS tablet UX polish + operator runbook (P1)
- ID: `KOS-E17-020`
- Title: Era 17 Cycle 20 — touch targets, checkout status clarity, software-only operator runbook
- Module: POS / UX
- Priority: P1 (Workstream E Cycle 22)
- Status: **tablet_ux_polished**
- Decision: `era17-pos-tablet-ux-v1` — terminal UX + PosAccessCard + operator runbook
- Evidence: `lib/pos/pos-tablet-ux-era17-policy.ts`, `docs/pos-tablet-ux-operator-runbook-era17.md`, `test:ci:pos-tablet-ux-era17:cert`
- Next: POS operator runbook depth (Cycle 23) — **done**; see KOS-E17-024

### KOS-E17-019 — Public API per-route scope enforcement (P1)
- ID: `KOS-E17-019`
- Title: Era 17 Cycle 19 — per-route Developer API scope guard on all v1 routes
- Module: Developer platform / Security
- Priority: P1 (Workstream I Cycle 35)
- Status: **per_route_scope_enforced**
- Decision: `era17-public-api-per-route-scope-v1` — `guardPublicApiV1Resource` + `api_keys.scopes_json`
- Evidence: `lib/api-public/public-api-v1-route-scopes.ts`, `lib/api-public/public-api-scopes.ts`, `test:ci:public-api-per-route-scope-era17:cert`
- Next: Partner smoke with restricted API key on staging (`smoke:public-api-live`); scope picker UI deferred

### KOS-E17-018 — Webhook replay P1 expansion (P1)
- ID: `KOS-E17-018`
- Title: Era 17 Cycle 18 — Resend ingress dedupe + Uber Eats replay cert
- Module: Security / Platform
- Priority: P1 (Workstream C Cycle 11)
- Status: **p1_ingress_dedupe_expanded**
- Decision: `era17-webhook-replay-p1-expansion-v1` — extends Era 16 guard to matrix P1 routes
- Evidence: `lib/security/webhook-replay-p1-expansion-era17-policy.ts`, Resend route ingress dedupe, `test:ci:webhook-replay-p1-expansion-era17:cert`
- Next: Commerce webhook drill executed on staging/tabletop; remaining P1 routes when pilot-critical

### KOS-E17-017 — Production calendar operator drill on staging (P1)
- ID: `KOS-E17-017`
- Title: Era 17 Cycle 17 — production calendar manual checklist on staging
- Module: Production / Ops
- Priority: P1 (Workstream F Cycle 27)
- Status: **awaiting_staging_operator_drill** — honest skip re-run; `overall: SKIPPED` when drill prerequisites missing
- Decision: `era17-production-calendar-operator-drill-v1` — wiring cert + staging URL + manual attestation
- Evidence: `lib/production/production-calendar-operator-drill-summary.ts` (overall honesty gate), `scripts/smoke-production-calendar-operator-drill-era17.ts`, `artifacts/production-calendar-operator-drill-summary.json` (**overall: SKIPPED**, `drillProofStatus: proof_skipped_missing_prerequisites` re-run 2026-05-28)
- Next: Operator sets drill URL + email; completes seven-step checklist; re-run with `PRODUCTION_CALENDAR_DRILL_MANUAL=passed`

### KOS-E17-016 — Operational sign-off staging proof (P1)
- ID: `KOS-E17-016`
- Title: Era 17 Cycle 16 — KDS + production calendar staging sign-off with operator URL
- Module: Kitchen / Ops / Production
- Priority: P1 (Workstream F Cycle 26)
- Status: **awaiting_staging_operator_signoff**
- Decision: `era17-operational-signoff-staging-proof-v1` — wiring cert + staging URL + operator email + manual attestation
- Evidence: `lib/operations/operational-signoff-staging-proof-era17-policy.ts`, `scripts/smoke-operational-signoff-staging-era17.ts`, `artifacts/operational-signoff-staging-proof-summary.json` (**stagingProofStatus: proof_skipped_missing_prerequisites** locally 2026-05-28)
- Next: Operator sets staging URL + email; completes manual checklists; re-run for `proof_passed`

### KOS-E17-015 — KDS staging Playwright GitHub proof (P1)
- ID: `KOS-E17-015`
- Title: Era 17 Cycle 15 — KDS Playwright staging PASS with GitHub evidence
- Module: Kitchen / QA / DevOps
- Priority: P1 (Workstream F Cycle 25)
- Status: **awaiting_github_kds_playwright_pass** — honest skip re-run; `overall: SKIPPED` when proof prerequisites missing
- Decision: `era17-kds-staging-playwright-proof-v1` — wiring cert + GitHub run URL recording
- Evidence: `lib/kitchen/kds-staging-playwright-proof-summary.ts` (overall honesty gate), `scripts/smoke-kds-staging-playwright-era17.ts`, `artifacts/kds-staging-playwright-proof-summary.json` (**overall: SKIPPED**, `playwrightProofStatus: proof_skipped_missing_prerequisites` re-run 2026-05-28)
- Next: Operator runs `playwright-kds-staging.yml` on staging; record `GITHUB_KDS_STAGING_RUN_*`; re-run smoke for `proof_passed`

### KOS-E17-014 — Forbidden-claims enforcement before pilot sales (P0)
- ID: `KOS-E17-014`
- Title: Era 17 P0 #5 — pre-sales forbidden-claims enforcement orchestrator
- Module: Commercial / GTM / Governance
- Priority: P0 (Workstream D — forbidden claims before pilot sales)
- Status: **forbidden_claims_enforcement_wired** — smoke PASS locally; GO/NO-GO gate active
- Decision: `era17-pilot-forbidden-claims-enforcement-v1` — strict verify-claims + registry audit + procurement cert chain; consumed by `era17-pilot-gono-go-v1`
- Evidence: `lib/commercial/pilot-forbidden-claims-enforcement-era17-policy.ts`, `lib/commercial/pilot-gono-go-summary.ts` (`deriveForbiddenClaimsEnforcementPass`), `scripts/smoke-pilot-forbidden-claims-enforcement-era17.ts`, `artifacts/pilot-forbidden-claims-enforcement-summary.json` (**claimsEnforcementProofStatus: proof_passed** re-run 2026-05-28)
- Next: Re-run on release branch before each pilot contract; FAIL blocks sales until copy/registry/procurement corrected

### KOS-E17-013 — Pilot rollback drill + retrospective (P0)
- ID: `KOS-E17-013`
- Title: Era 17 Cycle 20 — exercise rollback plan once with honest skip semantics
- Module: Commercial / Ops
- Priority: P0 (Workstream D Cycle 20)
- Status: **awaiting_rollback_drill_execution**
- Decision: `era17-pilot-rollback-drill-v1` — six-step drill + retrospective artifact
- Evidence: `docs/pilot-rollback-drill-era17.md`, `scripts/smoke-pilot-rollback-drill-era17.ts`
- Next: Tabletop or staging drill before first paid pilot GO; Workstream A SSO Cycle 2 when creds available

### KOS-E17-012 — Pilot metrics baseline (P0)
- ID: `KOS-E17-012`
- Title: Era 17 Cycle 19 — pilot success metrics capture schema
- Module: Commercial / Product
- Priority: P0 (Workstream D Cycle 19)
- Status: **awaiting_baseline_capture** — honest skip re-run; `overall: SKIPPED` until all six KPIs captured
- Decision: `era17-pilot-metrics-baseline-v1` — six KPIs aligned with ICP Exhibit C; SKIPPED without pilot data
- Evidence: `lib/commercial/pilot-metrics-baseline-summary.ts` (overall honesty gate), `scripts/smoke-pilot-metrics-baseline-era17.ts`, `artifacts/pilot-metrics-baseline-summary.json` (**overall: SKIPPED**, `proof_skipped_missing_pilot_data` re-run 2026-05-28)
- Next: Capture week-2 snapshot after first paid pilot GO

### KOS-E17-011 — Pilot GO/NO-GO evaluator (P0)
- ID: `KOS-E17-011`
- Title: Era 17 Cycle 18 — paid pilot LOI / customer GO/NO-GO with honest NO-GO
- Module: Commercial / GTM
- Priority: P0 (Workstream D Cycle 18)
- Status: **awaiting_customer_execution**
- Decision: `era17-pilot-gono-go-v1` — aggregates tier artifacts + ICP; SKIPPED customer without LOI env
- Evidence: `lib/commercial/pilot-gono-go-summary.ts`, `scripts/smoke-pilot-gono-go-era17.ts`, `artifacts/pilot-gono-go-summary.json` (**decision: NO-GO** on 2026-05-28 re-run; honest blockers; tier preflight `overall: SKIPPED`)
- Next: First real LOI + qualified prospect (`PILOT_GONOGO_ICP_INPUT_JSON`); complete Tier 0 + Tier 2 on staging; re-run smoke for CONDITIONAL/GO only with evidence

### KOS-E17-010 — Pilot operator golden path (P0)
- ID: `KOS-E17-010`
- Title: Era 17 Cycle 17 — staging Tier 2 operator checklist + sign-off artifact
- Module: Commercial / Ops
- Priority: P0 (Workstream D Cycle 17)
- Status: **awaiting_operator_execution**
- Decision: `era17-pilot-operator-golden-path-v1` — 6-phase checklist; honest SKIPPED without staging operator env
- Evidence: `docs/pilot-operator-golden-path-era17.md`, `scripts/smoke-pilot-operator-golden-path-era17.ts`
- Next: Execute on staging with owner + staff; then run smoke:pilot-gono-go

### KOS-E17-009 — Pilot Tier 0/1 preflight (P0)
- ID: `KOS-E17-009`
- Title: Era 17 Cycle 16 — governance bundles + claims strict on release branch
- Module: Commercial / DevOps
- Priority: P0 (Workstream D Cycle 16)
- Status: **awaiting_tier_preflight_pass**
- Decision: `era17-pilot-tier-preflight-v1` — orchestrator records Tier 0/1 PASS/FAIL/SKIPPED; no fake GO
- Evidence: `lib/commercial/pilot-tier-preflight-era17-policy.ts`, `scripts/smoke-pilot-tier-preflight-era17.ts`, `artifacts/pilot-tier-preflight-summary.json` (`tier0ProofStatus: proof_skipped_missing_prerequisites`, `overall: SKIPPED` when Tier 0 skipped locally)
- Next: Run full smoke on release branch before paid pilot signature; Cycle 17 operator golden path

### KOS-E17-008 — Pilot ICP + contract template (P0)
- ID: `KOS-E17-008`
- Title: Era 17 Cycle 15 — qualified pilot ICP and contract language
- Module: Commercial / GTM
- Priority: P0 (Workstream D Cycle 15)
- Status: **template_ready**
- Decision: `era17-pilot-icp-contract-v1` — ICP criteria, disqualifiers, allowed/forbidden claims, duration, success metrics
- Evidence: `docs/pilot-icp-contract-template-era17.md`, `lib/commercial/pilot-icp-contract-era17.ts`
- Next: Legal review; use before first paid pilot signature

### KOS-E17-007 — Channel pilot playbook (P0)
- ID: `KOS-E17-007`
- Title: Era 17 Cycle 10 — one-page Woo/Shopify operator guide
- Module: Integrations / GTM
- Priority: P0 (Workstream B Cycle 10)
- Status: **operator_ready**
- Decision: `era17-channel-pilot-playbook-v1` — linked from commercial runbook; honest scope; sign-off checklist
- Evidence: `docs/channel-pilot-playbook-era17.md`, `lib/integrations/channel-pilot-playbook-era17-policy.ts`
- Next: Use in Tier 2 integrations phase + paid pilot GO/NO-GO

### KOS-E17-006 — Channel GitHub workflow first green (P0)
- ID: `KOS-E17-006`
- Title: Era 17 Cycle 9 — woo-shopify-staging-smoke.yml GitHub proof path
- Module: Integrations / CI
- Priority: P0 (Workstream B Cycle 9)
- Status: **awaiting_github_first_green**
- Decision: `era17-channel-github-workflow-first-green-v1` — record workflow_dispatch URL + outcome; honest skip without GitHub PASS
- Evidence: `lib/integrations/channel-github-workflow-first-green-era17-policy.ts`, `smoke-channel-github-workflow-first-green-era17.ts`
- Next: **Ops** — workflow_dispatch with staging secrets; record `GITHUB_WOO_SHOPIFY_STAGING_RUN_URL`

### KOS-E17-005 — Shopify live smoke proof path (P0)
- ID: `KOS-E17-005`
- Title: Era 17 Cycle 8 — Shopify live channel smoke with honest skip
- Module: Integrations / Shopify
- Priority: P0 (Workstream B Cycle 8)
- Status: **awaiting_live_credentials**
- Decision: `era17-channel-live-smoke-shopify-v1` — Shopify-specific proof path in shared orchestrator; explicit missing-env list
- Evidence: `lib/integrations/channel-live-smoke-shopify-era17-policy.ts`, updated orchestrator, cert tests, `artifacts/channel-live-smoke-summary.json` (`shopifyLiveProofStatus: proof_skipped_missing_prerequisites`, `overall: SKIPPED`)
- Next: **Ops** — set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL; re-run `smoke:woo-shopify-live` for `shopifyLiveProofStatus: proof_passed`

### KOS-E17-004 — Woo live smoke proof path (P0)
- ID: `KOS-E17-004`
- Title: Era 17 Cycle 7 — Woo live channel smoke with honest skip
- Module: Integrations / Woo
- Priority: P0 (Workstream B Cycle 7)
- Status: **awaiting_live_credentials**
- Decision: `era17-channel-live-smoke-woo-v1` — Woo-specific proof path; Shopify in Cycle 8 policy; explicit missing-env list
- Evidence: `lib/integrations/channel-live-smoke-woo-era17-policy.ts`, enhanced summary, `smoke-woo-shopify-live-era17.ts`, `artifacts/channel-live-smoke-summary.json` (`wooLiveProofStatus: proof_skipped_missing_prerequisites`, `overall: SKIPPED`)
- Next: **Ops** — set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL; re-run smoke for `wooLiveProofStatus: proof_passed`

### KOS-E17-003 — Staging workflows first green proof path (P0)
- ID: `KOS-E17-003`
- Title: Era 17 staging workflows first green GitHub evidence path
- Module: CI / DevOps / E2E staging
- Priority: P0 (Era 17 — Workstream parallel to SSO; P0 #2)
- Status: **awaiting_github_first_green**
- Decision: `era17-staging-workflows-first-green-v1` — GitHub run URL recording; explicit missing-env list; target ≥2/3 workflows PASSED
- Evidence: `lib/ci/staging-workflows-first-green-era17-policy.ts`, enhanced summary, `smoke-staging-workflows-first-green-era17.ts`, `artifacts/staging-workflows-first-green-summary.json` (`firstGreenProofStatus: proof_skipped_missing_prerequisites`, `overall: SKIPPED`; `githubPassedCount: 0/3`)
- Next: **Ops** — configure GitHub secrets; workflow_dispatch E2E + KDS (+ Woo/Shopify optional); record `GITHUB_*_RUN_URL` + outcomes; target ≥2/3 PASSED

### KOS-E17-002 — Staging IdP login proof (P0)
- ID: `KOS-E17-002`
- Title: Era 17 Cycle 2 — operator IdP login proof path with honest skip
- Module: Enterprise identity / SSO
- Priority: P0 (Era 17 Cycle 2 — Workstream A)
- Status: **awaiting_operator_proof**
- Decision: `era17-enterprise-sso-idp-login-proof-v1` — operator evidence env vars + enhanced smoke summary; **SKIPPED WITH REASON** when staging/IdP secrets absent
- Evidence: `lib/enterprise/enterprise-sso-idp-login-proof-era17-policy.ts`, enhanced `enterprise-sso-idp-staging-smoke-summary.ts`, `artifacts/enterprise-sso-idp-staging-smoke-summary.json` (`loginProofStatus: proof_skipped_missing_prerequisites`, `overall: SKIPPED` when secrets absent; wiring cert PASSED)
- Next: **Ops** — configure Okta/Entra + staging secrets; manual browser login; re-run `smoke:enterprise-sso-idp-staging` for `loginProofStatus: proof_passed`

### KOS-E17-001 — IdP staging smoke plan (P0)
- ID: `KOS-E17-001`
- Title: Add Era 17 enterprise SSO IdP staging smoke plan and orchestrator
- Module: Enterprise identity / SSO
- Priority: P0 (Era 17 Cycle 1 — Workstream A)
- Status: **completed**
- Decision: `era17-enterprise-sso-idp-staging-smoke-v1` — Okta/Entra test tenant ops doc; env vars; break-glass; rollback; `smoke:enterprise-sso-idp-staging`; delivery remains **pilot_foundation**
- Evidence: `docs/enterprise-sso-idp-staging-smoke-plan.md`, `lib/enterprise/enterprise-sso-idp-staging-smoke-summary.ts`, `scripts/smoke-enterprise-sso-idp-staging-era17.ts`, `test:ci:enterprise-sso-idp-staging-era17:cert`
- Next: **Ops** — Cycle 2 operator proof (`era17-enterprise-sso-idp-login-proof-v1`); see `docs/GITHUB_E2E_STAGING_SECRETS.md` SSO section

## Era 16 — Commercial identity / SSO R2

### KOS-E16-014 — Staging workflows first green evidence (P0)
- ID: `KOS-E16-014`
- Title: Add Era 16 staging workflows first green summary artifact and orchestrator
- Module: CI / E2E staging
- Priority: P0 (Era 16 Cycle 14 — closes strategic priority #5 gap post-scorecard)
- Status: **completed**
- Decision: `era16-staging-workflows-first-green-v1` — wiring cert + optional `/api/health` when secrets set; GitHub first green remains operator-run; `JOB_OMITTED_SECRETS_MISSING` honesty preserved; not in default `ci.yml`
- Evidence: `lib/ci/staging-workflows-first-green-summary.ts`, `scripts/smoke-staging-workflows-first-green-era16.ts`, `artifacts/staging-workflows-first-green-summary.json`, `test:ci:staging-workflows-first-green-era16:cert`
- Next: **Era 17** — record first green PASS from GitHub Actions with secrets configured

### KOS-E16-013 — Era 16 scorecard refresh (P1)
- ID: `KOS-E16-013`
- Title: Add Era 16 scorecard refresh and Era 17 handoff input
- Module: Governance
- Priority: P1 (Era 16 Cycle 13)
- Status: **completed**
- Decision: `era16-scorecard-refresh-v1` — 12 delivery cycles scored; overall 100 sustained; recommend Era 17; defer full re-audit
- Evidence: `lib/governance/era16-scorecard-policy.ts`, `docs/era16-cycle-completion-scorecard-2026-05-28.md`, `docs/next-master-prompt-input-2026-05-28-era16.md`, `test:ci:scorecard:cert`
- Next: **Era 17** — staging first green / SSO IdP smoke / ops proof (credential-dependent)

### KOS-E16-012 — Public API partner confidence (P0)
- ID: `KOS-E16-012`
- Title: Add Era 16 public API partner readiness pack with auth/error/rate-limit clarity
- Module: Developer platform / API
- Priority: P0 (Era 16 Cycle 12)
- Status: **completed**
- Decision: `era16-public-api-partner-confidence-v1` — v1 registry; partner checklist; OpenAPI bearer scheme; live smoke SKIPPED WITH REASON without key; **beta** — no SLA claim
- Evidence: `lib/api-public/public-api-partner-confidence-pack.ts`, `scripts/cert-public-api-partner-confidence-era16.ts`, `test:ci:public-api-partner-confidence-era16:cert`
- Next: Era 16 Cycle 13 — scorecard / next-era handoff (completed)

### KOS-E16-011 — Typecheck slice parallel reporting (P0)
- ID: `KOS-E16-011`
- Title: Add Era 16 typecheck slice report with per-slice PASSED/FAILED summary
- Module: DevOps / CI
- Priority: P0 (Era 16 Cycle 11)
- Status: **completed**
- Decision: `era16-typecheck-slice-report-v1` — `typecheck:ci:slices` runs all four slices without stopping at first failure; writes `artifacts/typecheck-slice-summary.json`; **does not replace** `typecheck:full`
- Evidence: `lib/ci/typecheck-slice-report.ts`, `scripts/run-typecheck-slices-report-era16.ts`, `test:ci:typecheck-slice-era16:cert`
- Next: Era 16 Cycle 12 — public API / partner confidence (completed)

### KOS-E16-010 — KDS / production calendar operational sign-off (P0)
- ID: `KOS-E16-010`
- Title: Add Era 16 unified operational sign-off artifact for KDS + production calendar
- Module: Kitchen / Production / Ops
- Priority: P0 (Era 16 Cycle 10)
- Status: **completed**
- Decision: `era16-operational-signoff-v1` — `operational-signoff-summary`; PASSED/FAILED/SKIPPED WITH REASON; sign-off template; not rush-hour certified
- Evidence: `lib/operations/operational-signoff-summary.ts`, `scripts/smoke-operational-signoff-era16.ts`, `test:ci:operational-signoff-era16:cert`
- Next: Era 16 Cycle 11 — typecheck slice improvement (completed)

### KOS-E16-009 — Commercial pilot GO/NO-GO evidence pack (P0)
- ID: `KOS-E16-009`
- Title: Add Era 16 single-page pilot decision pack with role checklists
- Module: GTM / Operations
- Priority: P0 (Era 16 Cycle 9)
- Status: **completed**
- Decision: `era16-commercial-pilot-evidence-pack-v1` — owner/manager/cashier/kitchen/support_admin checklists; allowed/forbidden features; rollback + escalation; GO/NO-GO evaluator; cert in `test:ci:commercial-pilot-runbook:cert`
- Evidence: `lib/commercial/commercial-pilot-evidence-pack.ts`, `scripts/cert-commercial-pilot-evidence-era16.ts`, `docs/commercial-pilot-runbook.md`
- Next: Era 16 Cycle 10 — operational sign-off (completed)

### KOS-E16-008 — Mutation registry linter (P0)
- ID: `KOS-E16-008`
- Title: Add Era 16 static linter for sensitive action mutation governance
- Module: Platform / RBAC
- Priority: P0 (Era 16 Cycle 8)
- Status: **completed**
- Decision: `era16-mutation-registry-linter-v1` — scans `actions/` for Prisma-write server mutations; requires registry helper, public guard, or documented allowlist; cert in `test:security`
- Evidence: `lib/permissions/mutation-registry-linter.ts`, `scripts/cert-mutation-registry-linter-era16.ts`, `test:ci:mutation-registry-linter-era16:cert`
- Next: Era 16 Cycle 9 — commercial pilot evidence pack (completed)

### KOS-E16-007 — Webhook replay hardening (P0)
- ID: `KOS-E16-007`
- Title: Add ingress dedupe for Uber Direct and Slack platform webhook routes
- Module: Platform / Security
- Priority: P0 (Era 16 Cycle 7)
- Status: **completed**
- Decision: `era16-webhook-replay-hardening-v1` — `WebhookIngressDedupe`; `recordWebhookIngressOrDuplicate`; Uber Direct + Slack handlers; invalid signature/replay tests; Uber Direct remains placeholder
- Evidence: `lib/webhooks/webhook-ingress-replay-guard.ts`, `prisma/migrations/20260528130000_webhook_ingress_dedupe/`, `test:ci:webhook-replay-hardening-era16:cert`
- Next: Era 16 Cycle 9 — commercial pilot evidence pack (completed)

### KOS-E16-006 — Webhook security matrix (P0)
- ID: `KOS-E16-006`
- Title: Add Era 16 webhook ingress security matrix with signature/replay classification
- Module: Platform / Security
- Priority: P0 (Era 16 Cycle 6)
- Status: **completed**
- Decision: `era16-webhook-security-matrix-v1` — 46 routes inventoried; P0/P1 commerce/delivery classified; `artifacts/webhook-security-matrix-summary.json`; SCIM bearer invalid-token test; cert in `test:security`
- Evidence: `lib/security/webhook-security-matrix.ts`, `scripts/cert-webhook-security-era16.ts`, `test:ci:webhook-security-era16:cert`
- Next: Era 16 Cycle 7 — webhook replay hardening for highest-risk P1 gaps (Uber Direct, Slack)

### KOS-E16-005 — Live Woo/Shopify smoke proof (P0)
- ID: `KOS-E16-005`
- Title: Add Era 16 live channel smoke orchestrator with explicit skip/fail summary
- Module: Integrations / Channels
- Priority: P0 (Era 16 Cycle 5)
- Status: **completed**
- Decision: `era16-channel-live-smoke-v1` — `smoke:woo-shopify-live`; `artifacts/channel-live-smoke-summary.json`; SKIPPED WITH REASON when credentials missing; FAILED on real cert failure; workflow_dispatch staging smoke
- Evidence: `lib/integrations/channel-live-smoke-summary.ts`, `scripts/smoke-woo-shopify-live-era16.ts`, `.github/workflows/woo-shopify-staging-smoke.yml`, `test:ci:channel-live-smoke-era16:cert`
- Next: Era 16 Cycle 6 — staging first green evidence or webhook security matrix (per priority)

### KOS-E16-004 — SSO R2 pilot admin wiring (P0)
- ID: `KOS-E16-004`
- Title: Add admin-safe SSO pilot configuration and gated login entry
- Module: Platform / Security / Enterprise
- Priority: P0 (Era 16 Cycle 4)
- Status: **completed**
- Decision: `era16-enterprise-sso-r2-admin-v1` — Settings → Security → SSO pilot; `ssoOidc` gate; `/login` Sign in with SSO; `smoke:enterprise-sso-r2-pilot`; delivery **pilot_foundation**
- Evidence: `lib/enterprise/workspace-sso-admin-service.ts`, `actions/workspace-sso.ts`, `app/dashboard/settings/security/sso/page.tsx`, `components/auth/sso-login-entry.tsx`, `test:ci:enterprise-sso-r2-admin-era16:cert`
- Next: Era 16 Cycle 5 — staging IdP smoke proof (live login → dashboard → guarded mutation)

### KOS-E16-003 — SSO R2 runtime callback adapter (P0)
- ID: `KOS-E16-003`
- Title: Add Supabase SSO callback adapter with tenant/domain guardrails
- Module: Platform / Security / Enterprise
- Priority: P0 (Era 16 Cycle 3)
- Status: **completed**
- Decision: `era16-enterprise-sso-r2-runtime-v1` — callback adapter + audit events; delivery **pilot_foundation**; fail-closed gate; **no** production SSO UI
- Evidence: `lib/enterprise/workspace-sso-runtime-adapter.ts`, `lib/enterprise/workspace-sso-callback-service.ts`, `app/auth/callback/route.ts`, `test:ci:enterprise-sso-r2-runtime-era16:cert`
- Next: Era 16 Cycle 4 — SSO pilot admin/runtime wiring + staging smoke

### KOS-E16-002 — SSO R2 schema foundation (P0)
- ID: `KOS-E16-002`
- Title: Add workspace SSO settings and IdP identity mapping schema
- Module: Platform / Security / Enterprise
- Priority: P0 (Era 16 Cycle 2)
- Status: **completed**
- Decision: `era16-enterprise-sso-r2-schema-v1` — `WorkspaceSsoSettings`, `SsoIdentity`; R2 **schema_ready**; delivery **pilot_foundation**; defaults disabled
- Evidence: `prisma/schema.prisma`, `prisma/migrations/20260528120000_enterprise_sso_r2_schema/`, `lib/enterprise/workspace-sso-foundation.ts`, `test:ci:enterprise-sso-r2-schema-era16:cert`
- Next: Era 16 Cycle 3 — SSO callback adapter + runtime gate wiring

### KOS-E16-001 — SSO R2 pilot path decision (P0)
- ID: `KOS-E16-001`
- Title: Lock SSO R2 pilot integration path after auth architecture inspection
- Module: Platform / Security / Enterprise
- Priority: P0 (Era 16 Cycle 1)
- Status: **completed**
- Decision: `era16-enterprise-sso-r2-pilot-v1` — R2 **design_locked**; path **`supabase_saml_sso`**; SSO delivery **not_implemented**; pilot IdP Okta or Entra ID
- Evidence: `lib/enterprise/enterprise-sso-r2-pilot-era16-policy.ts`, `docs/enterprise-sso-r2-pilot-design.md`, `test:ci:enterprise-sso-r2-pilot-era16:cert`
- Next: Era 16 Cycle 2 — schema + workspace SSO settings model

## Era 15 — KDS / enterprise / DevOps

### KOS-E15-006 — Era 15 scorecard refresh (P1)
- ID: `KOS-E15-006`
- Title: Scorecard refresh and era16 master-prompt handoff
- Module: Governance / Strategy
- Priority: P1 (Era 15 Cycle 6)
- Status: **completed**
- Decision: `era15-scorecard-refresh-v1` — 100/100 sustained; +1 QA/DevOps/KDS/Enterprise; `docs/next-master-prompt-input-2026-05-27-era15.md`
- Evidence: `lib/governance/era15-scorecard-policy.ts`, `docs/era15-cycle-completion-scorecard-2026-05-27.md`, `test:ci:scorecard:cert`
- Next: Era 16 theme selection (SSO R2 or live channel proof per handoff)

### KOS-E15-005 — Production calendar operator Era 15 recert (P1)
- ID: `KOS-E15-005`
- Title: Re-certify production calendar pilot operator checklist and honest scope
- Module: Production / Ops
- Priority: P1 (Era 15 Cycle 5)
- Status: **completed**
- Decision: `era15-production-calendar-operator-recert-v1` — manual sign-off checklist; `smoke:production-calendar`; no drag-and-drop/KDS sync/rush-hour claims
- Evidence: `lib/production/production-calendar-operator-depth-era15-policy.ts`, `test:ci:production-calendar-operator-depth-era15:cert`, `docs/production-calendar-operator-checklist.md`
- Next: staging manual sign-off by ops when environment available

### KOS-E15-004 — Typecheck slice Era 15 recert (P1)
- ID: `KOS-E15-004`
- Title: Re-certify strict typecheck slices and parallel CI job honesty
- Module: DevOps / Platform
- Priority: P1 (Era 15 Cycle 4)
- Status: **completed**
- Decision: `era15-typecheck-slice-recert-v1` — four slices at 6GB; `typecheck:full` at 8GB remains canonical in `quality`; `smoke:typecheck-slices`
- Evidence: `lib/ci/typecheck-slice-era15-policy.ts`, `test:ci:typecheck-slice-era15:cert`, `docs/devops-release-enterprise-readiness.md`
- Next: profile OOM hotspots if full typecheck fails in CI; no strictness reduction

### KOS-E15-003 — Staging workflows first-run Era 15 recert (P1)
- ID: `KOS-E15-003`
- Title: Re-certify optional GitHub staging workflow ops and skip honesty
- Module: DevOps / QA
- Priority: P1 (Era 15 Cycle 3)
- Status: **completed**
- Decision: `era15-staging-workflows-first-run-recert-v1` — `JOB_OMITTED_SECRETS_MISSING` vs PASSED/FAILED/SKIPPED WITH REASON; not in default `ci.yml`; `smoke:staging-workflows`
- Evidence: `lib/ci/staging-workflows-first-run-era15-policy.ts`, `test:ci:staging-workflows-first-run-era15:cert`, `docs/GITHUB_E2E_STAGING_SECRETS.md`
- Next: first green GitHub Actions run when staging secrets available (ops)

### KOS-E15-002 — Enterprise procurement Era 15 recert (P1)
- ID: `KOS-E15-002`
- Title: Re-certify enterprise procurement pack and buyer FAQ alignment
- Module: Platform / GTM / Security
- Priority: P1 (Era 15 Cycle 2)
- Status: **completed**
- Decision: `era15-enterprise-procurement-recert-v1` — pack + questionnaire sections; Era 14 CI evidence listed; SSO R2 still `not_started`; no SOC 2/SSO delivery claims
- Evidence: `lib/enterprise/enterprise-procurement-era15-policy.ts`, `test:ci:enterprise-procurement-era15:cert`, `docs/enterprise-procurement-pack.md`, `npm run smoke:enterprise-procurement`
- Next: SSO/SAML R2 only with explicit era budget (E8-2)

### KOS-E15-001 — KDS staging smoke Era 15 recert (P1)
- ID: `KOS-E15-001`
- Title: Re-certify KDS staging operational smoke and honest scope
- Module: Kitchen / KDS / DevOps
- Priority: P1 (Era 15 Cycle 1)
- Status: **completed**
- Decision: `era15-kds-staging-smoke-recert-v1` — bump/recall CI path; Playwright optional; `npm run smoke:kds-staging`; no rush-hour certification
- Evidence: `lib/kitchen/kds-staging-smoke-era15-policy.ts`, `test:ci:kds-staging-smoke-era15:cert`, `docs/kds-staging-smoke-checklist.md`
- Next: manual Tier B/E on staging when credentials available

## Era 14 — Nav / page maturity / RBAC / cron / integrations recert

### KOS-E14-006 — Era 14 scorecard refresh (P1)
- ID: `KOS-E14-006`
- Title: Scorecard refresh and era15 master-prompt handoff
- Module: Governance / Strategy
- Priority: P1 (Era 14 Cycle 6)
- Status: **completed**
- Decision: `era14-scorecard-refresh-v1` — 100/100 sustained; sub-area +1 for recert depth; `docs/next-master-prompt-input-2026-05-27-era14.md`
- Evidence: `lib/governance/era14-scorecard-policy.ts`, `docs/era14-cycle-completion-scorecard-2026-05-27.md`, `test:ci:scorecard:cert`
- Next: Era 15 theme selection (SSO R2 or KDS ops recert per handoff)

### KOS-E14-005 — Channel golden path Era 14 recert (P1)
- ID: `KOS-E14-005`
- Title: Re-certify Woo/Shopify golden path and honest integration scope
- Module: Integrations / Platform
- Priority: P1 (Era 14 Cycle 5)
- Status: **completed**
- Decision: `era14-channel-golden-path-recert-v1` — webhook → externalOrder → hub visibility; no kitchen Order auto-create; `smoke:channel-golden-path` for CI certs; `smoke:woo-shopify` staging-only
- Evidence: `lib/integrations/channel-golden-path-era14-policy.ts`, `test:ci:channel-golden-path-era14:cert`, `docs/channel-golden-path-honesty-checklist.md`
- Next: live store pilot via `npm run smoke:woo-shopify` when credentials available

### KOS-E14-004 — Cron surface Era 14 recert (P1)
- ID: `KOS-E14-004`
- Title: Re-certify production-only cron surface and experimental archive honesty
- Module: Platform / DevOps
- Priority: P1 (Era 14 Cycle 4)
- Status: **completed**
- Decision: `era14-cron-surface-recert-v1` — 16 production / 0 experimental on disk; 121+ archived; no new cron routes; pilot forbids `ENABLE_EXPERIMENTAL_CRONS`
- Evidence: `lib/cron/cron-surface-era14-policy.ts`, `test:ci:cron-hygiene-era14:cert`, `docs/cron-surface-honesty-checklist.md`, `npm run smoke:cron-surface`
- Next: periodic recert when cron inventory changes; never restore experimental routes without era sign-off

### KOS-E14-003 — Mutation access consolidation Era 14 recert (P1)
- ID: `KOS-E14-003`
- Title: Re-certify domain mutation registry narrative and scoped-helper honesty
- Module: Security / RBAC
- Priority: P1 (Era 14 Cycle 3)
- Status: **completed**
- Decision: `era14-mutation-access-consolidation-recert-v1` — registry delegation + wave-4 lib denial audits; documents scoped helpers outside registry; **no mass helper rewrite**
- Evidence: `lib/permissions/mutation-access-era14-policy.ts`, `test:ci:mutation-access-era14:cert`, `docs/mutation-access-consolidation-checklist.md`, `npm run smoke:mutation-access`
- Next: add registry rows when introducing new reusable domain mutation helpers

### KOS-E14-001 — Nav page maturity Era 14 recert (P1)
- ID: `KOS-E14-001`
- Title: Re-certify focused nav preview/placeholder routes have in-page honesty
- Module: Product / UX / GTM
- Priority: P1 (Era 14 Cycle 1)
- Status: **completed**
- Decision: `era14-nav-page-maturity-recert-v1` — automated `findNavPageMaturityHonestyGaps()` over `FINAL_NAVIGATION_GROUPS`; closes `/dashboard/staff/payroll` + `/dashboard/marketing/email-campaigns` preview gaps
- Evidence: `lib/navigation/nav-page-maturity-era14-policy.ts`, `test:ci:nav-page-maturity-era14:cert` (in `test:ci:page-maturity-sweep:cert`)
- Next: periodic recert when new preview routes ship in focused nav

### KOS-E14-002 — Cross-channel rewards Era 14 recert (P1)
- ID: `KOS-E14-002`
- Title: Re-certify dual-ledger rewards honesty and document deferred unified E2E
- Module: Growth / POS / Storefront
- Priority: P1 (Era 14 Cycle 2)
- Status: **completed**
- Decision: `era14-cross-channel-rewards-recert-v1` — unification `deferred_locked`; no cross-channel Playwright in `ci.yml`; `npm run smoke:cross-channel-rewards`
- Evidence: `lib/rewards/cross-channel-rewards-era14-policy.ts`, `test:ci:cross-channel-rewards-era14:cert`, `docs/cross-channel-rewards-honesty-checklist.md`
- Next: unified ledger only with explicit era budget + schema migration plan

## Era 13 — Enterprise delivery / identity

### KOS-E13-001 — Enterprise identity Era 13 recert (P1)
- ID: `KOS-E13-001`
- Title: Re-certify enterprise identity roadmap_only posture after Era 12
- Module: Enterprise / procurement
- Priority: P1 (Era 13 Cycle 1)
- Status: **completed**
- Decision: `era13-enterprise-identity-recert-v1` — SSO/SCIM `not_implemented`; SOC2 `not_certified`; R2 pilot `not_started`; no fake delivery claims
- Evidence: `lib/enterprise/enterprise-identity-era13-policy.ts`, `test:ci:enterprise-identity-era13:cert`, `docs/enterprise-procurement-pack.md`
- Next: SSO/SAML R2 **implementation** only with explicit era budget (E8-2)

### KOS-E13-002 — KDS staging workflow secrets alignment (P1)
- ID: `KOS-E13-002`
- Title: Align playwright-kds-staging.yml secrets with Era 12 E2E_LOGIN_PASSWORD convention
- Module: Kitchen / KDS / DevOps
- Priority: P1 (Era 13 Cycle 2)
- Status: **completed**
- Decision: `era13-kds-staging-workflow-secrets-align-v1` — legacy `E2E_PASSWORD` alias; job-level `E2E_LOGIN_PASSWORD` env
- Evidence: `lib/ci/kds-staging-workflow-secrets-era13-policy.ts`, `test:ci:kds-staging-workflow-secrets-era13:cert`
- Next: ~~first green KDS staging workflow run when secrets configured~~ — ops checklist documented Era 13 Cycle 3

### KOS-E13-003 — Staging workflows first-run ops (P1)
- ID: `KOS-E13-003`
- Title: Document first green run outcomes for optional staging GitHub workflows
- Module: DevOps / QA
- Priority: P1 (Era 13 Cycle 3)
- Status: **completed**
- Decision: `era13-staging-workflows-first-run-ops-v1` — `JOB_OMITTED_SECRETS_MISSING` when secrets unset; explicit PASSED/FAILED/SKIPPED WITH REASON; not in default `ci.yml`
- Evidence: `lib/ci/staging-workflows-first-run-era13-policy.ts`, `test:ci:staging-workflows-first-run-era13:cert`, `docs/GITHUB_E2E_STAGING_SECRETS.md`
- Next: operator runs first green `e2e-staging.yml` + `playwright-kds-staging.yml` when repo secrets configured (ops only)

### KOS-E13-004 — Production calendar operator depth (P1)
- ID: `KOS-E13-004`
- Title: Consolidate production calendar pilot operator scope and checklist
- Module: Production / Ops
- Priority: P1 (Era 13 Cycle 4)
- Status: **completed**
- Decision: `era13-production-calendar-operator-depth-v1` — honest scope (no drag-drop/KDS sync/delete UI); `npm run smoke:production-calendar`; manual checklist in `docs/production-calendar-operator-checklist.md`
- Evidence: `lib/production/production-calendar-operator-depth-era13-policy.ts`, `test:ci:production-calendar-operator-depth-era13:cert` (in `test:ci:production-calendar-move-ui:cert`)
- Next: pilot manual sign-off using checklist (ops); delete-task UI only if explicitly scoped in a future era

### KOS-E13-005 — Era 13 scorecard refresh (P1)
- ID: `KOS-E13-005`
- Title: Era 13 cycle completion scorecard and Era 14 master prompt input
- Module: Governance
- Priority: P1 (Era 13 Cycle 5)
- Status: **completed**
- Decision: `era13-scorecard-refresh-v1` — 100/100 overall; era14 handoff in `docs/next-master-prompt-input-2026-05-27-era13.md`
- Evidence: `lib/governance/era13-scorecard-policy.ts`, `docs/era13-cycle-completion-scorecard-2026-05-27.md`, `test:ci:scorecard:cert`
- Next: Era 14 theme selection (SSO R2 budget, nav maturity, or rewards honesty)

## Era 12 — Integration hardening / enterprise

### KOS-E12-001 — Channel golden path Era 12 recert (P1)
- ID: `KOS-E12-001`
- Title: Re-certify Woo/Shopify golden path including order hub visibility stage
- Module: Integrations / order hub
- Priority: P1 (Era 12 Cycle 1)
- Status: **completed**
- Decision: `era12-channel-golden-path-recert-v1` — wires `order_hub_visibility` to `loadOrderHubPageData`; no kitchen Order auto-create claim
- Evidence: `lib/integrations/channel-golden-path-era12-policy.ts`, `test:ci:channel-golden-path-era12:cert`
- Next: ~~live store smoke wiring~~ — **Done** Cycle 3 (`era12-channel-golden-path-smoke-v1`)

### KOS-E12-003 — Channel golden path staging smoke policy (P1)
- ID: `KOS-E12-003`
- Title: Certify Woo/Shopify staging smoke script wiring and honest scope
- Module: Integrations / DevOps
- Priority: P1 (Era 12 Cycle 3)
- Status: **completed**
- Decision: `era12-channel-golden-path-smoke-v1` — `npm run smoke:woo-shopify`; not in default CI; `--skip-live` documented; cert chained into `test:ci:channel-golden-path:cert`
- Evidence: `lib/integrations/channel-golden-path-smoke-era12-policy.ts`, `test:ci:channel-golden-path-smoke-era12:cert`
- Next: run smoke against real test shop when credentials available (ops only)

### KOS-E12-002 — E2E staging secrets alignment (P1)
- ID: `KOS-E12-002`
- Title: Align staging workflow GitHub secrets with Playwright `E2E_LOGIN_PASSWORD`
- Module: DevOps / E2E
- Priority: P1 (Era 12 Cycle 2)
- Status: **completed**
- Decision: `era12-e2e-staging-secrets-align-v1` — `e2e-staging.yml` + `closed-beta-gate.yml` accept canonical or legacy password secret; env always `E2E_LOGIN_PASSWORD`
- Evidence: `lib/ci/e2e-staging-secrets-era12-policy.ts`, `test:ci:e2e-staging-secrets-era12:cert`, `docs/GITHUB_E2E_STAGING_SECRETS.md`
- Next: rename repo secret `E2E_PASSWORD` → `E2E_LOGIN_PASSWORD` when convenient (optional ops)

### KOS-E12-004 — E2E staging auth wiring (P1)
- ID: `KOS-E12-004`
- Title: Wire Playwright auth.setup and dashboard-authed smoke into e2e-staging workflow
- Module: DevOps / E2E
- Priority: P1 (Era 12 Cycle 4)
- Status: **completed**
- Decision: `era12-e2e-staging-auth-wiring-v1` — `auth.setup` + `e2e/dashboard-auth.spec.ts`; excludes POS checkout and remediation IDOR from daily staging
- Evidence: `lib/ci/e2e-staging-auth-era12-policy.ts`, `test:ci:e2e-staging-auth-era12:cert`, `.github/workflows/e2e-staging.yml`
- Next: first green daily staging run after secrets configured (ops)

### KOS-E12-005 — Era 12 scorecard refresh (P1)
- ID: `KOS-E12-005`
- Title: Era 12 cycle completion scorecard and Era 13 master prompt input
- Module: Governance / strategy
- Priority: P1 (Era 12 Cycle 5)
- Status: **completed**
- Decision: `era12-scorecard-refresh-v1` — 99/100 overall; era13 handoff in `docs/next-master-prompt-input-2026-05-27-era12.md`
- Evidence: `lib/governance/era12-scorecard-policy.ts`, `docs/era12-cycle-completion-scorecard-2026-05-27.md`, `test:ci:scorecard:cert`

## Era 11 — DevOps scale / RBAC recert

### KOS-E11-005 — Era 11 scorecard refresh (P1)
- ID: `KOS-E11-005`
- Title: Era 11 cycle completion scorecard and Era 12 master prompt input
- Module: Governance / strategy
- Priority: P1 (Era 11 Cycle 5)
- Status: **completed**
- Decision: `era11-scorecard-refresh-v1` — 98/100 overall; era12 handoff in `docs/next-master-prompt-input-2026-05-27-era11.md`
- Evidence: `lib/governance/era11-scorecard-policy.ts`, `docs/era11-cycle-completion-scorecard-2026-05-27.md`, `test:ci:scorecard:cert`

### KOS-E11-004 — KDS Realtime staging workflow (P1)
- ID: `KOS-E11-004`
- Title: Optional GitHub Actions workflow for KDS Playwright staging Tier E
- Module: Kitchen / KDS / DevOps
- Priority: P1 (Era 11 Cycle 4)
- Status: **completed**
- Decision: `era11-kds-realtime-e2e-staging-workflow-v1` — `playwright-kds-staging.yml`; policy summary + artifact; not in `ci.yml`
- Evidence: `lib/ci/kds-realtime-e2e-staging-workflow-era11-policy.ts`, `test:ci:kds-realtime-e2e-staging-workflow-era11:cert`
- Next: run workflow on staging when secrets configured; no default CI job

### KOS-E11-003 — KDS Realtime Playwright staging (P1)
- ID: `KOS-E11-003`
- Title: Staging-only KDS Playwright spec with explicit skip summary artifact
- Module: Kitchen / KDS / QA
- Priority: P1 (Era 11 Cycle 3)
- Status: **completed**
- Decision: `era11-kds-realtime-e2e-staging-v1` — `e2e/kds-realtime-staging.spec.ts`; `test:ci:kds-realtime-e2e-staging:policy`; not in default `ci.yml`
- Evidence: `lib/ci/kds-realtime-e2e-staging-summary-policy.ts`, `test:ci:kds-realtime-e2e-staging-era11:cert`
- Next: ~~wire optional staging workflow~~ — **Done** Cycle 4 (`era11-kds-realtime-e2e-staging-workflow-v1`)

### KOS-E11-002 — Mutation access Era 11 recert (P1)
- ID: `KOS-E11-002`
- Title: Re-certify domain mutation registry after Era 10 production calendar status workflow
- Module: Security / RBAC
- Priority: P1 (Era 11 Cycle 2)
- Status: **completed**
- Decision: `era11-mutation-access-recert-v1` — registers `production_calendar` inline wave-4 gate; cert chains into `test:ci:mutation-access-consolidation:cert`
- Evidence: `lib/permissions/mutation-access-era11-policy.ts`, `test:ci:mutation-access-era11:cert`
- Next: permission helper consolidation only where safe; no mass rewrite

### KOS-E11-001 — Typecheck slice platform-auth (P1)
- ID: `KOS-E11-001`
- Title: Fourth typecheck slice for platform admin and auth surfaces
- Module: DevOps / CI
- Priority: P1 (Era 11 Cycle 1)
- Status: **completed**
- Decision: `era11-typecheck-slice-v3` — `typecheck:slice:platform-auth`; `typecheck:full` remains canonical in `quality`
- Evidence: `tsconfig.slice.platform-auth.json`, `lib/ci/typecheck-slice-era11-policy.ts`, `test:ci:typecheck-slice-era11:cert`
- Next: additional slices only if OOM persists on full typecheck

### KOS-E10-005 — Era 10 scorecard refresh (P1)
- ID: `KOS-E10-005`
- Title: Era 10 cycle completion scorecard and Era 11 master prompt input
- Module: Governance / strategy
- Priority: P1 (Era 10 Cycle 5)
- Status: **completed**
- Decision: `era10-scorecard-refresh-v1` — 97/100 overall; era11 handoff in `docs/next-master-prompt-input-2026-05-27-era10.md`
- Evidence: `lib/governance/era10-scorecard-policy.ts`, `docs/era10-cycle-completion-scorecard-2026-05-27.md`, `test:ci:scorecard:cert`

### KOS-E10-004 — KDS staging smoke recert (P1)
- ID: `KOS-E10-004`
- Title: Re-certify KDS operational smoke (bump + recall integration, honest gaps)
- Module: Kitchen / KDS
- Priority: P1 (Era 10 Cycle 4)
- Status: **completed**
- Decision: `era10-kds-staging-smoke-recert-v1` — extends `era4-kds-staging-smoke-v1`; adds recall integration test; no Playwright in default CI
- Evidence: `lib/kitchen/kds-staging-smoke-era10-policy.ts`, `test:ci:kds-staging-smoke-era10:cert`
- Next: Playwright KDS Realtime spec only with explicit era decision (Tier E)

### KOS-E10-003 — Production calendar status workflow UI (P1)
- ID: `KOS-E10-003`
- Title: Scheduled / in-progress / completed status controls on production calendar tasks
- Module: Production / operator depth
- Priority: P1 (Era 10 Cycle 3)
- Status: **completed**
- Decision: `era10-production-calendar-status-workflow-ui-v1` — per-task status select + `updatePlanTaskStatusAction`; allowlist SCHEDULED | IN_PROGRESS | COMPLETED
- Evidence: `lib/production/production-plan-task-status.ts`, `actions/production-calendar.ts`, `test:ci:production-calendar-status-workflow-ui:cert`
- Next: drag-and-drop still out of scope; no kitchen work-item sync claim

### KOS-E10-002 — Production calendar cross-week UI (P1)
- ID: `KOS-E10-002`
- Title: Week navigation and cross-week task reschedule on production calendar
- Module: Production / operator depth
- Priority: P1 (Era 10 Cycle 2)
- Status: **completed**
- Decision: `era10-production-calendar-cross-week-ui-v1` — `?week=` query + prev/next week links; ←/→ on Mon/Sun crosses weeks via existing `movePlanTaskAction`
- Evidence: `lib/production/production-calendar-week-navigation.ts`, `app/dashboard/production/calendar/page.tsx`, `test:ci:production-calendar-cross-week-ui:cert`
- Next: ~~task status workflow UI~~ — **Done** Cycle 3 (`era10-production-calendar-status-workflow-ui-v1`); no drag-and-drop claim

### KOS-E10-001 — Cross-channel rewards recert (P1)
- ID: `KOS-E10-001`
- Title: Re-certify dual-ledger rewards honesty (POS certified; no unified E2E claim)
- Module: Growth / POS / storefront / GTM
- Priority: P1 (Era 10 Cycle 1)
- Status: **completed**
- Decision: `era10-cross-channel-rewards-recert-v1` — extends `era4-cross-channel-rewards-v1` + `era6-dual-ledger-gtm-lock-v1`; prisma model separation + POS wiring recert; unification remains `deferred_locked`
- Evidence: `lib/rewards/cross-channel-rewards-era10-policy.ts`, `test:ci:cross-channel-rewards:cert`
- Next: unified rewards era only with explicit schema/migration budget; no fake cross-channel E2E

## Era 9 — Enterprise delivery / DevOps

### KOS-E9-005 — Era 9 scorecard refresh (P0)
- ID: `KOS-E9-005`
- Title: Document Era 9 completion, score deltas, and Era 10 master prompt input
- Module: Platform / GTM / engineering
- Priority: P0 (Era 9 Cycle 5)
- Status: **completed**
- Decision: `era9-scorecard-refresh-v1` — 96/100 overall; Era 10 handoff doc
- Evidence: `docs/era9-cycle-completion-scorecard-2026-05-27.md`, `lib/governance/era9-scorecard-policy.ts`, `test:ci:scorecard:cert`
- Next: Era 10 theme selection (SSO R2, cross-channel rewards, operator depth)

### KOS-E9-004 — RBAC wave 4 recert (P1)
- ID: `KOS-E9-004`
- Title: Era 9 wave-4 sensitive mutation recert (inventory + cert drift fix)
- Module: Platform / security
- Priority: P1 (Era 9 Cycle 4)
- Status: **completed**
- Decision: `era9-rbac-wave4-recert-v1` — static guard inventory for 11 wave-4 surfaces; `test:ci:rbac-wave4:cert` extended; no RBAC weakening
- Evidence: `lib/security/rbac-wave4-era9-policy.ts`, `tests/unit/rbac-wave4-era9-cert-live.test.ts`, `test:ci:rbac-wave4` in `test:security`
- Next: broader tenant-only grep only on new sensitive actions; do not reopen Era 4 POS E2E

### KOS-E9-003 — Cron surface recert (P1)
- ID: `KOS-E9-003`
- Title: Era 9 cron archive posture recert without new routes or weakened auth
- Module: DevOps / cron / pilot ops
- Priority: P1 (Era 9 Cycle 3)
- Status: **completed**
- Decision: `era9-cron-surface-recert-v1` — extends `era4-active-production-only-v1`; 16 production / 0 experimental on disk
- Evidence: `lib/cron/cron-surface-era9-policy.ts`, `tests/unit/cron-surface-era9-cert-live.test.ts`, `test:ci:cron-hygiene:cert`
- Next: no new experimental cron routes; revisit only if production manifest changes

### KOS-E9-002 — Governance bundles partition (P1)
- ID: `KOS-E9-002`
- Title: Split governance bundles for parallel CI without weakening quality gate
- Module: DevOps / CI
- Priority: P1 (Era 9 Cycle 2)
- Status: **completed**
- Decision: `era9-governance-bundles-partition-v1` — four matrix partitions; `quality` keeps `test:ci:governance-bundles`
- Evidence: `lib/ci/governance-bundles-partition-policy.ts`, `.github/workflows/ci.yml` job `governance-bundles-partitions`
- Next: local dev subset scripts or Era 9 scorecard refresh after more cycles

### KOS-E9-001 — SSO architecture spike R1 (P0)
- ID: `KOS-E9-001`
- Title: Document SAML/OIDC target architecture (design only)
- Module: Enterprise / security / GTM
- Priority: P0 (Era 9 Cycle 1)
- Status: **completed**
- Decision: `era9-enterprise-sso-architecture-spike-v1` — delivery `not_implemented`; R2 pilot prerequisites documented
- Evidence: `docs/enterprise-sso-architecture-spike-r1.md`, `test:ci:enterprise-sso-spike:cert`
- Next: R2 SSO pilot era (explicit budget)

## Era 8 — Operator depth / GTM hygiene

### KOS-E8-005 — Era 8 scorecard refresh
- ID: `KOS-E8-005`
- Title: Document Era 8 completion, score deltas, and Era 9 master prompt input
- Module: Platform / GTM / engineering
- Priority: P0 (Era 8 Cycle 5)
- Status: **completed**
- Decision: `era8-scorecard-refresh-v1` — 94/100 overall; era9 handoff in `next-master-prompt-input-2026-05-27-era8.md`
- Evidence: `docs/era8-cycle-completion-scorecard-2026-05-27.md`, `test:ci:scorecard:cert`
- Next: pick Era 9 cycle 1 theme from era8 prompt input §4

### KOS-E8-004 — Production calendar move-task UI (P1)
- ID: `KOS-E8-004`
- Title: Wire `movePlanTaskAction` on production planning calendar page
- Module: Production / RBAC / dashboard
- Priority: P1 (Era 8 Cycle 4)
- Status: **completed**
- Decision: `era8-production-calendar-move-ui-v1` — week-column ←/→ reschedule; RBAC + form deny unchanged
- Evidence: `app/dashboard/production/calendar/page.tsx`, `lib/production/production-calendar-move-ui-policy.ts`, `test:ci:production-calendar-move-ui:cert`
- Next: Era 8 scorecard refresh or SSO architecture spike (explicit era budget)

### KOS-E8-003 — Pilot preflight strict marketing claims (P1)
- ID: `KOS-E8-003`
- Title: Enforce `MARKETING_CLAIMS_STRICT=1` in paid pilot preflight
- Module: GTM / DevOps / commercial
- Priority: P1 (Era 8 Cycle 3)
- Status: **completed**
- Decision: `era8-pilot-preflight-claims-strict-v1` — `pilot-preflight.sh` fails on unqualified roadmap terms; default CI `verify-claims` remains warn-only
- Evidence: `lib/governance/pilot-preflight-claims-policy.ts`, `scripts/ops/pilot-preflight.sh`, `test:ci:pilot-preflight-claims:cert`
- Next: Era 8 scorecard refresh

### KOS-E8-002 — KDS Realtime Playwright E2E staging scope (P1)
- ID: `KOS-E8-002`
- Title: Document staging-only Realtime E2E; forbid default CI false confidence
- Module: Kitchen / KDS / QA
- Priority: P1 (Era 8 Cycle 2)
- Status: **completed**
- Decision: `era8-kds-realtime-e2e-staging-v1` — Tier E checklist; no Playwright spec in repo; not in `ci.yml` default jobs
- Evidence: `lib/kitchen/kds-realtime-e2e-staging-policy.ts`, `docs/kds-staging-smoke-checklist.md`, `test:ci:kds-realtime-e2e-staging:cert`
- Next: add `e2e/kds-realtime-*.spec.ts` only with explicit era decision

### KOS-E8-001 — Claims registry governance (P1)
- ID: `KOS-E8-001`
- Title: Resolve `needs-evidence` rows; CI cert for claims registry
- Module: GTM / marketing / commercial
- Priority: P1 (Era 8 Cycle 1)
- Status: **completed**
- Decision: `era8-claims-registry-v1` — food-cost claim reclassified `illustrative`; `needs-evidence` forbidden in CI
- Evidence: `lib/governance/claims-registry-policy.ts`, `config/marketing/claims-registry.json`, `test:ci:claims-registry:cert`
- Next: KDS Realtime E2E staging scope or production-calendar UI wiring

## Era 7 — Commercial readiness

### KOS-E7-005 — Era 7 scorecard refresh
- ID: `KOS-E7-005`
- Title: Document Era 7 commercial-readiness completion, score deltas, and Era 8 prompt input
- Module: Platform / GTM / engineering
- Priority: P0 (Era 7 Cycle 5)
- Status: **completed**
- Decision: `era7-scorecard-refresh-v1` — 4/4 commercial cycles closed; overall **92/100**; defer full re-audit
- Evidence: `docs/era7-cycle-completion-scorecard-2026-05-27.md`, `docs/next-master-prompt-input-2026-05-27-era7.md`, `lib/governance/era7-scorecard-policy.ts`
- Next: pick Era 8 cycle 1 theme from era7 prompt input §4

### KOS-E7-004 — Marketing claims governance (sales enablement)
- ID: `KOS-E7-004`
- Title: Matrix-aligned marketing claims scan with governance CI cert
- Module: GTM / marketing / commercial
- Priority: P1 (Era 7 Cycle 4)
- Status: **completed**
- Decision: `era7-marketing-claims-governance-v1` — forbidden phrases fail `verify-claims`; live marketing scan in `test:ci:marketing-claims-governance:cert`
- Evidence: `lib/governance/marketing-claims-governance-policy.ts`, `scripts/verify-marketing-claims.ts`, `config/marketing/claims-registry.json`
- Next: Era 7 scorecard refresh or claim-registry cleanup for `needs-evidence` rows

### KOS-E7-003 — Repo hygiene cert (`tests/node_modules/`)
- ID: `KOS-E7-003`
- Title: CI cert blocks tracked nested test installs under `tests/node_modules/`
- Module: DevOps / engineering hygiene
- Priority: P1 (Era 7 Cycle 3)
- Status: **completed**
- Decision: `era7-tests-node-modules-hygiene-v1` — `.gitignore` lines locked; `git ls-files` gate in `test:ci:repo-hygiene:cert`
- Evidence: `lib/ci/repo-hygiene-policy.ts`, `test:ci:repo-hygiene:cert` in `test:ci:governance-bundles`
- Next: claim-validator expansion or Era 7 scorecard refresh

### KOS-E7-002 — Storefront Stripe live-card E2E CI policy (E7-4)
- ID: `KOS-E7-002`
- Title: Honest optional Stripe browser E2E tier with PASSED/SKIPPED/FAILED artifact
- Module: Storefront / CI / QA
- Priority: P0 (Era 7 Cycle 2)
- Status: **completed**
- Decision: `era7-storefront-stripe-optional-v1` + `era7-storefront-stripe-secrets-accept-v1` — pay-later always-on; Stripe E2E when `STRIPE_SECRET_KEY` set; explicit `storefront-stripe-e2e-summary` artifact
- Evidence: `lib/ci/storefront-stripe-e2e-policy.ts`, `.github/workflows/ci.yml` (`storefront-money-path`), `test:ci:storefront-stripe-e2e:policy`, extended `test:ci:storefront-money-path:cert`
- Next: repo hygiene cert for `tests/node_modules/` or Era 7 scorecard after more cycles

### KOS-E7-001 — Commercial pilot runbook (E7-3)
- ID: `KOS-E7-001`
- Title: Canonical paid-pilot GO/NO-GO runbook aligned with feature maturity matrix
- Module: Product / GTM / Ops
- Priority: P0 (Era 7 Cycle 1)
- Status: **completed**
- Decision: `era7-commercial-pilot-runbooks-v1` — Tier 0–3 gates; deprecated `docs/PILOT_*` as non-canonical; forbidden pilot headline claims locked in policy tests
- Evidence: `docs/commercial-pilot-runbook.md`, `lib/commercial/commercial-pilot-runbook-policy.ts`, `test:ci:commercial-pilot-runbook:cert`
- Next: E7-4 Stripe storefront E2E tier honesty or E7-2 repo hygiene (`tests/node_modules/`)

## Era 6 — Customer value honesty

### KOS-E6-006 — Era 6 scorecard refresh
- ID: `KOS-E6-006`
- Title: Document Era 6 P0 completion, score deltas, and Era 7 prompt input
- Module: Platform / GTM / engineering
- Priority: P0 (Era 6 Cycle 6)
- Status: **completed**
- Decision: `era6-scorecard-refresh-v1` — 5/5 E6 P0 closed; overall **90/100**; defer full re-audit
- Evidence: `docs/era6-cycle-completion-scorecard-2026-05-27.md`, `docs/next-master-prompt-input-2026-05-27-era6.md`, `lib/governance/era6-scorecard-policy.ts`
- Next: pick Era 7 cycle 1 theme from era6 prompt input §4

### KOS-E6-005 — Enterprise identity annual review (E6-5)
- ID: `KOS-E6-005`
- Title: Annual SSO/SCIM/SOC2 roadmap review — roadmap_only delivery decision
- Module: Enterprise / GTM / security
- Priority: P0 (Era 6 Cycle 5)
- Status: **completed**
- Decision: `era6-enterprise-identity-roadmap-v1` — SSO/SCIM not_implemented; SOC2 Type II not_certified; refresh procurement pack; no fake delivery claims
- Evidence: `lib/enterprise/enterprise-identity-roadmap-policy.ts`, `docs/enterprise-procurement-pack.md`, `test:ci:enterprise-identity-roadmap:cert`
- Next: Era 6 scorecard refresh or P1 gitignore hygiene

### KOS-E6-004 — Production calendar void-form deny UX (P1 → E6-4)
- ID: `KOS-E6-004`
- Title: Production calendar HTML forms redirect on permission deny (copilot pattern)
- Module: Production / security / UX
- Priority: P1 closed in Era 6 Cycle 4
- Status: **completed**
- Decision: `era6-production-calendar-form-deny-v1` — `assertProductionCalendarFormGate` + `production_calendar_error` query param + page banner
- Evidence: `lib/production/production-calendar-form-mutation.ts`, `actions/production-calendar.ts`, `test:ci:rbac-wave4`
- Next: E6-5 SSO/SOC2 roadmap review or Era 6 scorecard refresh

### KOS-E6-003 — Typecheck slices parallel CI job (E6-3)
- ID: `KOS-E6-003`
- Title: Add optional `typecheck-slices` CI job; keep `typecheck:full` canonical in `quality`
- Module: DevOps / engineering
- Priority: P0 (Era 6 Cycle 3)
- Status: **completed**
- Decision: `era6-typecheck-slice-ci-v1` — `npm run typecheck:ci:slices` in parallel job at 6GB; `quality` still runs `npm run typecheck`
- Evidence: `.github/workflows/ci.yml`, `lib/ci/typecheck-slice-policy.ts`, `test:ci:typecheck-slice:cert`
- Next: production-calendar void-form deny UX (P1) or SSO/SOC2 roadmap review (E6-5)

### KOS-E6-002 — KDS realtime / poll fallback smoke (E6-2)
- ID: `KOS-E6-002`
- Title: Certify KDS poll fallback intervals and Realtime channel wiring; add Tier D checklist
- Module: Kitchen / KDS / QA
- Priority: P0 (Era 6 Cycle 2)
- Status: **completed**
- Decision: `era6-kds-realtime-smoke-v1` — 15s poll fallback + per-user channel naming unit-certified; manual Tier D staging verification; no rush-hour or Playwright Realtime claims
- Evidence: `lib/kitchen/kds-realtime-smoke-policy.ts`, `components/kitchen/kds-daily-service.tsx`, `test:ci:kds-realtime-smoke:cert`
- Next: typecheck slices in CI (E6-3) or production-calendar void-form deny UX (P1)

### KOS-E6-001 — Permanent dual-ledger rewards GTM lock (E6-1)
- ID: `KOS-E6-001`
- Title: Lock permanent dual-ledger rewards decision; forbid unified cross-channel GTM claims
- Module: Growth / GTM / rewards
- Priority: P0 (Era 6 Cycle 1)
- Status: **completed**
- Decision: `era6-dual-ledger-gtm-lock-v1` — unification `deferred_locked`; POS kitchen ledger + storefront ledger remain separate until explicit future era
- Evidence: `lib/rewards/cross-channel-rewards-policy.ts`, `tests/unit/cross-channel-rewards-gtm-lock-cert-live.test.ts`, `test:ci:cross-channel-rewards:cert`
- Next: KDS realtime smoke (E6-2) — **completed**; see `KOS-E6-002`

## Era 5 — Security CI consolidation

### KOS-E5-001 — RBAC wave 4 in security-db bundle
- ID: `KOS-E5-001`
- Title: Wire `test:ci:rbac-wave4` into `test:security` (security-db job)
- Module: Platform / security / CI
- Priority: P0 (Era 5 Cycle 1)
- Status: **completed**
- Decision: chain wave-4 bundle after integration PII tests; cert asserts order + security-db workflow
- Evidence: `package.json` (`test:security`), `tests/unit/rbac-wave4-ci-live.test.ts`, `test:ci:rbac-wave4:cert`
- Next: storefront inventory depletion decision (E5-1) or POS E2E secrets in CI (E5-5)

### KOS-E5-002 — Typecheck slice 2 (storefront / marketing)
- ID: `KOS-E5-002`
- Title: Add strict typecheck slice for public storefront and GTM/marketing pages
- Module: DevOps / engineering
- Priority: P0 (Era 5 Cycle 2)
- Status: **completed**
- Decision: `era5-typecheck-slice-v2` — extends Era 4 slices with `typecheck:slice:storefront-marketing` (6GB); `typecheck:full` remains CI canonical
- Evidence: `tsconfig.slice.storefront-marketing.json`, `lib/ci/typecheck-slice-policy.ts`, `test:ci:typecheck-slice:cert`
- Next: POS E2E secrets policy closure (E5-5)

### KOS-E5-004 — Copilot void-form deny UX (E5-4)
- ID: `KOS-E5-004`
- Title: Copilot HTML form actions must not silently no-op on permission deny
- Module: Platform / AI / security
- Priority: P0 (Era 5 Cycle 4)
- Status: **completed**
- Decision: `era5-copilot-form-deny-v1` — `assertCopilotFormGate` redirects with `copilot_error`; refresh action returns `{ ok, error }` for client UI
- Evidence: `lib/ai/copilot-form-mutation.ts`, `actions/copilot.ts`, `tests/unit/copilot-form-deny.test.ts`, wave-4 bundle extended
- Next: Era 6 theme selection (rewards decision or KDS realtime smoke)

### KOS-E5-006 — Era 5 scorecard refresh
- ID: `KOS-E5-006`
- Title: Document Era 5 P0 completion, score deltas, and Era 6 prompt input
- Module: Platform / GTM / engineering
- Priority: P0 (Era 5 Cycle 6)
- Status: **completed**
- Decision: `era5-scorecard-refresh-v1` — 5/5 E5 P0 items closed; overall **86/100**; defer full re-audit
- Evidence: `docs/era5-cycle-completion-scorecard-2026-05-27.md`, `docs/next-master-prompt-input-2026-05-27-era5.md`, `lib/governance/era5-scorecard-policy.ts`
- Next: pick Era 6 cycle 1 theme from era5 prompt input §4

### KOS-E5-005 — POS E2E secrets policy closure (E5-5)
- ID: `KOS-E5-005`
- Title: Accept explicit fork skip for optional POS browser E2E; document required secrets
- Module: POS / CI / QA
- Priority: P0 (Era 5 Cycle 5)
- Status: **completed**
- Decision: `era5-pos-e2e-secrets-accept-v1` — forks without `E2E_LOGIN_*` stay green when tier-2b always-on passes; artifact must report SKIPPED; secrets documented in TESTING + tier matrix
- Evidence: `lib/ci/pos-browser-e2e-policy.ts`, `tests/unit/pos-e2e-secrets-policy-cert-live.test.ts`, `test:ci:pos-money-path:cert`
- Next: Era 5 scorecard / next-era theme selection

### KOS-E5-003 — Permanent POS-only inventory GTM lock (E5-1)
- ID: `KOS-E5-003`
- Title: Lock storefront/API depletion as deferred; enforce honest GTM claims in CI
- Module: Inventory / GTM / sales
- Priority: P0 (Era 5 Cycle 3)
- Status: **completed**
- Decision: `era5-pos-only-gtm-lock-v1` — `deferred_locked`; no storefront hook until explicit future era; forbidden GTM phrases scanned in canonical sales docs
- Evidence: `lib/inventory/inventory-depletion-policy.ts`, `tests/unit/inventory-depletion-gtm-lock-cert-live.test.ts`, matrix + positioning updates
- Next: implement storefront depletion only when payment/idempotency design + cert gates are scoped (new era item)

## Era 4 — Cross-channel operational truth

### KOS-E4-001 — Inventory depletion channel policy (POS-only)
- ID: `KOS-E4-001`
- Title: Formalize POS-only inventory depletion; prohibit unified cross-channel stock claims
- Module: Inventory / storefront / POS
- Priority: P0 (Era 4 Cycle 1)
- Status: **completed (policy)** — implementation of storefront hook deferred
- Decision: `era4-pos-only-v1` — certified channel: POS only
- Evidence: `lib/inventory/inventory-depletion-policy.ts`, `test:ci:inventory-depletion:cert`, canonical matrix + positioning updates
- Next: ~~optional storefront depletion~~ — locked `deferred_locked` (Era 5 Cycle 3 / KOS-E5-003)

### KOS-E4-002 — POS browser E2E CI policy (tier 2b optional + explicit status)
- ID: `KOS-E4-002`
- Title: POS browser E2E must not silently pass when skipped
- Module: POS / CI / QA
- Priority: P0 (Era 4 Cycle 2)
- Status: **completed**
- Decision: `era4-tier2b-optional-v1` — always-on unit/integration/inventory; optional Playwright; always-on policy summary + artifact
- Evidence: `lib/ci/pos-browser-e2e-policy.ts`, `scripts/pos-browser-e2e-ci-policy.ts`, `.github/workflows/ci.yml`, `test:ci:pos-browser-e2e:policy`, `test:ci:pos-money-path:cert`
- Next: RBAC wave 4 residuals (batch 2)

### KOS-E4-003 — RBAC wave 4 residuals (batch 1)
- ID: `KOS-E4-003`
- Title: Close residual sensitive mutations (routes, copilot, demo, feedback, integrations, production calendar, holiday packages)
- Module: Platform / security
- Priority: P0 (Era 4 Cycle 3)
- Status: **completed (batch 1)**
- Evidence: `lib/routes/require-route-mutation.ts`, `lib/ai/require-copilot-mutation.ts`, `lib/demo/require-demo-mutation.ts`, `lib/feedback/require-app-feedback-submit.ts`, `test:ci:rbac-wave4`, `test:ci:rbac-wave4:cert`

### KOS-E4-006 — RBAC wave 4 residuals (batch 2)
- ID: `KOS-E4-006`
- Title: Close restaurant tables, customer subscriptions, and experiment ethics review mutations
- Module: Platform / security / FOH preview / CRM / storefront
- Priority: P0 (Era 4 Cycle 6)
- Status: **completed**
- Evidence: `lib/restaurant/require-restaurant-table-mutation.ts` (`pos.access`), `requireCrmMutation` on `actions/customer-subscription.ts`, `requireStorefrontManageActor` on `actions/experiment-ethics-review.ts`, extended `test:ci:rbac-wave4`
- Residual: ~~broader tenant-only grep sweep~~ — **Era 9 Cycle 4 recert** locks 11 wave-4 surfaces via `era9-rbac-wave4-recert-v1`; new sensitive actions need explicit wave entry

### KOS-E4-004 — Cron experimental surface archive
- ID: `KOS-E4-004`
- Title: Archive experimental cron routes off App Router; certify 16 production-only active surface
- Module: DevOps / platform
- Priority: P0 (Era 4 Cycle 4)
- Status: **completed**
- Evidence: 121 slugs in `archive/cron-routes/`, `config/cron-archive-manifest.json`, `test:ci:cron-hygiene:cert` includes `cron-archive-era4-cert-live`
- Ops restore: `npm run cron:restore:archived -- --execute` (see `docs/CRON_ARCHIVE_RUNBOOK.md`)

### KOS-E4-005 — Woo / Shopify golden path proof
- ID: `KOS-E4-005`
- Title: Certify external order ingest path without overclaiming full integration live ops
- Module: Integrations / channels / order hub
- Priority: P0 (Era 4 Cycle 5)
- Status: **completed**
- Decision: `era4-channel-golden-path-v1` — webhook/sync normalize → `externalOrder` → channel import staging → order hub external visibility; kitchen Order auto-create **not** certified
- Evidence: `lib/integrations/channel-golden-path-policy.ts`, `tests/fixtures/channel-golden-path/`, `test:ci:channel-golden-path`, `test:ci:channel-golden-path:cert` (in `test:ci:governance-bundles`), `scripts/smoke-woo-shopify-certification.ts` for staging/live store
- Next: enterprise procurement basics or additional typecheck slices

### KOS-E4-007 — Typecheck slice 1 (dashboard / services / API)
- ID: `KOS-E4-007`
- Title: First strict typecheck slice for operational spine without weakening full CI gate
- Module: DevOps / platform
- Priority: P0 (Era 4 Cycle 7)
- Status: **completed (slice 1)**
- Decision: `era4-typecheck-slice-v1` — `typecheck:full` remains CI canonical; local slices `typecheck:slice:services-core` (6GB) and `typecheck:slice:dashboard-services-api` (6GB); slices omit `.next/types` to avoid archived-cron validator noise
- Evidence: `tsconfig.base.json`, `tsconfig.slice.dashboard-services-api.json`, `lib/ci/typecheck-slice-policy.ts`, `test:ci:typecheck-slice:cert`
- Next: storefront/marketing slices or wire optional CI parallel slice job

### KOS-E4-008 — Enterprise procurement basics
- ID: `KOS-E4-008`
- Title: Canonical enterprise procurement pack without false SSO/SOC2/SCIM claims
- Module: Product / security / GTM
- Priority: P0 (Era 4 Cycle 8)
- Status: **completed**
- Decision: `era4-procurement-honesty-v1` — single canonical pack for questionnaires and RFPs; deprecated enterprise audit family for posture
- Evidence: `docs/enterprise-procurement-pack.md`, `lib/enterprise/enterprise-procurement-policy.ts`, `test:ci:enterprise-procurement:cert`
- Next: nav maturity sweep or permission helper consolidation

### KOS-E4-009 — Cross-channel loyalty / gift card honesty
- ID: `KOS-E4-009`
- Title: Certify POS kitchen-ledger rewards wiring; document dual-ledger storefront scope
- Module: Growth / POS / storefront
- Priority: P0 (Era 4 Cycle 9)
- Status: **completed**
- Decision: `era4-cross-channel-rewards-v1` — POS gift card + loyalty redeem certified; **not** unified cross-channel; storefront `redeemGiftCardPartial` unwired
- Evidence: `lib/rewards/cross-channel-rewards-policy.ts`, `test:ci:cross-channel-rewards`, `tests/unit/pos-rewards-checkout-wiring.test.ts`
- Next: wire storefront checkout gift-card redeem OR explicit product decision to keep separate

### KOS-E4-010 — KDS staging operational smoke
- ID: `KOS-E4-010`
- Title: One honest KDS v1 operational smoke path (CI + staging checklist + DB script)
- Module: Kitchen ops / QA
- Priority: P0 (Era 4 Cycle 10)
- Status: **completed**
- Decision: `era4-kds-staging-smoke-v1` — automated queue→bump in `test:ci:kds-v1:integration`; staging checklist + `smoke:kds-daily`; **not** rush-hour or realtime Playwright certified
- Evidence: `lib/kitchen/kds-staging-smoke-policy.ts`, `docs/kds-staging-smoke-checklist.md`, `test:ci:kds-staging-smoke:cert`
- Next: Era 5 theme selection (see `docs/next-master-prompt-input-2026-05-27-era4.md`)

### KOS-E4-013 — Era 4 scorecard refresh
- ID: `KOS-E4-013`
- Title: Document Era 4 completion, score deltas, and Era 5 prompt input
- Module: Platform / GTM / engineering
- Priority: P0 (Era 4 Cycle 13)
- Status: **completed**
- Decision: `era4-scorecard-refresh-v1` — 12/12 execution map items closed; overall **82/100**; defer full re-audit
- Evidence: `docs/era4-cycle-completion-scorecard-2026-05-27.md`, `docs/next-master-prompt-input-2026-05-27-era4.md`, `lib/governance/era4-scorecard-policy.ts`
- Next: pick Era 5 cycle 1 theme from era4 prompt input §4

### KOS-E4-012 — Nav / page maturity sweep
- ID: `KOS-E4-012`
- Title: In-page honesty for preview/placeholder dashboard routes
- Module: Product / UX / GTM
- Priority: P0 (Era 4 Cycle 12)
- Status: **completed**
- Decision: `era4-page-maturity-sweep-v1` — `PageMaturityRouteNotice` in dashboard layout; honesty copy from `NAV_MATURITY_RULES`; inline PlaceholderBanner pages exempt from duplicate
- Evidence: `lib/navigation/page-maturity-honesty.ts`, `test:ci:page-maturity-sweep:cert`
- Next: Era 4 scorecard refresh

### KOS-E4-011 — Permission helper consolidation
- ID: `KOS-E4-011`
- Title: Domain mutation registry + shared denial audit for wave-4 helpers
- Module: Platform / security
- Priority: P0 (Era 4 Cycle 11)
- Status: **completed**
- Decision: `era4-mutation-access-consolidation-v1` — canonical narrative in `docs/rbac-permission-architecture.md`; registry at `lib/permissions/domain-mutation-registry.ts`; `logDomainMutationDenied` adopted by routes/demo/restaurant-table helpers
- Evidence: `test:ci:mutation-access-consolidation`, `test:ci:mutation-access-consolidation:cert`
- Next: nav/page maturity sweep

## P0 — Platform Safety
### KOS-P0-001 — Canonical RBAC rollout for sensitive mutations
- ID: `KOS-P0-001`
- Title: Canonical RBAC rollout for sensitive mutations
- Module: Platform / security
- Priority: P0
- Owner role: Platform architect
- Business value: prevents trust-breaking authorization gaps
- Technical value: unifies fragmented permission logic
- User story: as an owner or operator, I need permissions to be predictable and enforced server-side
- Current state: mixed central registry, legacy fallback, and domain-specific gates
- Progress update: **Era 3 Cycle 99 — audit sensitive detail in security CI bundle** — `tests/unit/audit-sensitive-detail-rbac.test.ts` wired into `test:security`; `test:ci:audit-center-rbac:cert` asserts full audit-center RBAC suite; **Era 3 Cycle 98 — audit sensitive detail RBAC** — before/after/diff JSON visibility requires `audit.export` via `canViewSensitiveAuditDetailFromGrants`; `stripSensitiveDetailForViewer` uses canonical boolean gate (`tests/unit/audit-sensitive-detail-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 97 — audit center view/read RBAC wave 3** — `resolveScope` requires `reports.read.audit` with denial audits; workspace lookup uses owner `dataUserId` (staff session-id leak fix); retention read uses `workspace.settings` (`tests/unit/audit-center-actions-rbac.test.ts`); **Era 3 Cycle 96 — audit center RBAC in security CI bundle** — `tests/unit/audit-center-actions-rbac.test.ts` wired into `test:security` (security-db job); wiring gate `test:ci:audit-center-rbac:cert` in `test:ci:governance-bundles`; **Era 3 Cycle 95 — audit center mutation RBAC wave 3** — `runAuditExportAction` requires `audit.export`; `upsertAuditRetentionAction` requires `workspace.settings`; denial audits via `lib/audit/require-audit-center-mutation-access.ts`; page flags aligned to canonical grants (`tests/unit/audit-center-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 94 — global search RBAC in security CI bundle** — `tests/unit/global-search-actions-rbac.test.ts` wired into `test:security` (security-db job); wiring gate `test:ci:global-search-rbac:cert` in `test:ci:governance-bundles`; **Era 3 Cycle 93 — platform email bypass in security CI bundle** — `tests/unit/platform-email-bypass-closure.test.ts` wired into `test:security` (security-db job); wiring gate `test:ci:platform-email-bypass:cert` in `test:ci:governance-bundles`; **Era 3 Cycle 92 — support ticket comment RBAC wave 3** — `addSupportTicketComment` uses `requireSupportCommentMutationAccess` with `support_comment.permission_denied` audits (`tests/unit/support-tickets-actions-rbac.test.ts`); **Era 3 Cycle 91 — support ticket triage/status RBAC wave 3** — `assignSupportTicket`, `updateSupportTicketStatus`, `escalateSupportTicketAction` use `requireSupportTriageAccess` / `requireSupportStatusMutationAccess` with denial audits (`tests/unit/support-tickets-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 90 — partner org provision RBAC wave 3** — `createPartnerOrganization` uses `requirePartnerProvisionActor` (platform GTM bridge + denial audits) before mutations (`tests/unit/partner-operations-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 89 — order creation RBAC in security CI bundle** — `tests/unit/order-creation-rbac.test.ts` wired into `test:security` (security-db job); wiring gate `test:ci:order-creation-rbac:cert` in `test:ci:governance-bundles`; **Era 3 Cycle 88 — global search RBAC + tenant scope wave 3** — `actions/global-search.ts` requires `workspace.view`, uses owner `dataUserId` for scoped search (fixes staff session-id leak), denial audits (`tests/unit/global-search-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 87 — forecast AI page RBAC wave 3** — `/dashboard/forecast/ai` gates on `copilot.read.financial` via `requireForecastAiPageAccess` (closes direct `getAIOrderForecast` bypass); **Era 3 Cycle 86 — kitchen AI tools RBAC wave 3** — `actions/kitchen-ai.ts` gates OpenAI insight actions on copilot capabilities via `lib/ai/require-kitchen-ai-actor.ts` with `kitchen_ai.permission_denied` audits (`tests/unit/kitchen-ai-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 85 — label print queue RBAC wave 3** — `actions/label-print-queue.ts` mutations require `reports.read.audit` with `nutrition_label_print.permission_denied` audits (`tests/unit/label-print-queue-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 84 — webhook replay workspace RBAC wave 3** — `actions/webhook-replay.ts` workspace surface requires `integrations.manage` via `requireIntegrationsActor` before tenant replay (`tests/unit/webhook-replay-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 83 — order creation denial audit wave 3** — `lib/orders/order-create-access.ts` records `orders.permission_denied` on deny; `createOrderViaCenterAction` checks RBAC before tenant actor; `tests/unit/order-creation-rbac.test.ts` wired into `test:ci:rbac-wave3`; **Era 3 Cycle 82 — settings self-account RBAC wave 3** — `lib/settings/require-self-account-mutation.ts` documents self-service password/email/avatar paths; owner `companyName` on profile requires `workspace.settings` (`tests/unit/settings-self-account-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 81 — kitchen settings RBAC wave 3** — `actions/settings.ts` `updateKitchenSettings` requires `workspace.settings` with `kitchen_settings.permission_denied` audits (`tests/unit/settings-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 80 — onboarding mutations RBAC wave 3** — `actions/onboarding.ts` wizard mutations require `workspace.settings` with `onboarding.permission_denied` audits (`tests/unit/onboarding-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 79 — legacy implementation actions RBAC wave 3** — `actions/implementation.ts` mutations require canonical permissions (`go-live.manage`, `integrations.manage`, `customers.manage`) with `implementation.permission_denied` audits (`tests/unit/implementation-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 78 — public POST fail-closed ROI route certification** — `tests/unit/roi-lead-route-fail-closed.test.ts` certifies `app/api/leads/roi/route.ts` wiring to `enforcePublicMarketingPostGuard` (503 when guard rejects, 400 invalid payload); wired into `test:ci:public-post-fail-closed` alongside IoT/NPS guard + route tests; **Era 3 Cycle 77 — location legacy create and switcher RBAC wave 3** — `actions/locations.ts` legacy create requires `workspace.settings`; active location switch requires tenant actor and tenant-owned location ids (`tests/unit/locations-actions-rbac.test.ts`); **Era 3 Cycle 76 — location create/bulk-assign RBAC wave 3** — `actions/locations.ts` full create and bulk assign require `workspace.settings` with `locations.permission_denied` audits (`tests/unit/locations-actions-rbac.test.ts`); **Era 3 Cycle 75 — location hours/archive RBAC wave 3** — `actions/locations.ts` pickup/delivery hours require `routes.manage`, business hours and archive require `workspace.settings`, with `locations.permission_denied` audits (`tests/unit/locations-actions-rbac.test.ts`); **Era 3 Cycle 74 — location profile/fulfillment RBAC wave 3** — `actions/locations.ts` profile updates require `workspace.settings`, fulfillment updates require `routes.manage`, with `locations.permission_denied` audits (`tests/unit/locations-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 73 — module preferences RBAC wave 3** — `actions/module-preferences.ts` mutations require `workspace.settings` with `module_preferences.permission_denied` audits (`tests/unit/module-preferences-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 72 — brands RBAC wave 3** — `actions/brands.ts` mutations require `workspace.settings` with `brands.permission_denied` audits (`tests/unit/brands-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 71 — operating mode RBAC wave 3** — `actions/operating-mode.ts` mutation requires `workspace.settings` via `requireSettingsCenterMutation("manage_operations")` with settings denial audits (`tests/unit/operating-mode-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 70 — legacy catering RBAC wave 3** — `actions/catering.ts` mutations require `orders.manage` with `catering.permission_denied` audits (`tests/unit/catering-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 69 — catering quotes RBAC wave 3** — `actions/catering-quotes.ts` mutations require `orders.manage` with `catering_quotes.permission_denied` audits (`tests/unit/catering-quotes-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 68 — operations checklist RBAC wave 3** — `actions/operations.ts` mutations require `production.manage` with `operations.permission_denied` audits (`tests/unit/operations-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 67 — nutrition label settings RBAC wave 3** — `actions/nutrition-label-settings.ts` packing gates require `workspace.settings`, storefront label visibility requires `storefront.manage`, with `nutrition_label_settings.permission_denied` audits (`tests/unit/nutrition-label-settings-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 66 — allergen profile RBAC wave 3** — `actions/allergen-profile.ts` upsert requires `products.edit` with `allergen_profile.permission_denied` audits (`tests/unit/allergen-profile-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 65 — nutrition label verification RBAC wave 3** — `actions/nutrition-label-verification.ts` verify/status mutations require `reports.read.audit` with `nutrition_label_verification.permission_denied` audits (`tests/unit/nutrition-label-verification-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 64 — ingredient declaration RBAC wave 3** — `actions/ingredient-declaration.ts` upsert requires `products.edit` with `ingredient_declaration.permission_denied` audits (`tests/unit/ingredient-declaration-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 63 — nutrition profile RBAC wave 3** — `actions/nutrition-profile.ts` upsert requires `products.edit` with `nutrition_profile.permission_denied` audits (`tests/unit/nutrition-profile-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 62 — product categories RBAC wave 3** — `actions/product-categories.ts` requires `products.edit` with `product_categories.permission_denied` audits (`tests/unit/product-categories-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 61 — inventory RBAC certification** — existing `actions/inventory.ts` `production.manage` gates certified with denial audit `sessionUserId` parity and `tests/unit/inventory-actions-rbac.test.ts` wired into `test:ci:rbac-wave3`; **Era 3 Cycle 60 — menus RBAC wave 3** — `actions/menus.ts` mutations require `products.edit` with `menus.permission_denied` audits (`tests/unit/menus-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 59 — products RBAC wave 3** — `actions/products.ts` mutations require `products.edit` with `products.permission_denied` audits (`tests/unit/products-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 58 — food safety RBAC wave 3** — `actions/food-safety.ts` mutations require `production.manage` with `food_safety.permission_denied` audits (`tests/unit/food-safety-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 57 — kitchen task RBAC wave 3** — `actions/kitchen-task.ts` mutations require `production.manage` with `kitchen_task.permission_denied` audits (`tests/unit/kitchen-task-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 56 — bank reconciliation RBAC wave 3** — `actions/accounting/bank-reconciliation.ts` CSV import and reconcile require `reports.read.financial` with `accounting.bank_reconciliation.permission_denied` audits (`tests/unit/bank-reconciliation-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 55 — packing verification RBAC wave 3** — `actions/packing-verification.ts` requires `packing.manage` with `packing.verification.permission_denied` audits; supervisor override keeps owner/platformBypass gate; tenant scope fixed to `dataUserId` (`tests/unit/packing-verification-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 54 — forecast actions RBAC wave 3** — `actions/forecast.ts` mutations require `production.manage` with `forecast.permission_denied` audits; archive/restore tenant scope fixed to `dataUserId` (`tests/unit/forecast-actions-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 53 — accounts payable RBAC wave 3** — `actions/accounting/ap.ts` create/match require `production.manage`, approve/mark-paid require `reports.read.financial`, with `accounting.ap.permission_denied` audits (`tests/unit/accounting-ap-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 52 — scorecard refresh** — incremental Era 3 scorecard (Overall 71→**73**, DevOps 75→**78**, QA 71→**75**) in `canonical-doc-index.md`, `full-strategic-reaudit-2026-05-27.md` §Step 20, `next-master-prompt-input-2026-05-27.md`; live consistency gate `tests/unit/scorecard-ci-live.test.ts` (`test:ci:scorecard:cert`, last in `test:ci:governance-bundles`); CI wiring P0 gap marked resolved; **Era 3 Cycle 51 — doc canon CI certification** — live wiring gate `tests/unit/doc-canon-ci-live.test.ts` (`test:ci:doc-canon:cert`, chained first in `test:ci:governance-bundles` before `test:ci:doc-canon`) certifies canonical index, deprecated-family notice, gateway audit banners, and governance bundle alignment; **Era 3 Cycle 50 — public API v1 CI certification** — live wiring gate `tests/unit/public-api-v1-ci-live.test.ts` (`test:ci:public-api-v1:cert`, chained in `test:ci:governance-bundles` before `test:ci:public-api-v1`) certifies all eight v1 routes use `guardPublicApi` fail-closed wiring, unit bundle script alignment, and matrix doc coverage; **Era 3 Cycle 49 — integration honesty CI certification** — live wiring gate `tests/unit/integration-honesty-ci-live.test.ts` (`test:ci:integration-honesty:cert`, chained in `test:ci:governance-bundles` with `test:ci:integration-honesty`) certifies marketplace placeholder registry/channel/nav alignment, UI Placeholder badges, and no fake health scores; **Era 3 Cycle 48 — nav/maturity governance CI certification** — live wiring gate `tests/unit/nav-maturity-governance-ci-live.test.ts` (`test:ci:nav-governance:cert`, chained in `test:ci:governance-bundles` with `test:ci:nav-governance`) certifies `NAV_MATURITY_RULES`, focused nav filtering via `getFilteredNavGroups`, preview badges in `dashboard-nav`, and matrix doc alignment; **Era 3 Cycle 47 — KDS v1 prototype CI certification** — `kds-v1-prototype` CI job runs `test:ci:kds-v1:integration` (queue→bump + allergen conflict); live wiring gate `test:ci:kds-v1:prototype:cert` in `test:ci:governance-bundles`; rollout behind `ENABLE_KDS_V1_CERTIFIED` in non-production; allergen alert UI in `KdsDailyService`; **Era 3 Cycle 46 — KDS v1 scope CI certification** — live wiring gate `tests/unit/kds-v1-scope-ci-live.test.ts` (`test:ci:kds-v1:cert`, chained in `test:ci:governance-bundles` with `test:ci:kds-v1:unit`) certifies locked `docs/kds-v1-scope.md`, canonical index reference, permissioned `kitchen-daily-kds` actions, and tier-1c unit artifacts; integration queue→bump remains focused DB workflow; **Era 3 Cycle 45 — cron surface hygiene CI certification** — live wiring gate `tests/unit/cron-hygiene-ci-live.test.ts` (`test:ci:cron-hygiene:cert`, chained in `test:ci:governance-bundles`) certifies `quality` job runs `validate:production-crons` + `validate:cron-inventory`, 16-slug production allowlist honesty, and tier-1b artifact presence; **Era 3 Cycle 44 — inventory depletion proof certification** — live gate `tests/unit/inventory-depletion-cert-live.test.ts` (`test:ci:inventory-depletion:cert`, chained in `test:ci:governance-bundles`) certifies POS recipe depletion unit + integration in CI, POS checkout hook to `recordPendingInventoryImpactsForPosOrder`, and explicit storefront deferral (no cross-channel hook yet); **Era 3 Cycle 43 — POS money-path CI certification** — live wiring gate `tests/unit/pos-money-path-ci-live.test.ts` (`test:ci:pos-money-path:cert`, chained in `test:ci:governance-bundles`) certifies `pos-money-path` CI job (seed + unit + integration + inventory + optional auth-gated E2E), tier-1 POS checkout in `test:security`, software-only scope (no hardware claim), and `docs/ci-e2e-tier-matrix.md` artifacts; **Era 3 Cycle 42 — storefront money-path CI certification** — live wiring gate `tests/unit/storefront-money-path-ci-live.test.ts` (`test:ci:storefront-money-path:cert`, chained in `test:ci:governance-bundles`) certifies `storefront-money-path` CI job (seed + unit + pay-later E2E), tier-1 payment failure recovery in `test:security`, and `docs/ci-e2e-tier-matrix.md` artifacts; **Era 3 Cycle 41 — growth leads export RBAC** — `/api/growth/leads/export` requires `growth.manage` via `requireGrowthApiAccess` (aligned with growth hub mutations; `growth.view` alone insufficient for bulk beta-lead CSV export) (`tests/unit/growth-leads-export-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 40 — customer success export RBAC** — `/api/growth/customer-success/export` requires `growth.manage` via `requireGrowthApiAccess` (aligned with customer success mutations; `growth.view` alone insufficient for bulk customer CSV export) (`tests/unit/customer-success-export-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 39 — customer success RBAC wave 2** — `appendCustomerSuccessNoteForm` and `markCustomerContactedForm` require `growth.manage` via `authorizeGrowth` (replacing owner-only profile gate) with growth denial audits (`tests/unit/customer-success-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 38 — channel certification RBAC wave 2** — `runChannelCertificationAction` and `recordCertificationSignOffAction` require `integrations.manage` via `requireIntegrationsActor` (replacing owner-only sign-off gate) with integration denial audits (`tests/unit/channel-certification-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 37 — notifications center RBAC wave 2** — `actions/notifications-center.ts` mutations require `workspace.settings` via `requireMutationPermission` with settings denial audits (`tests/unit/notifications-center-rbac.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 36 — email bypass closure certification** — automated guard `tests/unit/platform-email-bypass-closure.test.ts` proves no runtime `isSuperAdminEmail` / `SUPERADMIN_EMAIL` / hardcoded founder email in `app/` / `actions/` / `lib/` outside bootstrap allowlist (`test:ci:rbac-wave3`); **Era 3 Cycle 35 — notifications platform bypass** — `isSuperAdminNotifications` / `canUseNotifications` use `platformBypass` from persisted `SUPER_ADMIN` role row via `getNotificationActorScope` (`tests/unit/notifications-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 34 — dashboard superadmin UI parity** — billing, branding settings, and training dashboard pages use `actor.platformBypass` from persisted `SUPER_ADMIN` role row (via `requireBillingPageAccess`, `requireWorkspacePermissionActor`, `getTrainingPageAccess`); no runtime `isSuperAdminEmail` in `app/` or `actions/`; **Era 3 Cycle 33 — platform target protection bypass** — `isTargetSuperAdminProtected` uses `hasSuperAdminRoleRow` only, not bootstrap email (`tests/unit/platform-target-protection-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 32 — platform guards founder flag** — `requirePlatformAccess` sets `isFounder` from `SUPER_ADMIN` role row, not bootstrap email (`tests/unit/platform-guards-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 31 — platform support session bypass** — `isWorkspaceOwnerSuperAdminProtected` and protected-workspace session start require `SUPER_ADMIN` role row, not bootstrap email (`tests/unit/platform-support-session-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 30 — analytics platform bypass** — `isSuperAdminAnalytics` / `canDoAnalytics` use `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveAnalyticsActorScope` (`tests/unit/analytics-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 29 — packing verification platform bypass** — `canSupervisorOverride` uses `platformBypass` from persisted `SUPER_ADMIN` role row; `supervisorOverrideVerificationAction` uses `requireWorkspacePermissionActor` (`tests/unit/packing-verification-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 28 — catering quote platform bypass** — `isSuperAdminCatering` / `canDoCateringQuote` use `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveCateringQuoteActorScope` (`tests/unit/catering-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 27 — meal plans platform bypass** — `isSuperAdmin` / `canDoMealPlan` use `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveMealPlanActorScope` (`tests/unit/meal-plans-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 26 — CRM platform bypass** — `isSuperAdmin` / `canDoCrm` use `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveCrmActorScope` (`tests/unit/crm-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 25 — locations platform bypass** — `isSuperAdmin` / `canDoLocation` / `visibleLocationIds` use `platformBypass` from persisted `SUPER_ADMIN` role row; locations settings page no longer uses email override badge (`tests/unit/locations-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 24 — brands platform bypass** — `canViewAllBrands` / `canManageBrands` / `canManageSingleBrand` use `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveBrandActorScope` (`tests/unit/brands-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 23 — tasks platform bypass** — `actorIsSuperAdmin` uses `platformBypass` from persisted `SUPER_ADMIN` role row; tasks settings page no longer uses email override badge (`tests/unit/tasks-platform-bypass.test.ts`, `test:ci:rbac-wave3`); **Era 3 Cycle 22 — implementation platform bypass** — `test:ci:public-post-fail-closed` wired into CI; route tests for IoT/NPS; **Era 3 Cycle 12 — settings/audit platform bypass** — `tests/unit/public-api-v1-resources-contract.test.ts` + `test:ci:public-api-v1` cover auth, pagination, tenant scope, and mutation validation across all eight v1 resources; **Integration honesty (Cycle 23–24)** — `lib/integrations/integration-honesty.ts` canonicalizes DoorDash/Grubhub/Uber Eats/Uber Direct placeholders; Grubhub added to channel catalog; channel cards + available list label placeholders and suppress misleading health scores; **Navigation/maturity governance (Cycle 21–22)** — `lib/navigation/nav-maturity-governance.ts` hides marketplace placeholder links from focused default nav; Cron surface hygiene certified, ~121 experimental routes gated via `runCronRoute` + `ENABLE_EXPERIMENTAL_CRONS`, CI validators `validate:production-crons` / `validate:cron-inventory` include `tests/unit/cron-hygiene-live.test.ts`; Inventory depletion proof — POS checkout with active recipe decrements ingredient stock — `pos-money-path` job runs `pos:seed-ci-checkout`, unit/integration/inventory tests, and optional dashboard-auth E2E — `storefront-money-path` job in `.github/workflows/ci.yml` seeds `hello` via `scripts/seed-ci-storefront-checkout.ts`, runs `test:ci:storefront-money-path:unit` (payment recovery + stripe matrix) and pay-later checkout E2E — `app/api/iot/temperature/route.ts` requires `IOT_INGEST_SECRET` bearer (503 when unset); `app/api/leads/roi/route.ts` uses rate limit + Turnstile with production fail-closed when captcha not configured; `app/api/nps/route.ts` requires session or `NPS_INGEST_SECRET` bearer with rate limit (`lib/api/public-post-guard.ts`, `tests/unit/public-post-fail-closed.test.ts`); RBAC wave 2 slice — `actions/settings-center.ts` mutations use `requireSettingsCenterMutation` mapped to canonical workspace permissions with settings denial audits (`tests/unit/settings-center-rbac.test.ts`); `actions/monetization.ts` API key create/revoke require `integrations.manage` — `isSuperAdminUser` / workspace `platformBypass` require persisted `SUPER_ADMIN` role (bootstrap email seeds role via `ensurePlatformOwnerBootstrap` only); `actions/order-creation.ts` and `/dashboard/orders/new` use `orders.manage` via `lib/orders/order-create-access.ts`; billing mode assign uses `requireSuperAdminActor`; Storefront publish API RBAC — `app/api/storefront/theme/publish/route.ts` and `app/api/storefront/builder/publish/route.ts` now require `storefront.publish` (replacing owner-only session match), resolve tenant owner via `requireTenantActor`, and have denial/tenant-scope tests in `tests/unit/storefront-publish-api-routes.test.ts`; Storefront rewards RBAC consolidated (`storefront-rewards-permission.ts`, `storefront-rewards-page-access.ts`, unified subnav `rewards` gate); storefront loyalty admin aligned to `loyalty.manage`; storefront gift cards aligned to `giftcards.manage` (issue action, page gate, subnav) matching workspace CRM gift cards; Import Center job commit/rollback/cancel actions and job detail UI aligned to type-scoped permissions (`requireImportCenterJobCommit` / `requireImportCenterJobCancel`, `resolveImportCenterJobPermissions`); Import Center migrated from legacy profile-role strings to canonical workspace RBAC (`requireImportCenterActor`, hub/upload/settings page gates, filtered subnav, API route guards); CRM hub gated on `customers.read` / `customers.manage` with filtered subnav and mutation denial audits; workspace gift cards and customer loyalty program actions gated on `giftcards.manage` / `loyalty.manage` with page and POS balance API alignment; POS hub subnav includes Tabs and Handheld for `pos.access` actors (aligned with existing page gates); cron route inventory CI uses Vitest live gate (`cron-route-inventory-live.test.ts`) via shared `cron-route-inventory-validation.ts`; Import / Export Center ingredient CSV preview gated on `products.edit` via `requireImportActor` with `IMPORT_PERMISSION_DENIED` audits; hub layout subnav filters by import/export capabilities; production cron manifest/route/archive/`vercel.json` reconciliation re-certified with live Vitest gate (`cron-reconciliation-live.test.ts`) and CI wired to `npm run validate:production-crons`; cron bearer auth uses timing-safe comparison with `cron.auth_denied` audits from `runCronRoute`; billing Stripe webhook fails closed when `STRIPE_WEBHOOK_SECRET` is unset; POS, KDS, billing (entitlement overrides, checkout/portal API routes, billing hub layout/page gates, cancel feedback), integrations, export, storefront publish/media/manage draft mutations, report read/saved-report/generator pages, storefront domains/settings/forms pages and mutations, storefront hub `storefront.read` layout gate with per-href RBAC subnav (`storefront-subnav-access.ts`), admin page gates (launch, preview, website, referrals, notifications, menu, products, media), and mutation gates on blackout, Stripe Connect, reservations, product fields, webhook redelivery, and multi-store switching; manage-tab mutations (pages create, builder nav/footer, domain verify, forms CRUD) aligned via `requireManageStorefrontRow` / `getManageStorefrontForSession`; growth hub on canonical `growth.view` / `growth.manage` with platform GTM legacy bridge; and channel-command-center mutation surfaces are on canonical keys; `/dashboard/reports/[reportKey]` uses `requireReportGeneratorPageAccess` with audited denials before `runReport`; billing uses `requireBillingActor` / `requireBillingPageAccess` / `requireBillingApiAccess`; `channel-command-center` actions require `integrations.manage`; manage-only sales-channel pages use `requireSalesChannelsManagePage`; sales-channels monitoring allows `integrations.read` with read-only subnav
- Target state: canonical permission registry and helpers protect all high-risk mutations
- Affected files: `lib/permissions/**`, `actions/pos.ts`, `actions/integrations.ts`, `actions/billing.ts`, `actions/upload.ts`, export routes
- Dependencies: none
- Implementation steps: define registry, add helpers, migrate high-risk modules, add denial audits, add scanner
- Data model changes: minimal initially; code-first
- Service changes: permission resolution and denial logging
- UI changes: permission-aware nav and denied states
- Permission changes: large
- Audit log requirements: denial + success for sensitive actions
- Analytics requirements: optional denial counters
- Tests required: negative role tests, scanner, route guard tests
- Acceptance criteria: all P0 mutations use canonical permission helpers
- Remaining work after current slice: optional `storefront.admin` registry key for team-only split vs `storefront.manage`; vendor-specific malware scanner certification when `UPLOAD_MALWARE_SCAN_URL` is enabled in production
- Rollback considerations: keep legacy adapter during migration
- Risk level: High
- Estimated complexity: High

### KOS-P0-002 — POS permission hardening
- ID: `KOS-P0-002`
- Title: POS permission hardening
- Module: POS
- Priority: P0
- Owner role: Restaurant operations architect
- Business value: protects financial operations and operator trust
- Technical value: creates reusable permission pattern for other domains
- User story: as a cashier or manager, I should only be able to perform authorized POS actions
- Current state: refunds/voids are better protected than checkout/register/shift flows
- Progress update: **Era 3 Cycle 43** certifies tier-2b POS money path in CI via `pos-money-path` job (unit + integration + inventory + optional auth-gated E2E) with live wiring gate `test:ci:pos-money-path:cert`; checkout/register/shift/refund/void flows plus `app/api/pos/terminal/route.ts` now enforce canonical POS permissions, the main POS shell/registers/shifts/settings entry pages now mirror those permissions, and focused POS RBAC test files/config now cover checkout discount denial, direct checkout-service invariants for canonical order routing, open-shift enforcement, terminal placeholder pending-payment persistence, follow-on audit/ops side effects, and post-order POS persistence failure handling, a joined checkout-to-terminal capture lifecycle proving that a checkout-created pending terminal transaction on an open shift/register is marked paid with canonical capture metadata, a terminal cancel/retry recovery lifecycle proving cancellation leaves the local pending checkout intact until a later successful capture settles the same register/shift transaction, a route-to-service terminal lifecycle proving the `POST`/`DELETE`/`PUT` handlers drive the same pending checkout through cancel, retry, and capture with route-level audit events, a failed-capture recovery slice proving a route-level `PUT` capture failure leaves the local pending checkout untouched until a later retry succeeds, and an intent-creation recovery slice proving a failed route-level `POST` leaves the same pending checkout untouched until a later retry/capture succeeds, direct refund/void service invariants for processor-skipped refunds, partial Stripe-backed refunds, Stripe failure rollback, duplicate-refund protection, and voided-order warning audits, register/shift/refund/void action denials, canonical allowed-path shift open/close audit coverage, direct shift-service invariants for duplicate-open prevention, owner-scoped register resolution, cash closeout expected/variance math, and not-found close failures, terminal route denials across GET/POST/PUT/DELETE, terminal token issuance and payment-intent creation allowed-path coverage, malformed terminal JSON request handling, explicit terminal service-failure contracts for token/intention/capture/cancel flows without false allowed-path audits, direct Stripe Terminal service invariants for token creation, payment-intent scaling, capture failure/success paths, payment row persistence, and cancel delegation, the terminal process/cancel lifecycle edges with canonical allowed-path audit coverage for successful payment capture, page-level deny/allow parity for POS settings and hardware readiness, transactions, receipts, and plan-gated reports, `pos.access` page parity for handheld and bar-tab surfaces with denied paths proving they do not load tab data, `actions/pos/tabs.ts` workflow mutations with canonical `pos.access`/`pos.checkout` enforcement plus denied and allowed audit coverage, and cashier/manager/owner outcomes exercised directly at the `requireMutationPermission()` layer for the core POS mutation bundle; the primary remaining gaps are broader E2E/device lifecycle coverage and any deeper workflow-role nuances beyond the current focused mutation/page slices, plus making dependency restoration reproducible enough that the focused runner does not need manual package recovery
- Target state: all POS mutations and route handlers require explicit POS capabilities
- Affected files: `actions/pos.ts`, `app/api/pos/terminal/route.ts`, `services/pos/**`
- Dependencies: `KOS-P0-001`
- Implementation steps: add POS permissions, wrap actions/routes, align primary UI gates, extend parity to remaining POS pages/settings surfaces, then deepen negative tests and API coverage
- Data model changes: none required initially
- Service changes: permission injection and manager override checks
- UI changes: denied states and clearer role affordances
- Permission changes: POS-specific keys
- Audit log requirements: overrides, refunds, voids, shift/register changes
- Analytics requirements: optional denied action telemetry
- Tests required: POS E2E, refund/void, role-negative, terminal API permission-negative
- Acceptance criteria: unauthorized staff cannot perform protected POS actions; owner-scoped tenant data is preserved for staff-run POS mutations
- Rollback considerations: preserve legacy fallback during transition
- Risk level: High
- Estimated complexity: Medium to High

### KOS-P0-003 — Upload and media hardening
- ID: `KOS-P0-003`
- Title: Upload and media hardening
- Module: Storefront / uploads
- Priority: P0
- Owner role: Security lead
- Business value: prevents unsafe content and protects brand trust
- Technical value: centralizes file validation
- User story: as an operator, I need uploads to be safe and predictable
- Current state: storefront media path validates more than generic upload actions
- Progress update: upload validation lives in `lib/upload-policy/media-upload-validation.ts` across storefront media, kitchen product/logo uploads, profile avatars, invoice OCR images, import CSV uploads, and public form attachments; kitchen product/logo uploads require `products.edit` / `workspace.settings`; invoice OCR requires `reports.read.financial`; `services/audit/upload-audit.ts` records `UPLOAD_SUCCEEDED` / `UPLOAD_DENIED` for these channels; static malware/content-safety scanning and optional external hook run via `lib/upload-policy/malware-scan.ts` + `enforce-upload-content-safety.ts` on every upload path (replaces prior `stub_pass` form scan label).
- Target state: all upload entrypoints share one hardened validation policy
- Affected files: `actions/upload.ts`, `actions/storefront-media.ts`, `services/storefront/storefront-media-upload-service.ts`, storage helpers
- Dependencies: `KOS-P0-001`
- Implementation steps: central validator, unify policies, add audit and error states, consider scan hook
- Data model changes: optional file scan metadata later
- Service changes: centralized upload policy
- UI changes: clearer upload denial and setup states
- Permission changes: `storefront.media.manage` and related export/upload keys
- Audit log requirements: upload success/failure where sensitive
- Analytics requirements: upload failure rates
- Tests required: MIME/size/malicious upload tests
- Acceptance criteria: unsafe uploads are denied consistently
- Rollback considerations: keep existing provider abstractions
- Risk level: High
- Estimated complexity: Medium

## P1 — Restaurant Core
### KOS-P1-001 — Storefront payment failure recovery
- ID: `KOS-P1-001`
- Title: Storefront payment failure recovery
- Module: Storefront
- Priority: P1
- Owner role: Commerce lead
- Business value: protects direct-order revenue
- Technical value: stabilizes a flagship path
- User story: as a customer or operator, I need failed checkouts to be recoverable and visible
- Current state: strong checkout validation, partial recovery/observability maturity
- Progress update: initial online-checkout session failures now preserve the already-written `StorefrontOrder` plus internal `Order` pair instead of deleting them, the persisted storefront payment state is explicitly marked `FAILED`, public token-scoped retry now recreates Stripe Checkout only for the same order after a clear checkout-start failure, Stripe cancel now returns guests to the saved order page (`?canceled=1`) and idempotently marks still-pending online orders `FAILED` for same-token retry, workspace audit logs record `STOREFRONT_PAYMENT_FAILED` / `STOREFRONT_PAYMENT_RETRY_STARTED`, Order Hub surfaces payment failed/pending badges for storefront rows, focused recovery coverage now proves failed-to-pending-to-paid progression plus a guard that blocks retry while payment is still `PENDING` so KitchenOS does not mint duplicate live checkout sessions, same-cart duplicate submits now explicitly reuse the original order token with guest-visible duplicate guidance instead of silently dropping the customer onto status tracking, and focused webhook idempotency proof now covers both route-level duplicate Stripe-event acknowledgement and storefront completion-service no-op behavior once the order is already `PAID`; **Era 3 Cycle 42** certifies tier-2 storefront money path in CI via `storefront-money-path` job (pay-later E2E + unit recovery matrix) and live wiring gate `test:ci:storefront-money-path:cert`; staging Stripe live-card E2E remains optional.
- Target state: deterministic payment failure lifecycle with retry and support guidance
- Affected files: `actions/storefront-order.ts`, `services/storefront/storefront-payment-service.ts`, storefront checkout UI
- Dependencies: none
- Implementation steps: define failure states, improve UI, add reporting and traces
- Data model changes: optional payment failure metadata
- Service changes: retry/recovery handlers
- UI changes: failure/retry state components
- Permission changes: operator-side storefront management only
- Audit log requirements: payment failure and retry events
- Analytics requirements: failure rate and recovery rate
- Tests required: payment success/failure matrix, duplicate handling tests
- Acceptance criteria: failed payments no longer leave ambiguous operator/customer state
- Rollback considerations: keep canonical order writer unchanged
- Risk level: Medium
- Estimated complexity: Medium

### KOS-P1-002 — KDS permission and bump/recall foundation
- ID: `KOS-P1-002`
- Title: KDS permission and bump/recall foundation
- Module: Kitchen ops
- Priority: P1
- Owner role: Kitchen operations lead
- Business value: moves KDS toward restaurant-grade usage
- Technical value: creates a coherent kitchen state machine
- User story: as kitchen staff or expo, I need live ticket actions that are fast and permissioned
- Current state: daily KDS fetch/bump/recall actions and the kitchen page enforce `kitchen.view` / `kitchen.bump` / `kitchen.recall`; production work-item transitions from the kitchen screen require `kitchen.bump` or `kitchen.expo.manage` (with `production.manage` fallback); station/mode configure UI requires `kitchen.configure`
- Progress update: **Era 3 Cycle 47** certifies KDS v1 prototype workflow in CI via `kds-v1-prototype` job + `test:ci:kds-v1:prototype:cert`; queue→bump integration + allergen conflict flag; UI allergen badge; non-prod rollout gate; **Era 3 Cycle 46** locks KDS v1 scope in CI via `test:ci:kds-v1:cert` + `test:ci:kds-v1:unit` in governance bundles; canonical scope doc `docs/kds-v1-scope.md` defines daily-service ticket workflow, permissions (`kitchen.view`/`kitchen.bump`/`kitchen.recall`), and explicit out-of-scope boundaries; **Navigation/maturity governance (Cycle 21–22)** — `lib/navigation/nav-maturity-governance.ts` hides DoorDash/Grubhub/Uber placeholder links from focused default nav, labels preview surfaces (POS tabs/handheld, tables, copilot, forecast, reservations, food safety), gates internal GTM links; wired into `getFilteredNavGroups` + sidebar badges; KDS v1 prototype — allergen conflict badge
- Target state: canonical kitchen permissions and bump/recall/rush ticket workflow
- Affected files: kitchen services, `actions/kitchen-daily-kds.ts`, future KDS UI shells
- Dependencies: `KOS-P0-001`
- Implementation steps: define kitchen permissions, state machine, UI shells, negative tests
- Data model changes: ticket/item action states
- Service changes: bump/recall orchestration
- UI changes: readable KDS actions
- Permission changes: `kitchen.*`
- Audit log requirements: bump, recall, config changes
- Analytics requirements: timer/SLA tracking
- Tests required: realtime KDS tests, negative permission tests
- Acceptance criteria: unauthorized users cannot mutate kitchen state
- Rollback considerations: keep production/packing flows intact
- Risk level: Medium
- Estimated complexity: High

### KOS-P1-003 — Inventory depletion and variance closure
- ID: `KOS-P1-003`
- Title: Inventory depletion and variance closure
- Module: Inventory / costing
- Priority: P1
- Owner role: Ops / finance lead
- Business value: makes inventory and costing credible
- Technical value: links sales and economics
- User story: as an owner, I need sales to deplete stock and variance reports to mean something
- Current state: **in progress** — POS impacts, recipe depletion (unit + integration certified in CI via `test:ci:inventory-depletion:cert`); **Era 4 Cycle 1:** POS-only channel policy (`KOS-E4-001`); count completion + detail/list variance rollups, waste→stock; remaining: optional storefront depletion hook (scoped implementation), multi-count variance dashboards
- Target state: certified depletion per channel (POS today) and usable variance reporting
- Affected files: `services/pos/pos-inventory-impact-service.ts`, inventory and costing services
- Dependencies: canonical permissions for inventory
- Implementation steps: finalize depletion linkage, add variance reporting, surface operator diagnostics
- Data model changes: impact/variance snapshots if needed
- Service changes: depletion and reconciliation services
- UI changes: pending vs configured inventory visibility
- Permission changes: `inventory.*`, `costing.manage`
- Audit log requirements: adjustments and reconciliations
- Analytics requirements: variance KPIs
- Tests required: depletion integration tests, costing tests
- Acceptance criteria: certified channels deplete inventory (POS today); variance is understandable; no false unified depletion claims
- Rollback considerations: additive with safe fallbacks
- Risk level: Medium
- Estimated complexity: High

### KOS-P1-004 — Staff role parity across POS/KDS/schedule
- ID: `KOS-P1-004`
- Title: Staff role parity across POS, KDS, and schedule
- Module: Workforce
- Priority: P1
- Owner role: People systems lead
- Business value: aligns workforce and operations
- Technical value: reduces permission sprawl
- User story: as an owner, I need staff roles to govern what people can actually do
- Current state: **in progress** — staff + labor + training + go-live + executive + playbooks + templates + product-mapping + storefront-admin canonical gates; product mapping uses `integrations.read` / `integrations.manage`; storefront admin tabs map to `storefront.read` / `storefront.manage` via `requireStorefrontAdminPermission` with `staffAccess` JSON; settings-backed admin pages (settings, workspace, advanced, fulfillment, ordering, seo, marketing, pickup-windows, cart-recovery, redirects, schedule, analytics, reviews, inventory) use `requireStorefrontAdminPageAccess`; promo codes (`/dashboard/storefront/discounts`) use `storefront.manage` via `requireStorefrontManagePage` / `requireManageStorefrontRow`; gift cards + loyalty use `requireStorefrontRewardsPageAccess`
- Target state: staff roles map directly to canonical capabilities
- Affected files: `actions/staff.ts`, `actions/training.ts`, `lib/staff/**`, `lib/training/**`
- Dependencies: `KOS-P0-001`
- Implementation steps: map roles to capabilities, update role management, add tests
- Data model changes: custom role mapping if needed
- Service changes: role resolution
- UI changes: role editor and permission summaries
- Permission changes: broad
- Audit log requirements: role assignment/change logs
- Analytics requirements: none initially
- Tests required: staff role and permission-negative tests
- Acceptance criteria: staff permissions map to real operational actions
- Rollback considerations: transitional adapters
- Risk level: Medium
- Estimated complexity: Medium

## P2 — Growth And Intelligence
### KOS-P2-001 — Loyalty and gift-card cross-channel certification
- Status: **scoped by Era 4 Cycle 9** — see `KOS-E4-009` and `lib/rewards/cross-channel-rewards-policy.ts`; full unified ledger deferred
- ID: `KOS-P2-001`
- Title: Loyalty and gift-card cross-channel certification
- Module: CRM / growth
- Priority: P2
- Owner role: Growth lead
- Business value: stronger retention and direct revenue
- Technical value: unifies incentives across surfaces
- User story: as a customer, I need rewards and balances to work online and in-store
- Current state: foundations exist, parity is not fully certified
- Target state: online and POS parity with clear operator diagnostics
- Affected files: `actions/loyalty.ts`, `actions/gift-cards.ts`, related services
- Dependencies: POS and storefront hardening
- Implementation steps: close parity gaps, add runbooks and tests
- Data model changes: optional redemption history refinements
- Service changes: unified redemption flows
- UI changes: wallet/balance/redeem states
- Permission changes: `loyalty.manage`, `giftcards.manage`
- Audit log requirements: issue/redeem/reversal events
- Analytics requirements: redemption attribution
- Tests required: loyalty/gift-card parity suites
- Acceptance criteria: incentives work across channels without ambiguity
- Rollback considerations: keep current reward logic stable
- Risk level: Medium
- Estimated complexity: Medium

### KOS-P2-002 — Consent-aware campaign and attribution engine
- ID: `KOS-P2-002`
- Title: Consent-aware campaign and attribution engine
- Module: Growth / marketing
- Priority: P2
- Owner role: Growth architect
- Business value: turns CRM into measurable revenue
- Technical value: formalizes growth event model
- User story: as a marketer, I need campaigns that respect consent and show impact
- Current state: growth services exist, automation and attribution are partial
- Target state: consent-first campaign orchestration with revenue attribution
- Affected files: CRM/growth services, campaign surfaces, consent helpers
- Dependencies: CRM metric maturity
- Implementation steps: consent model, event model, attribution reports, approval workflow
- Data model changes: campaign, send, attribution records
- Service changes: eventing and campaign services
- UI changes: composer, segment targeting, attribution dashboards
- Permission changes: `campaigns.manage`
- Audit log requirements: send approvals and consent denials
- Analytics requirements: attribution rollups
- Tests required: consent and attribution tests
- Acceptance criteria: campaigns are attributable and consent-aware
- Rollback considerations: start with drafts and internal send paths
- Risk level: Medium
- Estimated complexity: High

### KOS-P2-003 — Deterministic operations insights
- ID: `KOS-P2-003`
- Title: Deterministic operations insights
- Module: Intelligence
- Priority: P2
- Owner role: Data/product lead
- Business value: gives owners immediate value without risky AI claims
- Technical value: builds clean data products before generative layers
- User story: as an owner, I want to know what is selling, what is slowing, and what needs attention
- Current state: analytics and forecast surfaces exist, but insight packaging is partial
- Target state: explainable insights for sales, margin, waste, bottlenecks, and prep
- Affected files: `services/ai/`, `services/forecast/`, analytics/reporting services
- Dependencies: reporting and data quality hardening
- Implementation steps: deterministic insight cards, evidence links, alert thresholds
- Data model changes: snapshot/insight records optionally
- Service changes: insight generation services
- UI changes: owner dashboard and insight panels
- Permission changes: `analytics.view`
- Audit log requirements: none required initially
- Analytics requirements: insight usage tracking
- Tests required: insight logic tests
- Acceptance criteria: insights are explainable and useful without AI overreach
- Rollback considerations: additive
- Risk level: Low to Medium
- Estimated complexity: Medium

## P3 — Enterprise Expansion
### KOS-P3-001 — Enterprise identity roadmap implementation
- ID: `KOS-P3-001`
- Title: Enterprise identity roadmap implementation
- Module: Enterprise platform
- Priority: P3
- Owner role: Security architect
- Business value: unlocks enterprise deals
- Technical value: reduces identity risk and manual support
- User story: as an enterprise admin, I need federated identity and lifecycle controls
- Current state: roadmap only
- Target state: phased SSO/SAML/SCIM implementation
- Affected files: auth, platform, org/workspace identity layers
- Dependencies: RBAC canon and platform governance
- Implementation steps: architecture, pilot SSO, SCIM roadmap, support runbooks
- Data model changes: identity provider mappings
- Service changes: enterprise auth provisioning
- UI changes: enterprise identity settings
- Permission changes: platform/admin settings
- Audit log requirements: identity admin actions
- Analytics requirements: optional auth health
- Tests required: enterprise auth tests
- Acceptance criteria: enterprise identity is real before sales claims
- Rollback considerations: keep native auth intact
- Risk level: High
- Estimated complexity: High

### KOS-P3-002 — Audit export and governance package
- ID: `KOS-P3-002`
- Title: Audit export and governance package
- Module: Enterprise governance
- Priority: P3
- Owner role: Platform lead
- Business value: supports enterprise trust and procurement
- Technical value: formalizes audit and retention posture
- User story: as an auditor or enterprise admin, I need exportable, scoped evidence
- Current state: audit infra exists, export maturity partial
- Target state: permissioned audit export with retention controls and runbooks
- Affected files: audit services, export routes, governance docs
- Dependencies: RBAC canon
- Implementation steps: export path, filters, permissions, runbook, retention docs
- Data model changes: optional export job tracking
- Service changes: audit export services
- UI changes: export/admin surfaces
- Permission changes: `audit.view`, `audit.export`
- Audit log requirements: export initiated/completed
- Analytics requirements: export usage stats
- Tests required: export permission tests
- Acceptance criteria: enterprise audit exports are trustworthy and scoped
- Rollback considerations: additive
- Risk level: Medium
- Estimated complexity: Medium

## P4 — Long-Term Domination
### KOS-P4-001 — Restaurant-grade table service and bar mode
- ID: `KOS-P4-001`
- Title: Restaurant-grade table service and bar mode
- Module: FOH
- Priority: P4
- Owner role: Restaurant product lead
- Business value: opens larger restaurant segment
- Technical value: expands FOH depth
- User story: as a full-service restaurant, I need table, check, and bar workflows that feel native
- Current state: preview foundations only
- Target state: robust table service and bar workflows
- Affected files: table and POS surfaces
- Dependencies: POS permission hardening
- Implementation steps: floor plan, checks, tabs, coursing, bar speed paths
- Data model changes: tables/checks/seat models
- Service changes: table/bar orchestration
- UI changes: FOH shells
- Permission changes: `tables.*`, `checks.*`
- Audit log requirements: table transfer/merge/close events
- Analytics requirements: FOH metrics
- Tests required: table/bar E2E
- Acceptance criteria: service restaurants can run live operations
- Rollback considerations: ship in phases
- Risk level: High
- Estimated complexity: High

### KOS-P4-002 — Certified kiosk and QR table commerce
- ID: `KOS-P4-002`
- Title: Certified kiosk and QR table commerce
- Module: Omnichannel
- Priority: P4
- Owner role: Commerce lead
- Business value: expands self-service ordering
- Technical value: extends order spine cleanly
- User story: as a guest, I want fast self-service ordering that attaches correctly to the restaurant workflow
- Current state: partial QR surfaces, no certified kiosk
- Target state: production-grade self-service ordering
- Affected files: storefront, table, POS, checkout
- Dependencies: storefront and table maturity
- Implementation steps: kiosk shell, QR attach, pay-at-table, recovery
- Data model changes: kiosk/table session models
- Service changes: self-service orchestration
- UI changes: kiosk/QR flows
- Permission changes: storefront and table permissions
- Audit log requirements: session/order attach logs
- Analytics requirements: self-service conversion
- Tests required: QR/kiosk E2E
- Acceptance criteria: self-service flows are safe and recoverable
- Rollback considerations: start with QR menus before payment
- Risk level: High
- Estimated complexity: High

### KOS-P4-003 — AI-assisted operational optimization
- ID: `KOS-P4-003`
- Title: AI-assisted operational optimization
- Module: Intelligence
- Priority: P4
- Owner role: Data/AI lead
- Business value: long-term differentiation
- Technical value: compounds value of unified data model
- User story: as an owner, I want explainable recommendations that improve margin and service
- Current state: preview AI/copilot and forecast foundations
- Target state: explainable, approval-first operational optimization suite
- Affected files: AI, forecast, analytics, CRM surfaces
- Dependencies: deterministic insights, data quality, privacy governance
- Implementation steps: deterministic insights first, then draft recommendations, then constrained optimization
- Data model changes: insight/recommendation tracking
- Service changes: recommendation services
- UI changes: approval and explanation panels
- Permission changes: intelligence and campaign permissions
- Audit log requirements: recommendation approvals and sends
- Analytics requirements: adoption and outcome tracking
- Tests required: safety, privacy, explanation, approval tests
- Acceptance criteria: AI remains explainable and operator-controlled
- Rollback considerations: keep preview/beta labels until proven
- Risk level: Medium to High
- Estimated complexity: High
