# Enterprise Trust & Compliance Readiness

## Honest posture

- OS Kitchen is **not** marketed here as SOC 2 Type II certified or PCI Level 1 certified.  
- Card data flows belong to **Stripe** (or other PSP) — scope boundaries must stay explicit in `/trust` copy.

## Services (this pass)

- `services/trust/trust-status-service.ts` — `loadTrustControlMatrix()` with `implemented | partial | roadmap`.  
- `services/audit/audit-retention-service.ts` — loads `AuditRetentionPolicy` + exports clamp helpers.  
- `services/privacy/data-export-service.ts` — placeholder workflow description.  
- `services/privacy/data-deletion-request-service.ts` — operator-assisted deletion notes.

## Customer-facing pages

- Keep `/trust` and legal resources synchronized with actual controls — update copy when SSO/DPA programs ship.

## Roadmap controls called out

- SSO / SCIM, BYOK encryption, regional data residency, formal SOC2 program.
