# Templates QA checklist

## Smoke
- [ ] `/dashboard/templates` loads.
- [ ] `workspace_templates` rows exist after first load (7 system seeds).
- [ ] Switching the workspace's business mode changes the recommended starter.

## Detail
- [ ] `/dashboard/templates/[templateKey]` shows modules, playbooks,
      setup tasks, sample categories, and explicit warnings.

## Apply (safe path)
- [ ] On a fresh workspace, the wizard offers all sections with no
      conflicts.
- [ ] Toggling sections off prevents those changes from running.
- [ ] Clicking Apply creates a `TemplateApplication` row with
      `status = APPLIED`.
- [ ] Module pins appear in the sidebar.
- [ ] Playbooks are visible at `/dashboard/playbooks/templates`.
- [ ] Setup tasks appear at `/dashboard/tasks` with
      `sourceType = IMPLEMENTATION`.

## Apply (conflict path)
- [ ] If `KitchenSettings.businessType` is already set to a different
      value, the wizard surfaces a conflict.
- [ ] Apply is disabled until "I understand" is ticked.
- [ ] Business mode is *not* changed unless "Allow overwriting" is also ticked.

## Idempotency
- [ ] Re-applying the same template skips already-pinned modules and
      already-seeded playbooks (zero duplicates).

## Rollback
- [ ] Applied history shows the row with a Rollback button.
- [ ] Clicking Rollback un-pins the modules and deletes the open
      setup tasks.
- [ ] Tasks that have been completed are left alone (recorded as an error).

## Permissions
- [ ] As a manager (non-admin), the Apply page renders the
      "Not authorised" card.
- [ ] As superadmin (`workspace.moroz@gmail.com`) every action works.

## Build
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
