# Integration Maturity Matrix

**Purpose:** Single vocabulary for **product**, **support**, and **engineering** so KitchenOS never displays “Connected” without proof.

## Status vocabulary

| Status | Meaning |
|--------|---------|
| **LIVE** | Credentials OK **and** representative end-to-end flow verified for the workspace (human or automated smoke). |
| **BETA** | Implemented but requires monitoring / partial coverage / staging-first (e.g. Stripe until production reconciliation proven). |
| **SETUP_READY** | Keys or native capability present; operator still needs to complete checklist (DNS, scopes, menu bind). |
| **PARTNER_ACCESS_REQUIRED** | Vendor gate (Uber marketplace, etc.) — do not imply live traffic. |
| **PARTIAL** | Degraded / error state — show last error + fix route. |
| **DEV_ONLY** | Engineering flag — not marketed. |
| **ROADMAP** | Not available in this build; honest competitor placeholder (external POS deep sync). |
| **NOT_AVAILABLE** | Missing prerequisites (keys, plan, or feature not shipped). |

## Code references

- Channel catalog: `lib/channels/channel-registry.ts`, runtime resolution `lib/channels/channel-runtime.ts`.  
- Product UI: `/dashboard/integration-health` (matrix + cards + failed webhooks), `/dashboard/sales-channels`.  
- Infrastructure rows: `lib/integrations/integration-maturity-matrix.ts` + `getServerEnv()` booleans (never render secret values).  
- Internal: `/platform/integrations`, `/platform/webhooks`.

## Provider notes (honest defaults)

| Provider | Typical maturity | Notes |
|----------|------------------|-------|
| KitchenOS POS | LIVE (native) | First-party; not legacy Toast replacement. |
| Manual orders | LIVE | Always on. |
| Storefront | LIVE / SETUP_READY | Depends on Stripe + domain. |
| WooCommerce / Shopify | SETUP_READY → LIVE | OAuth + webhooks + mapping depth decides. |
| Uber modules | PARTNER_ACCESS_REQUIRED / ROADMAP | Never claim marketplace live without partner program. |
| Stripe | BETA or NOT_AVAILABLE | Needs secret + webhook + publishable key. |
| Resend | SETUP_READY / NOT_AVAILABLE | Deliverability is customer DNS. |
| Google Maps | SETUP_READY / NOT_AVAILABLE | Quota + key restriction is customer cloud. |
| OpenAI | BETA / ROADMAP | Policy + DPA separate. |
| CSV import | LIVE | Controlled batches; operator review. |
| External POS (Toast/Square/…) | ROADMAP | Documented explicitly as not shipped natively. |

## Card requirements (checklist)

Every integration card should eventually show: **status**, **what works**, **what does not**, **setup checklist**, **last sync**, **last error**, **retry** (if safe), **docs link**.

## Related doc

`docs/INTEGRATION_MATURITY_MATRIX.md` is mirrored by in-app `/dashboard/integration-health`.
