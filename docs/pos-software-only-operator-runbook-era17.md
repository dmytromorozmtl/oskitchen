# POS — Software-Only Operator Runbook (Era 17)

**Policy:** `era17-pos-operator-runbook-v1`  
**Proof status:** `operator_runbook_ready` (doc + cert); golden path on staging → `proof_passed` with operator attestation  
**Honest scope:** browser/tablet POS you operate — **not** proprietary hardware, offline certification, or rush-hour throughput claims.

---

## Who this is for

Cashiers, shift leads, and managers running **web-first POS** during a qualified paid pilot. Pair with:

- `docs/pos-tablet-ux-operator-runbook-era17.md` — touch targets and checkout status UX
- `docs/pos-manager-discount-operator-guide-era17.md` — discount / COMPED RBAC

---

## Required permissions

| Task | Permission | Plan feature |
|------|------------|--------------|
| Open terminal | `pos.access` | `pos_terminal` |
| Checkout | `pos.checkout` | `pos_terminal` |
| Discount / COMPED | `pos.discount.apply` | `pos_terminal` |
| Open / close shift | `pos.shift.open`, `pos.shift.close` | `pos_shifts` (Team+) |
| Refund | `pos.refund` | `pos_terminal` |
| Void | `pos.void` | `pos_terminal` |
| Registers | `pos.register.manage` | `pos_registers` |
| Reports | `pos.reports.read` | `pos_reports` |

Missing permission shows **PosAccessCard** — contact workspace owner; this is RBAC, not a bug.

---

## Daily golden path (counter service)

### 1. Start of shift

1. Open **`/dashboard/pos/shifts`**.
2. Select register, staff member, opening cash float.
3. Submit **Open shift** — confirm status shows **OPEN**.

### 2. Sell on terminal

1. Open **`/dashboard/pos/terminal`** (tablet or counter browser).
2. Attach customer optionally (CRM search requires checkout permission).
3. Add products, set fulfillment (pickup / dine-in / delivery intent).
4. Payment mode: **Cash** for pilot counter flow; card modes require Stripe Terminal config (software placeholder until hardware certified).
5. **Complete sale** — confirm green checkout status (`data-testid="pos-checkout-status"`).

### 3. Verify sale

1. **`/dashboard/pos/transactions`** — new row with correct total and payment mode.
2. **`/dashboard/pos/receipts`** — receipt number matches; subtotal, tax, discount, total align with cart. Closeout/receipt math spot check: **`docs/pos-receipt-shift-spotcheck-era17.md`**.
3. Order appears in **`/dashboard/order-hub`** (canonical order spine).

### 4. Manager corrections (when needed)

- **Refund** — `/dashboard/pos/transactions` → refund action; requires `pos.refund`.
- **Void** — same surface; requires `pos.void`.
- **Discount after the fact** — not supported on terminal UI; use order hub or void/re-ring. Explicit discounts at checkout require `pos.discount.apply`.

### 5. End of shift

1. Return to **`/dashboard/pos/shifts`**.
2. Enter counted closing cash.
3. Review **expected cash** (opening + cash sales) vs **variance**.
4. Document unexplained variance before close — audit event `pos.shift.closed` is recorded.

---

## Inventory (pilot honesty)

POS sales may deplete inventory when products have active recipes (**POS-only** depletion). Storefront orders do **not** deplete stock in pilot — do not tell customers unified inventory is live.

---

## Offline / hardware (limitations)

- Software may queue some cash intent locally when offline — **do not** sell “offline POS” or Toast/Square hardware parity.
- Stripe Terminal / tap-to-pay errors surface in checkout status; fix config under **POS → Settings → Hardware**.
- No rush-hour throughput certification.

---

## Pilot validation

```bash
npm run smoke:pos-operator-runbook
npm run test:ci:pos-money-path:cert
```

**Manual golden path on staging** (optional evidence):

```bash
export POS_OPERATOR_RUNBOOK_OPERATOR_EMAIL=ops@yourkitchen.com
export POS_OPERATOR_RUNBOOK_STAGING_URL=https://staging.example.com
export POS_OPERATOR_RUNBOOK_GOLDEN_PATH_ATTESTATION=passed
npm run smoke:pos-operator-runbook
```

Review **`artifacts/pos-operator-runbook-summary.json`** — `posOperatorProofStatus` should be `proof_passed` only after all steps executed on staging.

Without operator email → **SKIPPED WITH REASON** (expected for CI/template runs).

---

## Escalation

| Symptom | First check |
|---------|-------------|
| “Shift is not open” at checkout | Open shift for same register |
| Permission denied on terminal | Role missing `pos.access` |
| Discount blocked | Cashier lacks `pos.discount.apply` |
| Order created but no receipt | Support — POS persistence partial failure message |
| Variance on close | Count cash drawers; review cash-mode transactions only |

---

## Forbidden claims

- Hardware POS / Toast / Square terminal parity  
- Offline POS production readiness  
- Rush-hour throughput certification  
