# P1-27 — Trust page security details

**Policy:** `trust-page-security-p1-27-v1`  
**Registry:** [`artifacts/trust-page-security-p1-27.json`](../artifacts/trust-page-security-p1-27.json)

## Contract

The public `/trust` page must expose five security detail cards with honest limits:

| Topic | Required detail |
|-------|-----------------|
| **Webhook security** | 59/59 ingress routes signature verified (static audit PASSED) |
| **Uptime** | `/api/health`, `/status` — no fabricated SLA percentages |
| **Data residency** | US-primary today; EU region roadmap — not self-serve |
| **GDPR** | Operator-assisted DSAR/export — not "GDPR compliant" |
| **PCI** | Stripe PCI scope — OS Kitchen not merchant of record |

## Verify

```bash
npm run check:trust-page-security-p1-27
```
