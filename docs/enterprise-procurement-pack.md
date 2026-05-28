# KitchenOS Enterprise Procurement Pack

**Status:** canonical enterprise / investor procurement narrative (Evolution Era 4+)  
**Policy ids:** `era4-procurement-honesty-v1`, `era6-enterprise-identity-roadmap-v1`, `era9-enterprise-sso-architecture-spike-v1`, `era13-enterprise-identity-recert-v1`, `era15-enterprise-procurement-recert-v1`, `era16-enterprise-sso-r2-pilot-v1`, `era16-enterprise-sso-r2-schema-v1`, `era16-enterprise-sso-r2-runtime-v1`, `era16-enterprise-sso-r2-admin-v1` (`lib/enterprise/enterprise-procurement-policy.ts`, `lib/enterprise/enterprise-procurement-era15-policy.ts`, `lib/enterprise/enterprise-identity-era13-policy.ts`, `lib/enterprise/enterprise-sso-r2-pilot-era16-policy.ts`, `lib/enterprise/enterprise-sso-r2-schema-era16-policy.ts`, `lib/enterprise/enterprise-sso-r2-runtime-era16-policy.ts`, `lib/enterprise/enterprise-sso-r2-admin-era16-policy.ts`)  
**Companion:** [`devops-release-enterprise-readiness.md`](./devops-release-enterprise-readiness.md) (release gates, runbooks)  
**Smoke:** `npm run smoke:enterprise-procurement` (CI cert wiring — not a compliance attestation)  
**Updated:** 2026-05-28 (Era 16 Cycle 4 — SSO R2 **pilot_admin_wiring**; delivery **pilot_foundation**)

Use this document for security questionnaires, procurement reviews, and enterprise sales **discovery** — not as a compliance attestation. KitchenOS is a **pilot-ready operational platform** with a **phased enterprise roadmap**, not a finished enterprise identity or compliance program.

---

## Current posture (honest summary)

| Area | Today | Roadmap |
|------|--------|---------|
| Multi-tenant operations | Workspace-scoped data model, owner resolution, RBAC waves 1–4 certified in CI | Workspace migration completion, custom roles UI |
| Authentication | Email/password + Supabase session; staff invites (**SSO pilot_foundation** — schema + callback + **pilot_admin_wiring**; `/login` Sign in with SSO for activated pilots only) | Staging IdP smoke proof, MFA depth |
| Authorization | Canonical permission keys + `domain-mutation-registry.ts`; `test:ci:rbac-wave4` + **Era 16 mutation registry linter** (`era16-mutation-registry-linter-v1`) in `test:security` | Custom roles UI; broader denial audit taxonomy |
| Audit | `recordAuditLog`, audit center, export gates (`audit.export`) | Broader taxonomy, retention automation |
| Commerce | Stripe billing + webhooks certified in CI | Enterprise invoicing, procurement billing |
| Integrations | Shopify/Woo golden path certified; marketplace placeholders honest | Live partner connectors per maturity matrix |
| Compliance attestation | **None** — no SOC 2 Type II, no ISO certificate | SOC 2 readiness mapping (internal) |

**Safe headline:** KitchenOS provides **tenant-scoped restaurant operations** (orders, POS, storefront, kitchen, inventory policy) with **documented RBAC**, **audit hooks**, and **CI-certified money paths** where listed in [`feature-maturity-matrix.md`](./feature-maturity-matrix.md).

**Unsafe headline:** “Enterprise-certified,” “SOC 2 compliant,” “SSO included,” or “full marketplace integrations live.”

---

## Annual enterprise identity review (2026-05-27)

**Policy:** `era6-enterprise-identity-roadmap-v1` — **delivery decision: `roadmap_only`**

| Capability | Delivery status | Era 6 decision |
|------------|-----------------|----------------|
| SSO / SAML | **not_implemented** | R1 architecture spike **completed** — [`enterprise-sso-architecture-spike-r1.md`](./enterprise-sso-architecture-spike-r1.md); R2 pilot not started |
| SCIM | **not_implemented** | Remains after SSO pilot (dependency unchanged) |
| SOC 2 Type II | **not_certified** | Internal readiness mapping only; no customer attestation |

