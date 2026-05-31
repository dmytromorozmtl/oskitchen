# OS Kitchen — Security, RBAC & Multi-Tenant Isolation Audit

**Date:** 2026-05-15

---

## 1. Executive summary

OS Kitchen uses **Supabase auth** + **server-side session** (`middleware.ts` → `updateSession`) and **Prisma-scoped queries** keyed by workspace/organization/location/brand IDs. **Platform** surfaces are gated in layout via `requirePlatformAccess()` (`lib/platform/platform-guards.ts`). Founder bootstrap is pinned to **`workspace.moroz@gmail.com`** (`lib/platform-owner.ts`).

**No P0 client bypass** of `/platform` was identified in this pass: unauthenticated users hitting `/platform` should be forced through normal auth flows (E2E: `tests/e2e/platform-access-denial.spec.ts`).

---

## 2. Platform isolation

| Control | Implementation | Status |
|---------|----------------|--------|
| `/platform/*` layout | `requirePlatformAccess()` | **OK** — redirects non-platform users to `/dashboard`. |
| Founder preserved | `ensurePlatformOwnerBootstrap` + `PLATFORM_ROOT_EMAIL` | **OK** per product rule. |
| Webhook replay | `actions/webhook-replay.ts` uses `requirePlatformAccess()` | **OK** — replay remains privileged. |

**P1 ongoing:** Any **new** platform API route must call the same guard pattern — add to PR checklist.

---

## 3. Workspace / organization scoping

| Pattern | Notes |
|---------|--------|
| `userWorkspaceIds` | `lib/support/support-permissions.ts` (and similar) aggregates accessible workspaces. |
| Actions | Must never trust client-supplied `workspaceId` without membership check — **spot-check** when adding new actions (**P1** per feature). |

**IDOR risk (generic):** Any `findUnique({ where: { id }})` without `workspaceId` in `where` is a candidate for **P0** — recommend periodic grep for `findUnique`/`findFirst` in `actions/` without workspace predicate.

---

## 4. Role surfaces (staff / packer / driver / cashier)

Staff modeling spans `UserRole`, POS terminal context, packing views, and driver pages. **P2:** formalize a **capability matrix → UI route map** (partially exists via entitlements / module preferences).

**Driver / packer / cashier data minimization:** Verify each standalone route (`/driver`, packing screens) filters PII to operational minimum (**P1** product pass).

---

## 5. Public & semi-public routes

| Route class | Concerns | Mitigations to verify |
|-------------|----------|------------------------|
| Storefront POST / server actions | Abuse, spam | Rate limits on public POST (`PUBLIC_POST_RATE_LIMITING` docs); `consumeRateLimitToken` policies. |
| Public order lookup by token | Token entropy + no extra enumeration | Ensure tokens are unguessable; rate limit (**P1**). |
| Public API v1 | API keys / scopes | Review `app/api/public/v1/*` auth middleware. |
| Webhook ingress | Signature verification + replay | Provider-specific handlers must reject missing/invalid signatures (**P0** per provider). |

---

## 6. Dangerous actions (audit / reason / confirmation)

- `services/audit/audit-reason-service.ts` + `sanitizeAuditReasonFreeText` strip secrets from free-text reasons.
- Destructive flows should require **reason + audit event** — verify per action (`demo reset`, `replay`, `delete`, `disconnect integration`).

**Test added:** `tests/unit/audit-reason-sanitization.test.ts`.

---

## 7. Export / import

- Export routes (`app/api/export/*`, growth exports) must enforce **permission + workspace scope**.
- **P1:** confirm CSV download routes always check session + role before streaming.

---

## 8. Redirect / open redirect

- `middleware.ts` redirect resolution uses internal fetch with `STOREFRONT_MIDDLEWARE_SECRET` header — good.
- **Rule:** never redirect to absolute URLs from unvalidated user input.

---

## 9. Raw secret exposure

- **Rule compliance:** No secrets pasted into docs; env vars documented in `docs/ENVIRONMENT_VARIABLES.md`.
- Logs: use `logger` + redaction (`lib/audit/audit-redaction.ts`, webhook redaction services).

---

## 10. P0 / P1 items

| Priority | Item |
|----------|------|
| **P0** | None confirmed in static pass; dynamic IDOR review recommended. |
| **P1** | Systematic `actions/` audit for workspace guard on `findUnique`/`update`/`delete`. |
| **P2** | Role-to-route matrix documentation for enterprise sales. |

---

## 11. Fixes applied this pass

- Strengthened **test coverage** for audit reason sanitization metadata (see unit test file).
- ESLint hygiene reduces risk of accidental unused security-related imports (minor).

No RBAC schema migrations applied in this pass.
