# Security posture

OS Kitchen security posture today:
- Supabase Auth-backed sessions.
- Prisma server-side data access.
- Tenant scoping by `userId`, with workspace migration plan for future.
- Stripe for payment processing; no raw card data stored.
- Server-side integration credentials.
- Webhook signature verification where provider secrets are configured.
- Data export tooling for common tenant data.

Not currently claimed:
- SOC 2 certification
- HIPAA compliance
- PCI DSS certification
- GDPR compliance
- Food labeling or allergen compliance

Recommended next controls:
- Vendor security questionnaire.
- Access review log.
- Formal incident response runbook.
- Automated status page.
- Dependency and secret scanning in CI.
