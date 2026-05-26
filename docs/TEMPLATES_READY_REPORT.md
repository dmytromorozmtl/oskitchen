# Workspace Templates — Ready report

## What changed

`/dashboard/templates` is no longer a static grid of 7 cards. It is
a full Workspace Template Center with:

- A persistent registry (`workspace_templates`).
- An audited apply lifecycle (`template_applications` +
  `template_application_events`).
- A preview engine that returns a typed change list with conflict
  flags.
- A 4-step safe apply wizard with explicit confirmation, conflict
  acknowledgement, and per-section selection.
- Per-application rollback (un-pin modules, delete open setup
  tasks, restore prior business mode, archive seeded playbooks).
- 11 routes under `/dashboard/templates`.
- KPI strip with templates available, applied count, pending
  previews, and last applied.
- Permission gating (`templates.preview`, `templates.apply`,
  `templates.rollback`) layered on top of the existing
  `requireSessionUser`.

The legacy `QUICK_START_TEMPLATES` constants at
`lib/business-templates.ts` are kept intact so landing pages and
Demo Hub continue to work unchanged.

## File map

### Library
- `lib/templates/template-types.ts`
- `lib/templates/template-registry.ts`
- `lib/templates/template-preview.ts`
- `lib/templates/template-apply.ts`
- `lib/templates/template-rollback.ts`
- `lib/templates/template-permissions.ts`

### Service
- `services/templates/template-service.ts`

### Server actions
- `actions/templates.ts` — `previewTemplateAction`,
  `applyTemplateAction`, `rollbackTemplateAction`.

### UI (11 routes)
- `/dashboard/templates` (Recommended)
- `/dashboard/templates/all`
- `/dashboard/templates/starters`
- `/dashboard/templates/module-packs`
- `/dashboard/templates/playbooks`
- `/dashboard/templates/storefront`
- `/dashboard/templates/imports`
- `/dashboard/templates/history`
- `/dashboard/templates/[templateKey]`
- `/dashboard/templates/[templateKey]/apply`
- `layout.tsx` with `TemplatesSubnav`

### Components
- `components/dashboard/templates/templates-subnav.tsx`
- `components/dashboard/templates/template-kpis.tsx`
- `components/dashboard/templates/template-card.tsx`
- `components/dashboard/templates/apply-wizard.tsx`
- `components/dashboard/templates/rollback-button.tsx`

### Database
- New migration: `prisma/migrations/20260518000000_workspace_templates`.
- Tables: `workspace_templates`, `template_applications`,
  `template_application_events`.
- Enums: `TemplateCategory`, `TemplateApplicationStatus`,
  `TemplateApplyMode`.

## Safety guarantees

1. Preview-first — nothing writes until the user confirms.
2. `KitchenSettings.businessType` is only changed if either the
   field was null OR `overwriteBusinessMode = true`.
3. Templates do not delete or modify orders, customers, invoices,
   menus, or production rows.
4. Existing module pins are never un-pinned by an apply.
5. Existing playbooks are never deleted; seeded playbooks are
   reused (FK by slug).
6. Rollback never deletes completed tasks; conflicts are logged
   instead.
7. Super-admin (`workspace.moroz@gmail.com`) bypasses role checks
   but is still bound by the safety rules above.

## Build & types

- `npm run typecheck` — green.
- `npm run build` — green; all 11 new routes appear in the
  Next.js manifest.

## Remaining limitations

- **No standalone module packs / report packs / storefront
  templates yet** — the tabs exist with empty states that link to
  the relevant module.
- **No conflict-on-pinned-modules.** We only flag the
  business-mode conflict today; module pinning is purely
  additive so no conflict is reported.
- **No dry-run for sample data writes.** Templates intentionally
  delegate sample/production data to Demo Hub and Import Center.
- **No public-API "describe" endpoint** for SDK consumers.

## Next recommendations

1. Add a `module-packs` first-class registry so standalone packs
   (e.g. "Costing + Margins") can be applied without a full
   starter.
2. Wire the apply success panel into the existing Implementation
   / Go-live tracker so progress shows up there.
3. Surface "Templates not yet applied" on the Today board as a
   light nudge for fresh workspaces.
