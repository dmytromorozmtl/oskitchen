# Enterprise trust, audit, compliance (honest readiness)

## Implemented trust primitives

- **Audit logging** — `services/audit/audit-service.ts` with metadata redaction and hashing hooks.  
- **RBAC** — server enforcement patterns; platform roles separated.  
- **Data export** — document actual export flows available in product (no fictional “one-click everything” unless built).  
- **Deletion / DSAR** — if only placeholder workflow exists, label as **planned** internally — customer-facing copy should describe what is available today vs request-based process.

## Do not claim unless production-true

- SOC 2 Type II certified  
- PCI processor status  
- SSO / SCIM live

## Trust page

- Link to real subprocessors, contact, security@ alias if operational.  
- DPA template — legal review required; host as static doc when counsel-approved.

## Webhook + API logs

- Retention policy stated honestly.  
- Access restricted to admin/platform roles.