**Procurement stance (unchanged):** Honest roadmap in this pack; no contract language implying live SSO, SCIM, or SOC 2 Type II until a future era ships product + evidence.

**Next scheduled review:** 2027-05-27 or after a major release / enterprise pilot requiring identity delivery.

**CI:** `npm run test:ci:enterprise-identity-roadmap:cert` (forbidden delivery-claim scan + pack markers).

## Era 13 enterprise identity recert (2026-05-27)

**Policy:** `era13-enterprise-identity-recert-v1` — **delivery decision: `roadmap_only`** (unchanged)

| Capability | Delivery status | Era 13 recert |
|------------|-----------------|---------------|
| SSO / SAML | **not_implemented** | R1 spike (`era9-enterprise-sso-architecture-spike-v1`) still valid; **R2 pilot not_started** |
| SCIM | **not_implemented** | Remains after SSO R2 pilot |
| SOC 2 Type II | **not_certified** | Internal readiness mapping only |

**Procurement stance:** No contract language implying live SSO, SCIM, or SOC 2 Type II. Era 12 integration/staging E2E work does **not** change enterprise identity delivery.

**CI:** `test:ci:enterprise-identity-era13:cert` (chained in `test:ci:enterprise-identity-roadmap:cert`).

## Era 15 enterprise procurement recert (2026-05-27)

**Policy:** `era15-enterprise-procurement-recert-v1` — re-validates this pack and Era 13 `roadmap_only` identity posture after Era 14 operational honesty recerts. **Does not** change SSO/SCIM/SOC 2 delivery status.

| Topic | Era 15 stance |
|-------|----------------|
| SSO / SAML | **not_implemented** — R2 pilot **not_started** (unchanged) |
| SCIM | **not_implemented** (unchanged) |
| SOC 2 Type II | **not_certified** — internal readiness mapping only |
| Buyer evidence (CI honesty) | Era 14 recerts: nav maturity, cross-channel rewards honesty, mutation-access registry, cron surface (16 prod), channel golden path — **not** compliance certifications |

**Procurement stance:** Use this pack + [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) + [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md). Run `npm run smoke:enterprise-procurement` before RFP/security questionnaire responses.

**CI:** `test:ci:enterprise-procurement-era15:cert` (chained in `test:ci:enterprise-procurement:cert`).

## Era 16 SSO R2 pilot decision (2026-05-28)

**Policy:** `era16-enterprise-sso-r2-pilot-v1` — locks R2 integration path after auth architecture inspection. **Does not** implement SSO, SCIM, or SOC 2 delivery.

| Capability | Delivery status | Era 16 decision |
|------------|-----------------|-----------------|
| SSO / SAML | **not_implemented** | R2 pilot **design_locked** — path **`supabase_saml_sso`** (R1 Option A); pilot IdP: Okta **or** Entra ID |
| SCIM | **not_implemented** | Remains after R2 implementation cycles |
| SOC 2 Type II | **not_certified** | Unchanged |

**Procurement stance:** SSO is still **not** in production. Buyers may reference [`enterprise-sso-r2-pilot-design.md`](./enterprise-sso-r2-pilot-design.md) as engineering intent for a future pilot — not availability.

**CI:** `test:ci:enterprise-sso-r2-pilot-era16:cert` (chained in `test:ci:enterprise-identity-roadmap:cert`).

## Era 16 SSO R2 schema foundation (2026-05-28)

**Policy:** `era16-enterprise-sso-r2-schema-v1` — Prisma foundation for workspace SSO settings and IdP identity mapping. **Does not** enable SSO login, SAML callback, or production delivery.

| Capability | Delivery status | Era 16 Cycle 2 |
|------------|-----------------|----------------|
| SSO / SAML | **pilot_foundation** | R2 pilot **schema_ready** — models `WorkspaceSsoSettings`, `SsoIdentity`; defaults `enabled=false`, `pilotPhase=DISABLED` |
| SCIM | **not_implemented** | Unchanged |
| SOC 2 Type II | **not_certified** | Unchanged |

**Procurement stance:** Schema exists for a future pilot tenant; **no** production SSO claim. Staff auth remains email/password + Supabase session.

