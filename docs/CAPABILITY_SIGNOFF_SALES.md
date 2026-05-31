# OS Kitchen — Capability Sign-off (Sales & CS)

**Version:** 2.0 · **Date:** 19 May 2026  
**Source of truth (code):** `lib/capabilities/capability-matrix.ts`  
**Roadmap:** [PRODUCT_ROADMAP_2026.md](PRODUCT_ROADMAP_2026.md)  
**CI gate:** `npm run verify-claims` (marketing copy vs matrix)

---

## How to use this document

1. **Sell only** what appears in *Approved to sell* or *Beta with disclosure*.
2. **Never imply** items in *Do NOT sell*.
3. For *Coming in 2026*, use quarter labels from the roadmap — **no dates before engineering sign-off**.
4. When a prospect asks for Uber, DoorDash, SMS, or offline POS — use the **redirect script** in [Partner & out-of-scope](#partner--out-of-scope-redirect-script).

---

## Approved to sell (paid pilot — meal prep / preorder / catering)

| Capability | Status | Pitch-safe summary | Roadmap note |
|------------|--------|-------------------|--------------|
| Order management & kitchen workflow | **LIVE (pilot)** | Orders, production, packing, basic routes | Q2 hardening → GA |
| Native storefront (preorder) | **BETA** | Branded menu, cart, checkout when Stripe configured | **Q2 → LIVE** |
| POS (online counter) | **BETA** | Counter sales — **requires network**; not Stripe Terminal hardware | Stays BETA |
| WooCommerce import | **BETA** | Signed webhooks + catalog sync per site | **Q2 certified LIVE** |
| Shopify import | **BETA** | Signed webhooks per shop — tenant setup required | **Q2 certified LIVE** |
| CRM (customers) | **LIVE (pilot)** | Profiles, segments, follow-ups | Q2 |
| CSV import / export | **PARTIAL** | Moderate file sizes; not bulk ETL | **Q3** large-file workers |
| Email (Resend) | **SETUP_READY** | Transactional when API key + DNS configured | **Q2 LIVE** with ops setup |
| Custom storefront domain | **SETUP_READY** | Customer-owned DNS/TLS | **Q2 LIVE** |
| Google Maps | **SETUP_READY** | Embeds for routes when API key set | **Q2 LIVE** |
| Stripe Checkout (SaaS + storefront) | **BETA** (env) | Subscriptions + customer checkout when keys + webhook | **Q2 LIVE** with monitoring |
| Workspace API keys | **BETA** | Automation with rate limits | **Q2 → LIVE** |

---

## Beta only — disclose in contract / onboarding

| Capability | Status | Do not say | Roadmap |
|------------|--------|------------|---------|
| Webhook replay | **BETA** | “Safe to replay anytime” | Break-glass only; Q3 dashboard |
| OpenAI Copilot | **BETA** | “Guaranteed AI accuracy” | Stays BETA |
| Theme A/B experiments | Feature-flagged | Default pilot: advanced experiment UI hidden | Opt-in later |
| Stripe async billing outbox | **DESIGN_READY** | “Async webhook processing live” | **Q3** if needed |

---

## Coming in 2026 (sell as roadmap — not today)

| Capability | Earliest quarter | Prerequisites |
|------------|------------------|---------------|
| Executive reporting v2 / scheduled exports | **Q3 2026** | Pilot feedback on reports |
| Catering quote → order + optional deposit | **BETA** | Convert + Stripe deposit link in order notes when configured |
| Costing actual vs theoretical + variance alerts | **BETA** | `/dashboard/costing/avt` + executive warnings |
| PO approval workflow | **BETA** | Submit / approve / reject + email to workspace owner |
| Meal plan auto-renew (draft orders) | **BETA** | Cron `meal-plan-auto-renew` for AUTO generation plans |
| Supplier price charts | **BETA** | Price history + supplier comparison |
| Production batch scale factor | **BETA** | Scale quantities on menu/order batch generation |
| Large CSV background import | **Q3 2026** | — |
| Multi-location / org hierarchy | **Q4 2026** | Design partner |
| SSO (SAML/OIDC) | **Q4 2026** | Enterprise contract |
| Self-serve data export/delete (DSR) | **Q3 2026** | Legal review |

---

## Partner & out-of-scope (redirect script)

### Do NOT sell or imply

| Claim | Matrix status | Sales response |
|-------|---------------|----------------|
| **SMS notifications** | NOT_AVAILABLE | “Email + in-app today; SMS on long-term roadmap only if demand.” |
| **POS offline mode** | NOT_AVAILABLE | “POS requires connectivity; built for connected preorder kitchens.” |
| **Stripe Terminal / card readers** | ROADMAP | “We support counter checkout in-browser; integrated card readers are not on 2026 roadmap.” |
| **Uber Eats native sync** | PARTNER_ACCESS_REQUIRED | “Evaluation only; requires Uber partnership — not production-certified.” |
| **Uber Direct / DoorDash** | ROADMAP | “Not available in 2026 product plan; consolidate via Woo/Shopify or manual orders today.” |
| **SSO / SCIM** | ROADMAP | “Enterprise Q4 2026 with design partner; email/password for pilot.” |
| **SOC 2 attestation** | ROADMAP | “Security program documented; formal SOC2 not claimed.” |
| **“All delivery apps connected”** | — | “WooCommerce and Shopify (beta); marketplaces partner-gated.” |

### Redirect script (copy-paste)

> “OS Kitchen is built for **weekly preorder and kitchen operations** — menu, production, packing, and your own storefront. Marketplace connectors like Uber Eats and DoorDash require **separate partnership programs** we don’t sell as live today. Most pilots consolidate channels through **Shopify/WooCommerce** or manual orders. I’ll send you our capability sheet so we only commit to what’s live for your go-live.”

---

## Pilot operating assumptions

1. **White-glove onboarding** — paid pilot, not self-serve enterprise.
2. **`NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot`** — reduced sidebar (advanced modules hidden).
3. **Production crons** — only paths in `production-manifest.ts`.
4. **Support** — email + in-app; no 24/7 SLA unless contracted.
5. **Feedback** — operators complete [PILOT_FEEDBACK_TEMPLATE.md](PILOT_FEEDBACK_TEMPLATE.md) at week 1, 4, 12.

---

## Pilot → general availability (sales milestone)

General availability (public self-serve + standard SLA) requires product gates in [PRODUCT_ROADMAP_2026.md](PRODUCT_ROADMAP_2026.md):

- ≥ 8 paying operators, 12+ weeks live  
- Activation ≥ 55%, NPS ≥ 40  
- Core + storefront + Stripe marked **LIVE** in matrix  

Until then, sell **“Paid pilot”** only.

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product (CPO) | | 19 May 2026 | |
| Engineering | | | |
| Sales lead | | | |

*Update this document when `capability-matrix.ts` or `PRODUCT_ROADMAP_2026.md` changes.*
