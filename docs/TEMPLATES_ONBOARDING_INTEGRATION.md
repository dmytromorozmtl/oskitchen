# Templates ↔ onboarding integration

## Inputs

The template registry recommends a starter based on
`KitchenSettings.businessType` (read at SSR time on
`/dashboard/templates`).

If `businessType` is null, every starter is shown without a
"Recommended" badge.

## Outputs

After an apply, the workspace gains:

- A pinned module set (visible immediately in the sidebar).
- A seeded set of Operations Playbooks (visible at
  `/dashboard/playbooks/templates`).
- Setup tasks under `/dashboard/tasks` tagged
  `sourceType = "IMPLEMENTATION"`, each with an `actionRoute`
  metadata pointer to the module the user should open next.

## Result page links

The apply wizard's success panel includes shortcuts to:

- `/dashboard/today` — see the workspace come to life.
- `/dashboard/playbooks` — run the seeded SOP.
- `/dashboard/tasks` — open the setup checklist.
- `/dashboard/templates/history` — review the audit / roll back.

## Demo Hub and Import Center

Templates intentionally **do not** create orders, customers, or
invoices. The detail page and the result panel both link out to
Demo Hub (`/demo`) and Import Center
(`/dashboard/import-center`) when sample / production data is
needed.
