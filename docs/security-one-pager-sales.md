# Security one-pager (sales)

**Audience:** Prospects, design partners, procurement  
**Policy:** `sales-assets-package-p1-82-v1`  
**Companion:** [`/trust`](https://os-kitchen.com/trust) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)

One-page honesty sheet for security conversations — **not** a SOC 2 attestation or DPA substitute.

## What we implement today

| Control | Status | Sales wording |
|---------|--------|---------------|
| Tenant isolation | Workspace-scoped data in application layer | "Each operator workspace is isolated — verify cross-tenant tests in pilot scope" |
| Role-based access | RBAC across dashboard routes | "Roles gate POS, kitchen, finance, and admin surfaces" |
| Authentication | Email/password + optional SSO (BETA) | "Pilot typically email/password — SSO when Integration Health PASS" |
| Payments | Stripe Connect — card data not stored on OS Kitchen servers | "Stripe handles card processing; we do not store PAN" |
| Audit trail | Money actions and admin events logged | "Audit export available — not immutable ledger" |
| Data export | Customer data export tools | "Operators can export workspace data" |
| Encryption in transit | HTTPS/TLS for web app | "Standard TLS for browser and API traffic" |

## What we do **not** claim today

| Topic | Honest status |
|-------|---------------|
| **SOC 2 Type I** | In progress — **Q4 2026 target, not certified**. Say: "SOC 2 in progress — Type I target Q4 2026 (not certified)" |
| **HIPAA** | **Not certified** for healthcare meal programs without BAA review |
| **PCI DSS** | Stripe is PCI scope — OS Kitchen is not a PCI merchant of record |
| **Pen test report** | Not published — schedule before enterprise procurement |
| **24/7 SOC** | Business-hours support unless contracted |

## Integration credentials

Third-party integrations require **customer-provided credentials**. OS Kitchen does not hold merchant OAuth tokens without operator authorization. Show Integration Health PASS / SKIPPED / FAILED — never fake green badges.

## AI and compliance

AI modules assist with drafts (invoice capture, purchasing suggestions, briefing). They are **not** substitutes for legal, tax, nutrition, allergen, or operational review. Label BETA maturity per module.

## Procurement next steps

1. Share this one-pager + [`integration-list-sales.md`](./integration-list-sales.md)
2. Run `npm run verify-claims` before custom deck edits
3. Route SOC2/HIPAA/PCI questions to founder + legal — do not improvise
4. Attach [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) with pilot SOW

## Verify before external send

- No formal SOC 2 attestation claims or "bank-grade security" without audit proof
- No "HIPAA compliant" for meal programs serving regulated healthcare
- Always link `/trust` for public maturity labels