**CI:** `test:ci:enterprise-sso-r2-schema-era16:cert` (chained in `test:ci:enterprise-sso-r2-pilot-era16:cert`).

## Era 16 SSO R2 runtime callback foundation (2026-05-28)

**Policy:** `era16-enterprise-sso-r2-runtime-v1` — Supabase SSO callback adapter with tenant/domain guardrails and audit events. **Does not** expose production SSO login UI or claim live SAML/OIDC delivery. **callback_adapter** remains fail-closed until workspace `PILOT_ACTIVE` + `ssoOidc` entitlement.

| Capability | Delivery status | Era 16 Cycle 3 |
|------------|-----------------|----------------|
| SSO / SAML | **pilot_foundation** | Callback adapter (`validateSsoCallbackSession`, `completeWorkspaceSsoCallback`); query param `sso_workspace_id`; fail-closed until `PILOT_ACTIVE` + `ssoOidc` entitlement |
| SCIM | **not_implemented** | Unchanged |
| SOC 2 Type II | **not_certified** | Unchanged |

**Procurement stance:** Runtime callback foundation exists behind safe gate; default workspace SSO remains disabled. Staff auth remains email/password + Supabase session for all tenants until Cycle 4 pilot wiring.

**Audit:** `sso.login_success`, `sso.login_denied` via `recordAuditLog`.

**CI:** `test:ci:enterprise-sso-r2-runtime-era16:cert` (chained in `test:ci:enterprise-sso-r2-pilot-era16:cert`).

## Era 16 SSO R2 pilot admin wiring (2026-05-28)

**Policy:** `era16-enterprise-sso-r2-admin-v1` — admin-safe workspace SSO configuration, `ssoOidc` entitlement gate, and gated `/login` **Sign in with SSO** entry. **Does not** claim production SSO for all tenants.

| Capability | Delivery status | Era 16 Cycle 4 |
|------------|-----------------|----------------|
| SSO / SAML | **pilot_foundation** | **pilot_admin_wiring** — Settings → Security → SSO pilot; configure/activate/deactivate; staff login entry with workspace UUID |
| SCIM | **not_implemented** | Unchanged |
| SOC 2 Type II | **not_certified** | Unchanged |

**Procurement stance:** One pilot tenant can be prepared via admin UI; SSO remains tenant-scoped and inactive until explicit activation. Staging IdP smoke required before SSO delivery status advances beyond **pilot_foundation**.

**Audit:** `sso.settings_configured`, `sso.settings_activated`, `sso.settings_deactivated`.

**Smoke:** `npm run smoke:enterprise-sso-r2-pilot` (CI cert wiring — not live IdP attestation).

**CI:** `test:ci:enterprise-sso-r2-admin-era16:cert` (chained in `test:ci:enterprise-sso-r2-pilot-era16:cert`).

## Era 17 SSO IdP staging smoke plan (2026-05-28)

**Policy:** `era17-enterprise-sso-idp-staging-smoke-v1` — documents staging IdP smoke path for Okta or Entra test tenant. **Does not** advance SSO delivery beyond **pilot_foundation** or claim live SAML/OIDC for all tenants.

| Capability | Delivery status | Era 17 |
|------------|-----------------|--------|
| SSO / SAML | **pilot_foundation** (unchanged) | **plan_ready** — ops doc + `smoke:enterprise-sso-idp-staging`; Cycle 2 **`era17-enterprise-sso-idp-login-proof-v1`** executed — **awaiting_operator_proof** (SKIPPED when staging/IdP secrets absent) |
| SCIM | **not_implemented** | Unchanged |
| SOC 2 Type II | **not_certified** | Unchanged |

**Procurement stance:** Staging IdP smoke plan exists; buyer-facing SSO availability unchanged until Cycle 2 artifact and Cycle 3 qualified pilot gate (`era17-enterprise-sso-pilot-ready-v1`).

**Ops doc:** [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md)

**Smoke:** `npm run smoke:enterprise-sso-idp-staging` (wiring cert + prerequisite check — not live IdP attestation until Cycle 2).

