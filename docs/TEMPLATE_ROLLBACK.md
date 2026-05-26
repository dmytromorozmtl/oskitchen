# Template rollback

Every successful `applyTemplate` call writes a
`TemplateRollbackPlan` to `template_applications.rollback_json`.
The shape is in `lib/templates/template-apply.ts`:

```ts
type TemplateRollbackPlan = {
  appliedSections: TemplateSectionKey[];
  pinnedModuleKeys: string[];
  generatedTaskIds: string[];
  previousBusinessMode: string | null;
  changedBusinessMode: boolean;
  seededPlaybookIds: string[];
};
```

## Reversal rules

| Item | Action |
|------|--------|
| Module pins created | `kitchenModulePreference.update({ pinned: false })` |
| Setup tasks (`status = OPEN`) | `kitchenTask.delete(...)` |
| Setup tasks (other statuses) | Kept; logged in the errors array |
| Business mode change | Set back to `previousBusinessMode` |
| Playbooks seeded by this apply | `playbook.update({ active: false, status: ARCHIVED })` (never deleted — runs may reference them) |

## Availability surfaces

`rollbackAvailability(plan)`:

- `full` — at least one rollback action is available.
- `partial` — plan exists but everything's already manual.
- `none` — no plan stored (preview-only or pre-template-system row).

The Applied history page renders a `<RollbackButton />` per row
that calls `rollbackTemplateAction({ applicationId })`.

## Audit

A `rolled_back` `TemplateApplicationEvent` row is written with the
reverted-count and any per-item errors.
