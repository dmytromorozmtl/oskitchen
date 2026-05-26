# Storefront next pass — QA checklist

1. **Nav/footer:** visit `/s/[slug]` — nav renders; invalid `javascript:` links stripped; fallback links if JSON empty; checkout still loads.
2. **Design tokens:** flag off → no `--sb-*` on `.kos-storefront-root`; flag on → vars present; checkout `data-checkout=1` and no scoped vars.
3. **Assets:** panel shows setup-required without env; no upload performed.
4. **Sections:** add section until cap; JSON invalid → redirect error query (existing behavior).
5. **HOME:** after overview save, HOME exists; `/s/[slug]` shows sections when published; fallback hero when empty.
6. **Slider:** add SLIDER section JSON from defaults; public page renders; keyboard arrows; reduced motion disables autoplay.
7. **Theme publish:** type `PUBLISH` + submit; `themePublishedAt` set; strangers use snapshot nav/footer.
8. **i18n:** add `labels.fr` on a nav item — French locale string resolves when `sf.locale` starts with `fr`.
9. **Permissions:** as STAFF, section save blocked; as OWNER, allowed; publish requires OWNER (or superadmin).
10. **Legal sanitizer:** `<script>` in privacy stripped after save.
11. **Performance:** exceeding max sections returns error from server action.

## Commands (2026-05-14 run)

- `npm run typecheck` — pass
- `npm run build` — pass
- `npm run lint` — pass (repo-wide warnings remain in unrelated files)
- `npm test` — pass
