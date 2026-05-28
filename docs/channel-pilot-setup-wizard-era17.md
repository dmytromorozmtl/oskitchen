# Era 17 — Channel pilot setup wizard

**Policy:** `era17-channel-pilot-setup-wizard-v1`  
**Status:** `pilot_setup_wizard_ready` — in-app 5-step wizard on Woo/Shopify integration pages  
**Updated:** 2026-05-28  
**Extends:** [`channel-pilot-playbook-era17.md`](./channel-pilot-playbook-era17.md) (`era17-channel-pilot-playbook-v1`)

---

## Purpose

Reduce Woo/Shopify pilot setup friction by consolidating **9 scattered operator steps** into **5 in-app wizard steps** with progress tracking, copy-to-clipboard for webhook URLs, and direct links to webhook logs.

This does **not** claim live marketplace ops, one-click connect, or production-certified integrations for all tenants.

---

## Five-step wizard path

| Step | Operator action | Completion signal |
|------|-----------------|-------------------|
| 1. Save credentials | Fill connection form on integration page | Encrypted credentials + store identity saved |
| 2. Test connection | Tools → Test connection | Certification check `rest_api_reachable` = pass |
| 3. Configure webhooks | Register webhook URL/topics in Woo/Shopify admin | Webhook secret saved + URL visible |
| 4. Verify webhook | Place test order; check Sales channels → Webhooks | Certification check `recent_valid_webhooks` = pass |
| 5. Run certification | Integration page → Run certification checks | Certification overall PASS or documented PARTIAL |

**UI location:** Dashboard → Integrations → WooCommerce or Shopify — `ChannelPilotSetupWizard` at top of page.

---

## Pilot friction reductions

- **Progress tracker** replaces hopping between playbook sections, integration page, and webhook log without status.
- **Copy webhook URL** button on Woo page (after connection save).
- **Direct link** to `/dashboard/sales-channels/webhooks` from wizard step 4.
- **Advanced toggles collapsed** — auto-import / auto-create product checkboxes moved under “Advanced (not required for pilot)” on Woo form.

---

## Validation

```bash
npm run test:ci:channel-pilot-setup-wizard-era17:cert
npm run smoke:channel-pilot-setup-wizard
```

Operator spot check (optional attestation):

```bash
CHANNEL_PILOT_SETUP_OPERATOR_EMAIL=ops@example.com npm run smoke:channel-pilot-setup-wizard
```

Without operator email: **SKIPPED WITH REASON** — cert must still PASS.

---

## Forbidden claims

- One-click marketplace connect
- Production-certified Woo/Shopify for all tenants
- Full bidirectional sync live

---

## Related

- Backlog: `KOS-E17-033`
- Component: `components/integrations/channel-pilot-setup-wizard.tsx`
- Steps module: `lib/integrations/channel-pilot-setup-wizard-steps.ts`