**CI:** `test:ci:enterprise-sso-idp-staging-era17:cert` (chained in `test:ci:enterprise-identity-roadmap:cert`).

---

## SSO and SAML roadmap

**Not available today.** KitchenOS uses Supabase-authenticated sessions and workspace membership; there is no production SAML/OIDC IdP integration for customer tenants.

| Phase | Target | Scope |
|-------|--------|--------|
| R0 (now) | Document posture | This pack; narrow auth claims in GTM |
| R1 | Architecture spike | **Complete (Era 9)** — see [`enterprise-sso-architecture-spike-r1.md`](./enterprise-sso-architecture-spike-r1.md); design only |
| R2 | Pilot SSO | **schema_ready (Era 16 Cycle 2–3)** — see [`enterprise-sso-r2-pilot-design.md`](./enterprise-sso-r2-pilot-design.md); Supabase SAML SSO path; callback adapter (Cycle 3); pilot admin + smoke (Cycle 4) |
| R3 | GA SSO | Admin self-service IdP config, domain verification |

**Evidence today:** `app/login/`, `actions/auth.ts`, [`rbac-permission-architecture.md`](./rbac-permission-architecture.md).

**Procurement answer:** “SSO/SAML is **not** in production today. R1 spike and Era 16 R2 design define the Supabase SAML SSO pilot path; current auth is email/session-based with role-based workspace permissions.”

---

## SCIM roadmap

**Not available today.** Staff lifecycle is managed inside KitchenOS (invites, staff records, workspace roles) — not via SCIM provisioning from an external IdP.

| Phase | Target |
|-------|--------|
| R1 | Group/role mapping design (workspace role ↔ IdP groups) |
| R2 | SCIM 2.0 Users + Groups (create/deactivate, not full custom schema) |
| R3 | Deprovision hooks, audit of provision events |

**Dependency:** SSO/SAML pilot (R2 above) before SCIM is meaningful.

**Procurement answer:** “SCIM is planned after SSO; manual staff provisioning is supported today.”

---

## Era 16 webhook security matrix (2026-05-28)

**Policy:** `era16-webhook-security-matrix-v1` — `lib/security/webhook-security-matrix.ts`

| Topic | Era 16 stance |
|-------|---------------|
| Route inventory | **46 webhook routes** classified on disk |
| Signature validation | Commerce (Stripe, WooCommerce, Shopify), delivery (Resend, Uber), platform (Slack, SCIM bearer), experimental bearer routes |
| Replay protection | Documented per route — commerce uses `billingEvent` / `webhook_event_store`; Era 17 adds Resend **ingress dedupe** (`era17-webhook-replay-p1-expansion-v1`); **not** full replay monitoring ops |
| Artifact | `npm run cert:webhook-security-era16` → `artifacts/webhook-security-matrix-summary.json` |
| CI | `test:ci:webhook-security-era16:cert` (in `test:security`) |

**Procurement stance:** webhook ingress risk is visible and test-backed; buyers must not assume centralized replay monitoring until future hardening cycles.

---

## Mutation registry linter (Era 16 Cycle 8)

**Policy:** `era16-mutation-registry-linter-v1` — `lib/permissions/mutation-registry-linter.ts`

| Topic | Era 16 stance |
|-------|---------------|
| Scope | Static scan of `actions/` for Prisma-write server mutations |
| Governance | Requires `requireMutationPermission`, domain actor helper, documented allowlist marker, or approved public/platform guard |
| Artifact | `npm run cert:mutation-registry-linter-era16` → `artifacts/mutation-registry-linter-summary.json` |
| CI | `test:ci:mutation-registry-linter-era16:cert` (in `test:security`) |

**Procurement stance:** new sensitive server actions cannot silently bypass registry discipline; this does **not** replace wave-4 action RBAC tests.

---

## Commercial pilot evidence pack (Era 16 Cycle 9)

**Policy:** `era16-commercial-pilot-evidence-pack-v1` — `lib/commercial/commercial-pilot-evidence-pack.ts`

