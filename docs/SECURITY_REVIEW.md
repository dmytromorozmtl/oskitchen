# Security review — OS Kitchen

High-level review for production readiness. Complement with threat modeling before handling PCI-heavy flows.

## Current protections

- **Authentication**: Supabase JWT; middleware guards `/dashboard` and `/onboarding`.
- **Ownership**: Server actions should use `requireSessionUser` + `assertOwner` / user-scoped Prisma queries (verify per new action).
- **Integration credentials**: Encrypted at rest with app-level encryption (requires `ENCRYPTION_KEY`); secrets not returned to the client after save.
- **Webhooks**: Signature verification paths for WooCommerce/Shopify (see `docs/WEBHOOK_SECURITY.md`); invalid signatures logged.
- **Demo isolation**: Demo seed clears user-scoped operational tables before insert; `demoMode` flags workspace; reset path clears sample rows.
- **Redirects**: Post-login `redirect` query restricted to internal paths (`safeInternalNextPath`).

## Remaining risks

- **Webhook replay / idempotency**: Ensure duplicate external IDs are handled consistently; document partner retry behavior.
- **Raw payloads**: External JSON stored for debugging — confirm retention policy and access scope.
- **Service role**: Any Supabase service key must never ship to the browser; RLS policies must match app ownership model.
- **Cron endpoints**: Protected by `CRON_SECRET`; rotate regularly.
- **Stripe**: Verify webhook signature secret configuration in production.

## Production checklist

- [ ] `ENCRYPTION_KEY` set and rotated procedure documented.
- [ ] `NEXT_PUBLIC_*` vs server-only keys verified in Vercel.
- [ ] Database: migrations applied; backups enabled.
- [ ] Supabase RLS reviewed for any direct client reads.
- [ ] Rate limiting on webhook routes (consider edge/WAF).
- [ ] Dependency audit (`npm audit`) on cadence.
- [ ] Incident contacts + rotation runbook for integration tokens.

## Stabilization pass notes (2026-05)

- Introduced **`ActionResult`** / **`runSafeAction`** helpers to standardize mutation responses; remaining server actions should migrate incrementally.
- **`requireOwnerRole`** clarifies owner-only operations without colliding with data ownership assertions.
- **Help center** and **version surface** reduce support ambiguity; ensure internal docs stay aligned with env requirements before GA.
- Continue verifying **webhook signature** paths when adding new external providers; never return decrypted tokens in API responses.

---

## Absolute Final Task 149 — OWASP Top 10 2021 certification

**Policy:** `absolute-final-owasp-top-10-v1`  
**Cert test:** `tests/unit/absolute-final-owasp-top-10-security.test.ts`  
**Manual gate:** Automated wiring cert only — run [`docs/pen-test-plan.md`](./pen-test-plan.md) before enterprise procurement.

| ID | Risk | KitchenOS controls |
|----|------|-------------------|
| A01 | Broken Access Control | RBAC matrix E2E (15×30), `mutation-access` tests, middleware session guards |
| A02 | Cryptographic Failures | `ENCRYPTION_KEY` at rest, timing-safe compares, PII redaction |
| A03 | Injection | Prisma parameterized queries, API mutation rate limits |
| A04 | Insecure Design | CSRF / cross-site mutation origin guard, server-action E2E |
| A05 | Security Misconfiguration | CI + deploy-prod-gate npm audit, env key separation checklist |
| A06 | Vulnerable Components | `npm audit --audit-level=high` required in CI/deploy |
| A07 | Auth Failures | Supabase JWT middleware, `CRON_SECRET` bearer on cron routes |
| A08 | Data Integrity | Webhook signature matrix (55 routes), replay/idempotency policies |
| A09 | Logging & Monitoring | Audit logs dashboard, cron execution evidence; Sentry DSN blocked (Task 2) |
| A10 | SSRF | Pen-test plan PT-10; no user-supplied fetch URLs without allowlist |
