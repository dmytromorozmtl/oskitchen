# Security / RBAC / Tenant Audit — Post Era 19

**Date:** 2026-05-28 · **HEAD:** `7b17ffa`  
**Canon:** `docs/rbac-permission-architecture.md`, `lib/permissions/`

**Security score: 90/100** · **RBAC: 88/100** · **Tenant isolation: 86/100**

---

## 1. Sensitive Surfaces

| Surface | Current guard | Risk | Test coverage | Fix |
|---------|---------------|------|---------------|-----|
| Money: POS checkout/refund/void | `pos.*` permissions + audits | Medium | tier-2b CI + unit | sustain |
| Money: storefront checkout | publish/order guards | Medium | tier-2 CI | sustain |
| Stripe webhooks | signature + replay policies | Medium | cert smokes | execute commerce drill |
| Public API v1 | scope + tenant guard | High | `test:ci:public-api-v1` | no SLA claim |
| Platform impersonation | platform roles + audit | High | impersonation tests | access review P1 |
| Audit/DSR export | SUPER_ADMIN row + `audit.export` | High | export RBAC tests | sustain |
| SSO callback | tenant mapping + deny codes | High | era16–18 unit + staging SKIP | IdP proof |
| File/media upload | `storefront.media.manage` + scan | High | upload tests | AV vendor cert P2 |
| Cron routes | 16 production allowlist | Medium | cron-hygiene cert | sustain |
| Integration credentials | `integrations.manage` | Medium | channel tests | sustain |
| Launch wizard / briefing | workspace tenant scope | Low | era19 unit | sustain |
| Integration health support mode | platform/support roles | Medium | support-admin era19 tests | sustain |

---

## 2. Ungated / Weakly Gated Routes (Watchlist)

| Route family | Current state | Risk | Required guard |
|--------------|---------------|------|----------------|
| Preview modules (food-safety, forecast, campaigns) | page-maturity notices; some URL-only | Medium | URL guard + nav hide |
| Experimental API routes | cron archive policy | Low | sustain allowlist |
| Public POST (non-webhook) | public-post-abuse matrix era17 | Medium | sustain expansion |
| POS terminal API | permission guarded; preview maturity | Medium | sustain lifecycle tests |
| Handheld/tabs preview pages | `pos.access` page parity | Medium | finish workflow or hide |

*No new critical ungated money paths found in Era 19 diff themes.*

---

## 3. Permission-Denied UX Coverage

| Surface | Covered? | Recovery link | Risk |
|---------|----------|---------------|------|
| Packing routes (9) | **Yes** era19 | role-appropriate dashboard | Low |
| Production routes (9) | **Yes** era19 | avoids gated loops | Low |
| POS terminal | era17 partial | POS home | Medium |
| KDS | era17 partial | kitchen home | Medium |
| Storefront admin | era14 sweep | storefront hub | Medium |
| Executive/reports | partial | reports index | Medium |
| Integration health | read vs manage | integrations hub | Low |
| Launch wizard | owner/manager implied | today | Low |

**Era 19 improvement:** `era19-permission-denied-packing-production-v1` + page-access extension.

---

## 4. Tenant Isolation Critical Flows

| Flow | Tenant guard | Cross-tenant test | Risk |
|------|--------------|-------------------|------|
| Order create/hub | `requireTenantActor` | unit + integration | Low |
| Briefing aggregates | workspace scoped service | era19 unit | Low |
| Launch wizard steps | workspace scoped | era19 unit | Low |
| Integration health | workspace + support mode | support-admin tests | Medium |
| Webhook ingest | tenant mapping on connection | golden path cert | Medium |
| Public API | API key → workspace | contract tests | Medium |
| SSO callback | `sso_workspace_id` mapping | tenant-mapping cert | High until IdP proof |
| Platform support view | session + workspace binding | platform tests | High |
| Impersonation | audit + session | impersonation tests | High |

---

## RBAC Inventory

| Item | Count | Evidence |
|------|------:|----------|
| Permission keys | **59** | `lib/permissions/permissions.ts` |
| Mutation registry | **19** | `domain-mutation-registry.ts` |
| RBAC wave 4 | certified | `test:ci:rbac-wave4` |
| Mutation linter | certified | `test:ci:mutation-registry-linter-era16:cert` |
| Era 19 permission-denied tests | **4 files** | `permission-denied-era19*` |

---

## Era 19 Security Notes

- Briefing reads pilot/SSO/channel artifacts — **no elevation of SKIPPED to PASS**
- Integration health support triage — tenant-scoped (`?mode=support`)
- No new public routes in Era 19 pillar work
- Deep-links validated in unit tests to avoid permission-denied loops

---

## Top Fixes (Priority)

1. Execute SSO IdP staging smoke (tenant binding proof)  
2. Sustain webhook replay P1 expansion ops  
3. Universal permission-denied sweep (POS/KDS remaining)  
4. Pen test before enterprise SSO in contract  
5. Cross-tenant E2E on support impersonation + health triage  
