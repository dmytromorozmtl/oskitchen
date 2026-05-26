# Template preview engine

`lib/templates/template-preview.ts` exports a pure function:

```ts
buildTemplatePreview(template, context, sections) → TemplatePreview
```

It does no DB I/O. The caller passes a workspace context (current
business mode, pinned module keys, existing playbook slugs) and the
selected sections; the function returns a list of `changes`, plus
aggregate `counts` for create / update / skip / conflicts and a
`rollback.available` field.

## Change `action` semantics

- `create` — a new row will be inserted (module pin, task, etc.).
- `update` — an existing row will be modified (business mode change).
- `skip` — already present / no-op for this workspace.
- `noop` — section requested, but template declares nothing for it.

## Conflict surfaces

- **Business mode mismatch** — current `KitchenSettings.businessType`
  is non-null and different from the template's primary mode.
  The change is emitted as `update` with `conflict` set, and apply
  will refuse without both `acknowledgeConflicts = true` and
  `overwriteBusinessMode = true`.

The preview engine is invoked twice in the apply flow:
1. By `/dashboard/templates/[templateKey]/apply` (SSR) to render the
   wizard.
2. Inside `applyTemplate(...)` immediately before writing — so the
   apply double-checks rather than trusting client-submitted state.