| Topic | Era 16 stance |
|-------|---------------|
| Purpose | Single-page GO/NO-GO for paid pilots — role checklists, allowed features, forbidden claims |
| Roles | Owner, manager, cashier, kitchen, support/platform admin |
| Artifact | `npm run cert:commercial-pilot-evidence-era16` → `artifacts/commercial-pilot-evidence-pack-summary.json` |
| CI | `test:ci:commercial-pilot-evidence-era16:cert` (in `test:ci:commercial-pilot-runbook:cert`) |

**Procurement stance:** buyers evaluating a pilot should use [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) Era 16 sections — not deprecated `docs/PILOT_*` checklists.

---

## Pilot ICP + contract template (Era 17 Cycle 15)

**Policy:** `era17-pilot-icp-contract-v1` — `lib/commercial/pilot-icp-contract-era17.ts`

| Topic | Era 17 stance |
|-------|---------------|
| Purpose | Qualified pilot customer profile, contract allowed/forbidden claims, duration, success metrics |
| Template | [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) — sales/legal review required before signature |
| ICP gate | Production SSO/SOC2/unified inventory/marketplace live ops requirements **disqualify** standard paid pilot |
| CI | `test:ci:pilot-icp-contract-era17:cert` (in `test:ci:commercial-pilot-runbook:cert`) |

**Procurement stance:** contract language must match matrix maturity — template does **not** claim production certification or enterprise SSO for all tenants.

---

## Forbidden-claims enforcement (Era 17 P0 #5)

**Policy:** `era17-pilot-forbidden-claims-enforcement-v1` — pre-sales claims gate before pilot contract signature.

| Check | Command |
|-------|---------|
| Strict GTM copy | `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` |
| Registry audit | `npm run audit:marketing-claims` |
| Buyer pack honesty | `npm run test:ci:enterprise-procurement:cert` |
| Orchestrator | `npm run smoke:pilot-forbidden-claims-enforcement` → `artifacts/pilot-forbidden-claims-enforcement-summary.json` |

**Procurement stance:** this pack must pass `test:ci:enterprise-procurement:cert` — no affirmative production SSO, SOC2 Type II, or SCIM delivery claims. Status: **awaiting_forbidden_claims_enforcement_pass** on release branch.

---

## Operational sign-off (Era 16 Cycle 10)

**Policy:** `era16-operational-signoff-v1` — `lib/operations/operational-signoff-summary.ts`

| Topic | Era 16 stance |
|-------|---------------|
| Scope | Unified KDS + production calendar operational sign-off |
| Artifact | `npm run smoke:operational-signoff-era16` → `artifacts/operational-signoff-summary.json` |
| CI | `test:ci:operational-signoff-era16:cert` (in `test:ci:kds-staging-smoke:cert`) |
| Manual staging | Requires `OPERATIONAL_SIGNOFF_STAGING_URL` + operator email |

**Procurement stance:** qualified operational smoke only — not rush-hour or multi-station kitchen certification.

**Era 17 KDS sales one-pager:** `era17-kds-qualified-sales-onepager-v1` — `docs/kds-qualified-sales-onepager-era17.md`; **sales_onepager_ready** — qualified pilot wording for buyer-facing materials; no rush-hour claim.

---

## SOC 2 readiness roadmap

**KitchenOS is not SOC 2 Type II certified and does not claim SOC 2 compliance today.**

Readiness work is **internal control mapping**, not customer-facing attestation:

| Trust service criteria (high level) | Current evidence | Gap |
|------------------------------------|------------------|-----|
| Security | RBAC, cron auth, webhook signatures, **Era 16 webhook security matrix** (`era16-webhook-security-matrix-v1`), CI security suite | Formal control owners, pen test cadence |
| Availability | Vercel hosting, health routes, incident runbooks (devops doc) | Public status page, SLO reporting |
| Confidentiality | Tenant scoping, PII encryption on orders (integration tests) | Enterprise DLP, formal key rotation |
| Processing integrity | Order spine, payment webhooks, inventory depletion policy | Broader reconciliation dashboards |
| Privacy | DSR export route (gated), privacy policy | Productized privacy center |

**Phases:** (1) control inventory + owner assignment, (2) gap remediation sprints, (3) optional readiness assessment, (4) Type II audit **only after** leadership commits — **no date promised in sales**.

