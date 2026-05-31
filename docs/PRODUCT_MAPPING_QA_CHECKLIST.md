# Product Mapping Workbench — QA checklist

## Regression (legacy paths still work)

- [ ] `/dashboard/product-mapping` overview renders for a workspace
      with zero mappings (shows the "No product mappings yet" empty
      state and a working Add unmatched product form).
- [ ] Submitting `createMappingSuggestionAction` from the overview
      creates a `ProductMapping` row and writes a `ProductMappingEvent`
      with type `SUGGESTED`.
- [ ] The legacy `updateProductMappingStatusVoid` action still
      accepts `mappingId / status / internalProductId` and updates the
      row (used by `MappingRowActions`).
- [ ] Sales Channels mapping page (`/dashboard/sales-channels/mapping`)
      still renders and shows the new "Approved mappings" tile.
- [ ] Order Hub renders without the banner when no
      `missing_product_mapping` conflict exists.

## Matching engine

- [ ] Exact SKU produces `EXACT_SKU` + attaches candidate.
- [ ] Exact normalized title produces `EXACT_TITLE` + attaches.
- [ ] Alias hit produces `HIGH` + attaches.
- [ ] Token overlap 0.6 produces `MEDIUM` and **does not attach**.
- [ ] Token overlap 0.3 produces `LOW` and **does not attach**.
- [ ] Empty title produces `NONE`.

## Lifecycle

- [ ] Approving a mapping requires a target; the API returns an
      error if none is selected.
- [ ] Rejecting requires a reason of at least 2 chars.
- [ ] Changing status from APPROVED back to NEEDS_REVIEW writes a
      `CHANGED` event.
- [ ] Bulk approve skips MEDIUM/LOW rows and reports them in the
      `notes` array.
- [ ] Bulk archive sets status to ARCHIVED and writes ARCHIVED events.

## Aliases & modifiers

- [ ] Creating an alias normalises the external title.
- [ ] Next time the matching engine runs, the aliased external title
      resolves at confidence HIGH.
- [ ] Modifier suggestion picks `spice` for "Spice level".
- [ ] Modifier suggestion picks `size` for "Bowl size".

## Conflicts

- [ ] Approving two external products with the same internal target
      appears under "Duplicate OS Kitchen target".
- [ ] An open `ChannelConflict` of type `missing_product_mapping`
      shows up in the Conflicts tab and in the Order Hub banner.

## Permissions

- [ ] A staff role (e.g. `viewer`) can read but cannot approve.
- [ ] `workspace.moroz@gmail.com` superadmin can perform every
      action regardless of role.

## CSV
- [ ] `/dashboard/import-center/upload?type=PRODUCT_MAPPINGS` opens
      the upload wizard with the right template selected.

## Build
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` succeeds.
