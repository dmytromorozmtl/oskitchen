# Quick-start templates

**Route:** `/dashboard/templates`

## Current scope

Starter cards that link to **demo import**, **Today**, and **Settings → Modules** — honest about what is automated vs manual.

## Full template behavior (roadmap)

Each template applies **selected** bundles: sample categories, products, production stages, fulfillment rules, storefront sections, tasks, report bookmarks, label presets.

- **Preview** — read-only description + sample counts.  
- **Apply** — transactional seed subset (respect demo mode guards).  
- **Reset** — only in demo mode (`clearWorkspaceSampleData`).  
- **Partial apply** — checkbox matrix per bundle.

Implementation should share code paths with `services/demo-data.ts` where possible.
