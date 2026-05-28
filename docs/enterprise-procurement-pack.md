# KitchenOS Enterprise Procurement Pack

**Status:** canonical enterprise / investor procurement narrative (Evolution Era 4+)  
**Policy ids:** `era4-procurement-honesty-v1`, `era6-enterprise-identity-roadmap-v1`, `era9-enterprise-sso-architecture-spike-v1` (`lib/enterprise/enterprise-procurement-policy.ts`, `lib/enterprise/enterprise-identity-roadmap-policy.ts`, `lib/enterprise/enterprise-sso-architecture-spike-policy.ts`)  
**Companion:** [`devops-release-enterprise-readiness.md`](./devops-release-enterprise-readiness.md) (release gates, runbooks)  
**Updated:** 2026-05-27 (Era 9 Cycle 1 — SSO R1 architecture spike)

Use this document for security questionnaires, procurement reviews, and enterprise sales **discovery** — not as a compliance attestation. KitchenOS is a **pilot-ready operational platform** with a **phased enterprise roadmap**, not a finished enterprise identity or compliance program.

---

## Current posture (honest summary)

| Area | Today | Roadmap |
|------|--------|---------|
| Multi-tenant operations | Workspace-scoped data model, owner resolution, RBAC waves 1–4 certified in CI | Workspace migration completion, custom roles UI |
| Authentication | Email/password + Supabase session; staff invites (**SSO not_implemented**) | SSO/SAML pilot, MFA depth |
| Authorization | Canonical permission keys + `domain-mutation-registry.ts`; `test:ci:rbac-wave4` in `test:security` | Custom roles UI; broader denial audit taxonomy |
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

---

## SSO and SAML roadmap

**Not available today.** KitchenOS uses Supabase-authenticated sessions and workspace membership; there is no production SAML/OIDC IdP integration for customer tenants.

| Phase | Target | Scope |
|-------|--------|--------|
| R0 (now) | Document posture | This pack; narrow auth claims in GTM |
| R1 | Architecture spike | **Complete (Era 9)** — see [`enterprise-sso-architecture-spike-r1.md`](./enterprise-sso-architecture-spike-r1.md); design only |
| R2 | Pilot SSO | One IdP (Okta or Entra ID), owner + staff login via SAML |
| R3 | GA SSO | Admin self-service IdP config, domain verification |

**Evidence today:** `app/login/`, `actions/auth.ts`, [`rbac-permission-architecture.md`](./rbac-permission-architecture.md).

**Procurement answer:** “SSO/SAML is on the roadmap; current production auth is email/session-based with role-based workspace permissions.”

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

## SOC 2 readiness roadmap

**KitchenOS is not SOC 2 Type II certified and does not claim SOC 2 compliance today.**

Readiness work is **internal control mapping**, not customer-facing attestation:

| Trust service criteria (high level) | Current evidence | Gap |
|------------------------------------|------------------|-----|
| Security | RBAC, cron auth, webhook signatures, CI security suite | Formal control owners, pen test cadence |
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
- Public API v1 enforces bearer auth + tenant scope — `test:ci:public-api-v1:cert`, `tests/unit/public-api-tenant-isolation.test.ts`

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
CI tier matrix, feature maturity matrix, Era 4 cycle certifications (POS, inventory policy, RBAC wave 4, cron archive, channel golden path).

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
