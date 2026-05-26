# Safe apply wizard

Route: `/dashboard/templates/[templateKey]/apply`

The wizard is a 4-step client form on top of an SSR preview.

1. **Choose sections.** Every section is selected by default. Untick
   anything you don't want this apply to touch.
2. **Preview impact.** A read-only list of every change, coloured
   by action and including any conflicts.
3. **Resolve conflicts.** Only shown when `counts.conflicts > 0`.
   Requires an explicit "I understand" + optional "Allow
   overwriting the existing business mode" tick.
4. **Confirm.** Final "I want to apply" checkbox + Apply button.

After the action runs, the wizard swaps to a result panel with the
application id, errors (if any), and next-action buttons to Today,
Playbooks, Tasks, and Applied history.

## Backend behaviour

`applyTemplateAction` (in `actions/templates.ts`) calls
`applyTemplate(scope, input)` which:

- Creates a `TemplateApplication` row with `status = APPLYING`.
- Rebuilds the preview server-side and refuses to proceed if
  `counts.conflicts > 0` and `acknowledgeConflicts` is false.
- Walks each requested section in a fixed order and accumulates a
  `TemplateRollbackPlan`.
- Stamps `status = APPLIED` (no errors) or `PARTIALLY_APPLIED`
  (one or more sections failed).
- Persists the `resultJson` and `rollbackJson` on the row.

`TemplateApplicationEvent` rows capture `apply_started` and
`apply_finished` for the audit log.
