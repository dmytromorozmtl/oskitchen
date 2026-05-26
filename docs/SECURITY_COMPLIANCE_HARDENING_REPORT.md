# Security & compliance hardening

## DB access
- Prisma server-side only for app data paths; service role for controlled uploads only — see README Supabase sections.

## Rate limiting
- `lib/rate-limit/rate-limit.ts` + `services/security/rate-limit-service.ts`
- Applied: `actions/beta.ts` public submissions (IP keyed, in-process window).

## Audit
- Webhook replay when implemented must log to `audit_logs` (documented in replay service).

## Legal
- `LEGAL_POLICIES_PUBLISHED` gates indexing for privacy/terms.
- `/legal/data-rights` template for subprocessors / DPA positioning (non-binding).

## SOC2 / SSO
- Trust page explicitly disclaims certifications unless separately executed.
