# Recurring playbooks

Each `Playbook` has a `triggerType` and an optional
`recurrenceRule`. The system never auto-creates runs — it only
*recommends* when a playbook should run next.

- `MANUAL` — owner decides.
- `DAILY`, `WEEKLY` — Today board recommends daily/weekly.
- `EVENT_DATE` — triggered by external operational dates
  (catering quote, calendar event, etc.).
- `MENU_CUTOFF` — bakery / meal-prep preorder cutoffs.
- `PRODUCTION_DATE`, `ORDER_VOLUME`, `INCIDENT` — informational.

`/dashboard/playbooks/schedule` lists every active playbook with a
non-`MANUAL` trigger so owners can review which SOPs the system
will keep surfacing.

The Today strip (`PlaybookTodayStrip`) calls
`recommendedPlaybooksForMode` to pick *one* top recommended
playbook to highlight at the top of `/dashboard/today`.
