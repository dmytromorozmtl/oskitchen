# Era 17 — Woo/Shopify channel pilot playbook

**Policy:** `era17-channel-pilot-playbook-v1`  
**Status:** operator-ready one-pager for **qualified paid pilots**  
**Updated:** 2026-05-28  
**In-app wizard:** [`channel-pilot-setup-wizard-era17.md`](./channel-pilot-setup-wizard-era17.md) (`era17-channel-pilot-setup-wizard-v1`) — **5-step** progress tracker on integration pages  
**Maturity source of truth:** [`feature-maturity-matrix.md`](./feature-maturity-matrix.md)  
**Parent runbook:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md)

Use this playbook when a pilot contract includes **WooCommerce and/or Shopify test shop** connectivity. It is **not** a substitute for engineering CI cert, live smoke PASS, or GitHub workflow evidence.

---

## Purpose and honest scope

OS Kitchen supports **qualified test-shop integrations** for pilots:

- Webhook ingest → external order visibility in order hub (golden path certified)
- Credential save, connection test, product sync smoke
- In-app tenant certification checks

**Not included in pilot scope:**

- Full marketplace live ops or bidirectional catalog sync at scale
- DoorDash / Uber Eats / Grubhub live integrations
- Production-certified marketplace for all tenants

**Safe sales wording:** “Woo/Shopify **test shop** — qualified golden path; not full marketplace live ops.”

Related policies: `era16-channel-live-smoke-v1`, `era17-channel-live-smoke-woo-v1`, `era17-channel-live-smoke-shopify-v1`, `era17-channel-github-workflow-first-green-v1`.

---

## Before you start

| Check | Pass criteria |
|-------|----------------|
| Tier 0 CI | `npm run test:ci:governance-bundles` PASS on release commit |
| Matrix | Shopify/Woo row is `pilot_ready` with **qualified** sales claim |
| Test shop | Dedicated staging/dev store — see [`WOO_SHOPIFY_TEST_SHOP_SETUP.md`](./WOO_SHOPIFY_TEST_SHOP_SETUP.md) |
| RBAC | Owner or `integrations.manage` for connection setup |
| Entitlements | Workspace on plan that includes channel integrations |

**Duration:** ~20–30 minutes per channel with in-app wizard; allow 45 minutes if running both and documenting certification PARTIAL.

---

## In-app pilot setup wizard (preferred path)

Use **Dashboard → Integrations → WooCommerce** or **Shopify** — the **Pilot setup wizard** card tracks five steps:

1. Save credentials  
2. Test connection  
3. Configure webhooks (copy URL on Woo)  
4. Verify webhook delivery → link to Sales channels → Webhooks  
5. Run certification checks  

See [`channel-pilot-setup-wizard-era17.md`](./channel-pilot-setup-wizard-era17.md). Legacy playbook steps below remain for CLI/engineering reference.

---

## WooCommerce test shop path

1. **Create / use test Woo store** (HTTPS). Never use a production customer store.
2. **Dashboard → Integrations → WooCommerce** — save store URL, REST keys, webhook secret.
3. **Woo admin → Webhooks** — point to OS Kitchen URL from dashboard; topics: `order.created`, `order.updated`, `product.updated`.
4. **Test connection** → **Sync products** (optional for pilot).
5. Place a **test order** on Woo; confirm event in **Sales channels → Webhooks** with `signatureValid: true`.
6. **Integration page → Run certification checks** — all automated checks green or documented skip.

CLI (engineering, staging DB):

```bash
npm run smoke:woo-shopify-live
# or tenant-only:
npx tsx scripts/smoke-woo-shopify-certification.ts --owner-email OWNER@example.com --provider woocommerce
```

---

## Shopify test shop path

1. **Shopify Partners → development store** (`*.myshopify.com`).
2. **Dashboard → Integrations → Shopify** — save shop domain, Admin API token, webhook signing secret.
3. Register webhooks: `orders/create`, `orders/updated`, `products/update` (URLs from dashboard).
4. **Test connection** → place **test order** on Shopify dev store.
5. Confirm webhook in **Sales channels → Webhooks** with valid signature.
6. **Run certification checks** on integration page.

CLI:

```bash
npx tsx scripts/smoke-woo-shopify-certification.ts --owner-email OWNER@example.com --provider shopify
```

---

## Validation and smoke artifacts

| Command | When | Honest outcome |
|---------|------|----------------|
| `npm run test:ci:channel-golden-path:cert` | Every release | Synthetic golden path — always-on CI |
| `npm run smoke:channel-golden-path` | Pre-pilot staging | Synthetic path smoke |
| `npm run smoke:woo-shopify-live` | Staging with DB creds | Review `artifacts/channel-live-smoke-summary.json` |
| `npm run smoke:channel-github-workflow-first-green` | After GitHub run | Review `artifacts/channel-github-workflow-first-green-summary.json` |

**SKIPPED WITH REASON** (missing `DATABASE_URL`, `ENCRYPTION_KEY`, tenant selector, or GitHub run URL) is **honest** — do not treat as PASS in pilot contract.

**FAILED** requires engineering triage before pilot GO.

Optional GitHub: Actions → **Woo Shopify Staging Smoke** → `workflow_dispatch`. Record `GITHUB_WOO_SHOPIFY_STAGING_RUN_URL` + outcome. See [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md).

Detail: [`WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md`](./WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md).

---

## Forbidden pilot claims

Do **not** put these in pilot contracts, decks, or buyer FAQ:

- Production-certified Woo/Shopify marketplace integration
- Full bidirectional sync live for all catalog fields
- Live DoorDash / Uber Eats / Grubhub order routing
- “Same as Toast/Square marketplace depth”

Procurement alignment: [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md).

---

## Support boundaries and rollback

| In scope | Out of scope |
|----------|--------------|
| Test shop setup guidance | Custom Woo/Shopify plugin development |
| Webhook URL + secret configuration | Production cutover without migration plan |
| Certification check interpretation | 24/7 marketplace on-call |
| Honest skip/fail documentation | Claiming PASS when smoke was SKIPPED |

**Rollback (pause channel):**

1. Disable webhooks in Woo/Shopify admin.
2. Revoke REST/API keys in provider admin.
3. Disconnect or disable connection in OS Kitchen Integrations.
4. Record date + reason in pilot tracker.

---

## Sign-off checklist

| ID | Task | Owner | GO blocker? |
|----|------|-------|:-----------:|
| ch-preflight | Tier 0 CI + matrix review | Engineering | **Y** |
| ch-testshop | Dedicated test shop confirmed | Owner | **Y** |
| ch-webhooks | ≥1 webhook with valid signature | Owner | **Y** |
| ch-cert | In-app certification checks run | Owner | **Y** |
| ch-smoke | Live smoke SKIPPED/FAILED documented OR PASS artifact | Engineering | N |
| ch-claims | No forbidden marketplace claims in contract | Sales | **Y** |

Record: environment URL, date, owner email, Woo/Shopify provider, smoke artifact paths, notes.

For full paid pilot GO/NO-GO: [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) → `npm run cert:commercial-pilot-evidence-era16`.

---

## Related docs

| Doc | Use |
|-----|-----|
| [`WOO_SHOPIFY_TEST_SHOP_SETUP.md`](./WOO_SHOPIFY_TEST_SHOP_SETUP.md) | Provider-specific setup |
| [`WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md`](./WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md) | Engineering cert detail |
| [`channel-golden-path-honesty-checklist.md`](./channel-golden-path-honesty-checklist.md) | Golden path scope |
| [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) | Full pilot tiers |
