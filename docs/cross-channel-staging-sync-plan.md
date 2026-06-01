# Cross-Channel Inventory — Staging Sync Plan

**Status:** Draft — live staging proof blocked until ops vault (0/11)  
**Audience:** Integration engineering, QA, VP Operations  
**Engine:** `services/inventory/cross-channel-inventory-sync.ts`  
**UI:** `/dashboard/inventory/cross-channel`  
**Related:** [`cross-channel-inventory-sales-one-pager.md`](./cross-channel-inventory-sales-one-pager.md) · [`ops-vault-matrix.md`](./ops-vault-matrix.md)

---

## Purpose

Define how to **prove** cross-channel inventory sync on staging with real Shopify/Woo connections — not mock E2E only. Until this plan passes, sales must use **ONLY_WITH_CAVEAT** language (see sales one-pager).

**Honesty rule:** Do not mark `salesSafeVerdict: live_proven` until `artifacts/cross-channel-staging-sync-summary.json` shows PASS for pull + push + conflict resolution on staging.

---

## Prerequisites (vault Phase 2 + 3)

| Variable | Phase | Why |
|----------|-------|-----|
| `DATABASE_URL` | 2 | Integration connections persisted |
| `ENCRYPTION_KEY` | 2 | Channel credential decrypt |
| `E2E_STAGING_BASE_URL` | 1 | Dashboard + actions |
| `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` | 1 | Operator login |
| `CHANNEL_SMOKE_OWNER_EMAIL` | 3 | Workspace with test connections |

Optional channel-specific (per connection):

- Shopify: OAuth tokens on staging connection (`IntegrationConnection`)
- WooCommerce: REST credentials on staging connection
- DoorDash: partner API creds (compare-only pilot; push optional)

---

## Staging tenant setup

1. Log in to staging as workspace owner (`CHANNEL_SMOKE_OWNER_EMAIL` or equivalent).
2. Ensure **≥ 3 products** in Kitchen spine with SKUs mapped to channel external products.
3. Connect **Shopify test store** (Settings → Integrations → Shopify) — connection status `active`.
4. Connect **WooCommerce test store** — connection status `active`.
5. Enable cross-channel settings per connection (`crossChannelSettingsFromConnection` in connection JSON).
6. Open `/dashboard/inventory/cross-channel` — panel loads without crypto errors.

**Pass gate:** Panel shows master quantities + channel badges (may show drift before first sync).

---

## Proof scenarios (ordered)

### Scenario A — Pull (channel → Kitchen compare)

| Step | Action | Expected |
|------|--------|----------|
| A1 | Set Shopify variant qty **10** externally | — |
| A2 | Set Kitchen master qty **8** for mapped SKU | Drift visible |
| A3 | Click **Pull / Sync now** (`pullCrossChannelInventoryAction`) | Conflict row or auto-resolve per policy |
| A4 | Verify `detectInventoryConflicts` output in UI | Conflict queue OR master updated |

**Evidence:** Screenshot + `IntegrationConnection` settings timestamp; optional DB snapshot of `InventoryLevel`.

### Scenario B — Push (Kitchen → channel)

| Step | Action | Expected |
|------|--------|----------|
| B1 | Adjust Kitchen master to **5** | — |
| B2 | Run push (`runCrossChannelInventorySyncPush`) via UI or action | Shopify/Woo qty → 5 (allow API lag ≤ 30s) |
| B3 | Verify external admin shows **5** | Manual check |

**Evidence:** External channel admin screenshot + audit log entry if enabled.

### Scenario C — Conflict resolution

| Step | Action | Expected |
|------|--------|----------|
| C1 | Force drift: Kitchen **3**, Shopify **7** | Conflict appears |
| C2 | Resolve **Kitchen wins** (`resolveCrossChannelConflictAction`) | Master stays 3; channel pushed to 3 |
| C3 | Force drift again; resolve **Channel wins** | Master updated to channel qty |

**Evidence:** Before/after quantities in UI + resolved conflict cleared from queue.

### Scenario D — Low-stock alert

| Step | Action | Expected |
|------|--------|----------|
| D1 | Set threshold **10** on product with master **8** | Alert badge |
| D2 | Email configured (`isEmailConfigured`) | Optional alert email (staging mail sink) |

### Scenario E — Tenant isolation

| Step | Action | Expected |
|------|--------|----------|
| E1 | Run `e2e/cross-tenant-isolation-staging.spec.ts` on staging | PASS — workspace A cannot read B inventory |

---

## Execution commands

```bash
# After vault 11/11
export E2E_STAGING_BASE_URL='https://staging.example.com'
export E2E_LOGIN_EMAIL='owner@pilot.example'
export E2E_LOGIN_PASSWORD='...'

# Mock path (CI — already certified)
npx playwright test e2e/cross-channel-inventory.spec.ts

# Staging path (requires live connections)
npx playwright test e2e/cross-channel-inventory.spec.ts \
  --grep @staging-live \
  # future: dedicated staging spec when vault unblocks

# Manual smoke checklist
open "$E2E_STAGING_BASE_URL/dashboard/inventory/cross-channel"
```

---

## Artifact output (future)

Write `artifacts/cross-channel-staging-sync-summary.json`:

```json
{
  "overall": "PASS | FAIL | SKIPPED",
  "generatedAt": "ISO-8601",
  "scenarios": {
    "pull": "PASS",
    "push": "PASS",
    "conflict_kitchen_wins": "PASS",
    "conflict_channel_wins": "PASS",
    "low_stock_alert": "PASS",
    "tenant_isolation": "PASS"
  },
  "channels": ["shopify", "woocommerce"],
  "honestyNote": "DoorDash push not required for pilot PASS"
}
```

**SKIPPED** is acceptable when vault incomplete — never fabricate PASS.

---

## Acceptance criteria (pilot-ready)

- [ ] Scenarios A–C PASS on staging with real Shopify + Woo
- [ ] No cross-tenant leakage (Scenario E)
- [ ] UI honesty banner visible if DoorDash push not certified
- [ ] `salesSafeVerdict` for `bidirectional-inventory-sync` may upgrade to `partial+` — **not** `yes` until 7-day pilot window
- [ ] Forbidden claims unchanged: no "unified inventory production" without this artifact PASS

---

## Rollback / failure handling

| Failure | Action |
|---------|--------|
| Crypto error on pull | Verify `ENCRYPTION_KEY` matches Vercel staging |
| Connection not found | Check `integrationConnectionListWhereForOwner` scope |
| Push 401/403 | Re-OAuth Shopify/Woo on staging |
| Conflict loop | Manual resolve + file bug with connectionId + conflictId |

---

## Timeline

| Phase | Owner | When |
|-------|-------|------|
| Doc complete | Engineering | 2026-06-01 |
| Vault 11/11 | VP Ops | Day 0 |
| Staging connections | Integration eng | Day 1 |
| Scenarios A–E | QA | Day 2–3 |
| Pilot sales enablement | GTM | After artifact PASS |

---

## References

- `actions/inventory/cross-channel-inventory.ts`
- `services/inventory/cross-channel-inventory-sync.ts`
- `components/inventory/cross-channel-inventory-panel.tsx`
- `e2e/cross-channel-inventory.spec.ts`
- `tests/unit/cross-channel-inventory-sync.test.ts`
- `artifacts/competitor-feature-tracker.json` → `bidirectional-inventory-sync`
