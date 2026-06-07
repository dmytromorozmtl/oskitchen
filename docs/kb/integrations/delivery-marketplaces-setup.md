# Delivery marketplaces setup (Uber Eats, DoorDash, Grubhub)

**KB:** `/kb/integrations/marketplaces`  
**Dashboard:** `/dashboard/integrations` · **Integration Health**  
**Maturity:** BETA / partner-gated — credentials required before LIVE  
**Engineering reference:** [`../INTEGRATION_LAUNCH_STATUS.md`](../INTEGRATION_LAUNCH_STATUS.md)

---

## Prerequisites

- Team plan or Enterprise for marketplace adapters (verify plan limits in Billing)
- Partner-approved API credentials from each marketplace
- Active OS Kitchen menu with channel SKUs where mapping required
- Understanding that **0 LIVE third-party integrations** is possible until your credentials verify

Marketplace adapters require partner approval — OS Kitchen does not grant Uber/DoorDash API access on your behalf.

---

## Dashboard steps

1. Open **Dashboard → Integrations** hub.
2. Select the marketplace adapter (Uber Eats, DoorDash, Grubhub).
3. Enter partner-provided credentials — stored encrypted when `ENCRYPTION_KEY` is set.
4. Click **Test connection** if available — may return NEEDS_AUTH until partner enables access.
5. Review **Integration Health** (`/dashboard/integrations/health`):
   - **CONNECTED** — credentials verified, recent sync OK
   - **NEEDS_AUTH** — missing or invalid credentials
   - **ERROR** — last sync failed; check webhook log
6. Map marketplace menu items to OS Kitchen products before accepting live orders.

Orders from connected channels appear in **Order Hub** alongside POS and storefront.

---

## Webhooks

Each marketplace uses partner-specific webhook URLs and signature schemes.

| Channel | Typical inbound path | Notes |
|---------|---------------------|-------|
| Uber Eats | `/api/webhooks/uber-eats` (verify in Integrations card) | Partner program required |
| DoorDash | Partner webhook URL shown after credential save | Allowlisting may apply |
| Grubhub | Partner webhook URL shown after credential save | Verify signature docs with partner |

Copy webhook URLs from the Integrations hub card after saving credentials. Register the exact URL in the partner portal.

OS Kitchen logs inbound webhooks under **Integrations → Webhook log** for replay and debugging.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| NEEDS_AUTH persists | Contact marketplace partner support for API enablement |
| Orders not appearing | Check webhook log; confirm menu mapping complete |
| Duplicate orders | Idempotency keys — contact support with webhook id |
| Health score low | Expected during BETA — score ≠ uptime guarantee |
| Sales claim blocked | Do not market LIVE until Integration Health shows CONNECTED on your tenant |

**Honesty rules:**

- Never claim "Live DoorDash/Uber Eats today" without verified CONNECTED status on **your** workspace
- Deliverect-style middleware is a different category — see [`../competitive-battle-cards.md`](../competitive-battle-cards.md) BC-S1
- Uber Direct courier dispatch is on the roadmap — separate from Uber Eats order ingest

**Alternative:** Many operators use aggregator middleware **with** an ops platform — disclose Integration Health SKIPPED rows honestly in sales calls.
