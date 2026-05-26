# UAT / Testing

`app/dashboard/implementation/[projectId]/uat/page.tsx`

## Scenarios (`UAT_SCENARIOS`)

- **Create order** — manual order from CRM appears on Orders board.
- **Import order** — sample order import in Import Center.
- **Publish menu** — menu appears on storefront.
- **Production workflow** — production day end-to-end.
- **Packing verify** — print label, scan, packing flow completes.
- **Route delivery** — build a route and dispatch.
- **Storefront preorder** — preorder with pickup windows.
- **Catering quote** — convert quote to confirmed event.
- **Meal plan draft order** — generate from a plan.
- **Report export** — CSV export from Reporting Center.

Each scenario links directly to the relevant module so the owner can
walk the scenario without leaving the page.

Status is tracked alongside the checklist (items in the `UAT` phase
move TODO → IN_PROGRESS → DONE). The page lists scenarios; the
checklist row is where statuses move.
