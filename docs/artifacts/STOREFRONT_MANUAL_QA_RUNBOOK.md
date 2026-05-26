# Storefront manual QA runbook — pilot `hello`

**Time:** ~45–60 min after automated HTTP smoke passes.  
**Prereq:** `npm run storefront:qa-artifact` green on staging or prod URL.

---

## Setup

| Item | Value |
|------|-------|
| Admin | `/dashboard/storefront` (store: Hello) |
| Public base | `{BASE}/s/hello` |
| Stripe | Option A — pay-later only |

---

## 1. Published storefront loads

1. Open `{BASE}/s/hello` in incognito.
2. Expect: 200, store name visible, no auth wall.
3. **Pass criteria:** Home renders; no 500 in Network tab.

---

## 2. Draft / preview (owner only)

1. Admin → **Launch** → set **Published** off (note previous state).
2. Incognito `{BASE}/s/hello` → expect **404**.
3. Logged-in owner → preview tab or preview link → expect draft visible.
4. Restore **Published** on.

---

## 3. Menu visibility

1. Admin → **Menu** → pick a product → disable **Storefront visible**.
2. Public `/s/hello/menu` → product hidden.
3. Re-enable visibility.

---

## 4. Product URLs

1. From menu, open product by click (UUID path).
2. If `publicSlug` set, open `{BASE}/s/hello/products/{slug}` directly.
3. **Pass:** Both resolve; 404 for wrong slug.

---

## 5. Pay-later checkout E2E

1. Add 1+ items → **Cart** → **Checkout**.
2. Fill required fields (name, email, pickup/delivery per settings).
3. Submit **Pay later** / request order (no Stripe redirect).
4. **Pass:** Confirmation page; order in **Order Hub** with correct total and notes.

---

## 6. Confirmation notes

1. On checkout, add order notes (special instructions).
2. **Pass:** Notes visible on confirmation and in Order Hub detail.

---

## 7. Disabled storefront → 404

1. Admin → **Launch** → disable storefront entirely.
2. Guest `{BASE}/s/hello` → 404.
3. Re-enable.

---

## 8. Unpublished → 404 (guest)

Same as §2 — guest 404 while unpublished.

---

## 9. Promo codes

| Case | Steps | Expected |
|------|-------|----------|
| Valid | Admin → **Promotions** → active code → apply at checkout | Total reduced |
| Invalid | Enter `INVALID999` | Inline error; no order |

---

## 10. Blackout date

1. Admin → **Ordering** / blackout settings → block today (or test date).
2. Checkout for that date → blocked message.
3. Remove blackout after test.

---

## 11. Honeypot (contact)

1. `{BASE}/s/hello/contact` → open DevTools → find hidden `companyUrl` (or equivalent).
2. Fill visible fields + honeypot → submit.
3. **Pass:** No row in submissions / no email; or silent success without DB row.

---

## Sign-off in QA artifact

Copy results into the manual table in `docs/artifacts/storefront-qa-release-*.md`:

| Role | Approved |
|------|----------|
| Engineering | ☐ |
| Product / Ops | ☐ |
