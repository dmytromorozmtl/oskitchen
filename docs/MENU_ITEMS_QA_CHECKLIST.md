# Menu items & planner — QA checklist

- [ ] **Catalog:** New user opens `/dashboard/products` → can open “Add …” dialog without visiting Menu Center first.
- [ ] **Catalog menu hidden:** `/dashboard/menus` does not list “Item library”.
- [ ] **Storefront:** Cannot save catalog as active menu (error message).
- [ ] **Public storefront:** If DB had catalog as active, site behaves as no menu after migration + `getStorefrontForPublic`.
- [ ] **Submit order:** `submitPublicStorefrontOrder` rejects when active menu is catalog-only.
- [ ] **Plan limits:** With Starter (1 menu) + catalog auto-created, user can still add one service menu.
- [ ] **Duplicate menu:** Duplicating the internal catalog menu is rejected.
- [ ] **Reminders:** `sendReminderEmails` refuses catalog menu id.
- [ ] **Quick / new order:** Active menu query ignores catalog even if toggled active by mistake.
- [ ] **CSV import:** PRODUCTS import lands on service menu when one is active; otherwise catalog.
- [ ] **Weekly workflow:** Existing menus and products unchanged after migration.
- [ ] **Planner:** Title reflects `BusinessType`; empty checklist shows when no service menus.
- [ ] **Typecheck / build:** `npm run typecheck` and `npm run build` succeed.
