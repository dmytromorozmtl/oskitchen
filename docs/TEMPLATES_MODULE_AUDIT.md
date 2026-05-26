# Quick-start Templates module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/templates`, `lib/business-templates.ts`, and
relationships to Demo Hub, Import Center, Onboarding, Modules,
Playbooks, and Business Modes.

## TL;DR

`/dashboard/templates` today is a 40-line static page that maps each
of 7 `QUICK_START_TEMPLATES` entries to a demo vertical slug. The
page is read-only and writes nothing. It is also wholly disconnected
from the rest of the workspace: applying a "Restaurant starter" today
requires the user to manually:

1. Switch business mode in Settings,
2. Pin the right sidebar modules,
3. Visit Demo Hub or Import Center to load data,
4. Open the Playbooks page to find the right SOP.

This project keeps the page safe (preview-first, no silent writes)
while making it a real, guided **Workspace Template Center**.

## Findings

| #  | Area | Current state | Why it is limiting | Recommended fix | Pri |
|----|------|---------------|--------------------|-----------------|-----|
| 1  | Persistence | TS constants in `lib/business-templates.ts` | Can't track which template was applied; no rollback | Add `WorkspaceTemplate` + `TemplateApplication` + `TemplateApplicationEvent` tables (read mostly from TS registry, write to DB for applications) | P0 |
| 2  | Preview | None — cards are inert | User can't see what a template will do | Build a preview engine that returns a plan (modules to enable, settings to change, playbooks to seed, tasks to create, conflicts) | P0 |
| 3  | Apply | None — cards are inert | The page is purely cosmetic | Add a 4-step safe apply wizard: choose sections → preview → confirm → results | P0 |
| 4  | Data safety | n/a | If we add apply with bad defaults, we could overwrite live data | Default to preview-only; apply only after explicit confirmation; protected fields (`KitchenSettings.businessType`) require an overwrite flag | P0 |
| 5  | Rollback | n/a | Once applied, owner has no escape hatch | Record `rollbackJson` per apply (the rows we created, the settings we changed) so we can undo safely | P1 |
| 6  | Recommended template | None | Owners don't know which to pick | Use `KitchenSettings.businessType` (existing) to recommend a starter | P1 |
| 7  | Module activation | Manual | Templates must hand-tune `KitchenModulePreference` | Each template names its module pins and pin updates flow through the existing `KitchenModulePreference` (idempotent upsert) | P1 |
| 8  | Playbook seeding | Manual | Templates don't link to the new Playbooks center | Apply calls `ensureSystemPlaybooks(scope)` so the right SOPs land per business mode | P1 |
| 9  | Setup tasks | None | After apply, user has no checklist | Create `KitchenTask` rows tagged with `sourceType = "IMPLEMENTATION"` for the recommended next steps | P1 |
| 10 | Conflicts | Not detected | Could silently change business mode of an established workspace | Preview engine returns `conflicts: []`; apply refuses without `acknowledgeConflicts: true` | P0 |
| 11 | Sample data | Delegated to Demo Hub via slug | Acceptable today; future: optional "minimal sample" path | Keep Demo Hub as the heavy data path; templates only create *configuration* and an empty taxonomy when the user opts in | P2 |
| 12 | Permissions | `requireSessionUser` only | Anyone with a session can land on the page | Owners + admins apply; managers preview; others view-only | P0 |
| 13 | History | None | Cannot tell when / what / who applied | Persist every apply as a `TemplateApplication` row, log each step as `TemplateApplicationEvent` | P1 |
| 14 | Demo Hub / Import Center | Plain links | OK today; templates should *reference* them, not absorb them | Keep links; the wizard's last step recommends Demo Hub for sample data and Import Center for production data | P2 |
| 15 | Onboarding | Not linked | Templates and onboarding are parallel surfaces | After apply, surface the recommended Playbook + next setup task + Go-live link | P2 |
| 16 | Empty states | Static cards always show | If registry is empty page is blank | Explicit "No templates available — reload templates" empty state with a CTA | P3 |
| 17 | Business-mode quiz | None | Brand-new workspaces are guessing | Stub a quiz CTA — recommended path uses existing business-mode picker | P3 |

## Priority legend

- **P0** — Data safety / correctness blockers.
- **P1** — High onboarding value.
- **P2** — UX polish.
- **P3** — Future.

## Safety contract (carries into every later phase)

1. Templates **never** write to `KitchenSettings.businessType` unless
   the field is currently null OR the user passes
   `overwriteBusinessMode: true`.
2. Templates **never** disable existing modules. They can pin new
   modules and recommend default visibility, but a module currently
   `enabled = false` stays disabled unless the user explicitly
   selects "Reset module preferences" in the wizard.
3. Templates **never** create orders, customers, or invoices. That
   path lives in Demo Hub.
4. Every apply creates a `TemplateApplication` row with a
   `rollbackJson` payload; rollback restores prior settings and
   deletes rows it created.
5. Super-admin (`workspace.moroz@gmail.com`) bypasses checks but is
   still bound by safety contracts 1–4.