**Deprecated for procurement:** `docs/ENTERPRISE_*_FINAL.md`, `docs/enterprise-full-audit-*.md` — use this pack and [`full-strategic-reaudit-2026-05-27-era2.md`](./full-strategic-reaudit-2026-05-27-era2.md).

---

## Audit logging and export

**Implemented (beta / pilot-ready):**

- Server-side audit rows via `recordAuditLog` / `services/audit/`
- Permission denials for sensitive domains (e.g. `orders.permission_denied`, `copilot.permission_denied`, `routes.permission_denied`) — see `test:ci:rbac-wave4`
- Audit CSV export and sensitive detail visibility require `audit.export` + platform role row — `test:ci:audit-center-rbac:cert`
- DSR export route: `app/api/internal/dsr/export` — gated, not a self-service enterprise privacy portal

**Not implemented:**

- Immutable log shipping to customer SIEM by default
- Tamper-evident retention guarantees
- Pre-built SOC 2 evidence package

**Procurement answer:** “Audit events are recorded for sensitive actions; export is permission-gated. Enterprise SIEM integration is roadmap.”

---

## Tenant isolation

**Architecture:**

- Kitchen owner (`userId`) is the primary tenant boundary for operational data
- `requireTenantActor` resolves session user → data owner → `workspaceId`
- List/mutation queries use workspace scope helpers (`lib/scope/workspace-*-scope.ts`)
- Public API v1 enforces bearer auth + tenant scope + per-route Developer API scopes — `test:ci:public-api-v1:cert`, `era17-public-api-per-route-scope-v1`, `tests/unit/public-api-tenant-isolation.test.ts`
- **Era 16 partner confidence:** `era16-public-api-partner-confidence-v1` — partner readiness pack, OpenAPI bearer scheme, standard error/rate-limit docs (`docs/API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md`); **beta** — no production SLA or unlimited throughput claim
- **Era 17 partner webhook docs:** `era17-partner-webhook-docs-v1` — inbound Stripe/Woo/Shopify contract + outbound event taxonomy (`docs/partner-webhook-integration-era17.md`); **partner_webhook_docs_ready** — no production webhook SLA or guaranteed delivery claim
- **Era 17 POS-only inventory lock:** `era17-pos-only-inventory-lock-v1` — recertified POS-only depletion; storefront hook **deferred_locked** — no unified stock claim
- **Era 17 pilot inventory messaging:** `era17-pilot-inventory-messaging-v1` — sales training for POS-only depletion; **pilot_inventory_messaging_ready**
- **Era 17 costing pilot spot check:** `era17-costing-pilot-spotcheck-v1` — recipe → margin report pilot menu QA; **pilot_menu_margin_spotcheck_documented** — qualified beta, not accountant-certified
- **Era 17 scope enforcement:** `era17-public-api-per-route-scope-v1` — high-risk writes (`orders:write`, `webhooks:receive`) require matching `scopes_json`; no full scope admin UI claim

**Honest limits:**

- Workspace migration is **in progress** — not every table/path is workspace-normalized yet (`scripts/check-workspace-coverage.ts`)
- Platform super-admin bypass exists for support — audited, not customer-visible

**Procurement answer:** “Logical tenant isolation by workspace/owner with automated tests on public API and ongoing scope migration.”

---

## Data retention and privacy

**Today:**

- Operational retention follows application defaults and operator configuration (not a unified enterprise retention SKUs)
- DSR/export paths exist for platform-governed workflows — see audit/DSR sections in [`rbac-permission-architecture.md`](./rbac-permission-architecture.md)
- Customer PII on orders may be encrypted at rest (storefront/POS integration tests)

**Not claimed:**

- Automated legal-hold product
- Per-tenant retention policies in UI
- GDPR “certification”

**Procurement answer:** “Retention and deletion are partially implemented; enterprise retention automation is roadmap. Privacy requests are handled via documented process + gated exports.”

---

## Backup, restore, and availability

**Today:**

- Database hosted on managed Postgres (provider-dependent backups — verify in production runbook / hosting contract)
- Application rollback via deployment discipline ([`devops-release-enterprise-readiness.md`](./devops-release-enterprise-readiness.md))
- Health: `/api/health`, observability via Sentry/instrumentation

