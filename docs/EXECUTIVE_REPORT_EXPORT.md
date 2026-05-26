# Executive report export

Route: `/dashboard/executive/report`.

The page is intentionally print-friendly:

- The subnav and action buttons carry `print:hidden`.
- Cards stack vertically.
- Drilldown links are hidden when printed.

A user can hit `Cmd/Ctrl-P` (or use the **Print** button) to save the
page as a PDF using the browser's native dialog. **Server-side PDF
generation is intentionally not enabled** — we do not want to fake an
unavailable capability.

## CSV download

The download button hits
`/api/export/report?key=executive_weekly_summary&<filters>`, which is
the same endpoint introduced by the Reports center. It records an
`ExportJob` row for audit.

## Permissions

The page itself requires `executive.export`, which is granted to
owners, managers, admins, accountants, and the superadmin. Users
without that permission see a permission-denied card.
