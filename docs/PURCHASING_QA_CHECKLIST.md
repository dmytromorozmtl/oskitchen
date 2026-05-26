# Purchasing QA checklist

- [ ] Migrate DB (`20260507203000_purchasing_command_center`).
- [ ] `/dashboard/purchasing` loads; subnav links work.
- [ ] Create supplier on `/suppliers`.
- [ ] Create draft PO from purchase orders page → detail loads.
- [ ] “Generate from demand” creates reorder rows when shortages exist.
- [ ] Reorder queue lists OPEN items.
- [ ] Ingredient demand page unchanged.
- [ ] `npm run typecheck` && `npm run build`.
