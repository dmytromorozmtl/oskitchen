# Era 20 — Support impersonation flow proof

**Policy:** `era20-support-impersonation-flow-proof-v1` (`KOS-E20-014`)

## Hops

1. Support queue triage (`internal_only`)  
2. Audited support session on workspace  
3. Tenant go-live review (deep link after impersonate)  
4. Impersonation MFA + super-admin gate  
5. Platform audit trail review  

## Forbidden claims

- Founder-email bypass  
- Production SSO / SOC2 via support path  
- Customer-facing impersonation without contract SLA  

## UI

`/platform/go-live` — **Support impersonation proof** panel (session + RBAC aware).