**Required ops discipline (document in customer DPA appendix):**

- Confirm provider backup RPO/RTO with infrastructure owner
- Periodic restore rehearsal — **recommended**, not productized in-app

**Procurement answer:** “Backups are infrastructure-dependent; KitchenOS documents restore/rollback procedures. Formal RTO/RPO SLAs require enterprise agreement.”

---

## Incident response

**Today:**

- Runbook list in [`devops-release-enterprise-readiness.md`](./devops-release-enterprise-readiness.md) (storefront, Stripe, cron, POS, tenant-scope, impersonation)
- Error recovery surfaces in dashboard/platform
- No public status page commitment

**Process (recommended for enterprise deals):**

1. Customer reports via support channel
2. Severity classification (SEV1–SEV3)
3. Internal owner + comms template
4. Post-incident notes in internal tracker

**Procurement answer:** “Incident response is operational process + runbooks; 24/7 SOC is not included in standard pilot.”

---

## Security questionnaire guide

Answer from **evidence + roadmap only**:

| Common question | Pointer |
|-----------------|--------|
| Do you have SOC 2? | **No** — readiness roadmap only (this doc) |
| SSO/SAML? | **Roadmap** — session auth today |
| SCIM? | **Roadmap** — after SSO |
| Pen test? | Provide latest report if exists; else “scheduled / pre-enterprise” |
| Data residency | State hosting region from deployment config (Vercel/DB region) |
| Encryption in transit | TLS (HTTPS) |
| Encryption at rest | Postgres + app-level PII fields where implemented |
| RBAC | [`rbac-permission-architecture.md`](./rbac-permission-architecture.md) |
| SDLC / CI | `.github/workflows/ci.yml`, `test:ci:governance-bundles` |
| Subprocessors | List Supabase, Stripe, Vercel, Sentry, etc. from actual contracts |

**Never** copy marketing superlatives into questionnaires.

---

## Procurement FAQ

**Can we buy KitchenOS for a 500-location enterprise today?**  
Pilot/multi-location architecture exists; enterprise identity and compliance programs are roadmap. Start with phased pilot + honest maturity matrix.

**Is POS production-certified?**  
Software POS money path is CI-certified (unit/integration/inventory); browser E2E is optional tier; no native hardware/offline certification.

**Are all integrations live?**  
No. Shopify/Woo have webhook golden-path certification; DoorDash/Uber/Grubhub surfaces are **placeholder** (`test:ci:integration-honesty:cert`).

**Do you support SSO in contract?**  
Only as **future delivery** milestone — not current production capability.

**Can you sign our DPA?**  
Use legal review; product capabilities in this pack define what is technically true today.

**What evidence can you share in a pilot?**  
CI tier matrix, feature maturity matrix, Era 4–15 policy certifications where listed (POS money path, inventory depletion policy, RBAC wave 4, cron surface, channel golden path, Era 14 honesty recerts, Era 15 procurement recert). These are **engineering honesty** artifacts — not SOC 2 or ISO attestations.

---

## What we do not claim today

KitchenOS **does not** claim, and sales/GTM **must not** imply:

- SOC 2 Type II (or “SOC 2 compliant”) certification
- SSO, SAML, or SCIM in production for tenants
- HIPAA, FedRAMP, or ISO 27001 certification
- Full enterprise retention/legal-hold automation
- All marketplace / delivery integrations live
- Offline POS or hardware certification
- 24/7 dedicated customer SOC

**Enforcement:** `npm run test:ci:enterprise-procurement:cert` scans this pack for forbidden affirmative claims.

---

## Document governance

| Action | Rule |
|--------|------|
| Update procurement answers | Edit **this file** first |
| Release checklist | [`devops-release-enterprise-readiness.md`](./devops-release-enterprise-readiness.md) |
| Feature truth | [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) |
| Strategic scores | [`full-strategic-reaudit-2026-05-27-era2.md`](./full-strategic-reaudit-2026-05-27-era2.md) |
| Historical audits | **Deprecated** — see [`canonical-doc-index.md`](./canonical-doc-index.md) |
