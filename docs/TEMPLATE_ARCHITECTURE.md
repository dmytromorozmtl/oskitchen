# Workspace Templates — Architecture

## Layers

| Layer | File | Responsibility |
|-------|------|----------------|
| Types | `lib/templates/template-types.ts` | Capabilities, sections, preview / apply shapes |
| Registry | `lib/templates/template-registry.ts` | The 7 system starter seeds |
| Preview | `lib/templates/template-preview.ts` | Pure preview builder |
| Apply helpers | `lib/templates/template-apply.ts` | Rollback plan shape + summaries |
| Rollback parser | `lib/templates/template-rollback.ts` | Parses stored rollback payloads |
| Permissions | `lib/templates/template-permissions.ts` | `canUseTemplates(scope, cap)` |
| Service | `services/templates/template-service.ts` | Upsert registry, preview/apply/rollback, KPIs, history |
| Actions | `actions/templates.ts` | Zod-validated server actions |
| UI (RSC) | `app/dashboard/templates/**` | 11 routes |
| UI (client) | `components/dashboard/templates/**` | Subnav, wizard, rollback button, cards, KPIs |

## Lifecycle

```
WorkspaceTemplate (registry seed)
   │
   ├──▶ TemplateApplication { status: PREVIEWED } ── preview only (no writes outside this row)
   │
   └──▶ TemplateApplication { status: APPLYING → APPLIED | PARTIALLY_APPLIED }
              │
              ├──▶ KitchenSettings.businessType (guarded by `overwriteBusinessMode`)
              ├──▶ KitchenModulePreference (pinning, never disables existing modules)
              ├──▶ ensureSystemPlaybooks(scope) (idempotent)
              ├──▶ KitchenTask rows tagged `sourceType=IMPLEMENTATION`
              └──▶ rollback_json: TemplateRollbackPlan
                       │
                       └──▶ rollbackApplication() → ROLLED_BACK
```

## Safety contract

1. **Preview-first.** Every template route shows changes before any
   DB write. Even the preview action records its own
   `TemplateApplication` so we have an audit trail of *intent*.
2. **No silent overwrite.** Business-mode changes require
   `overwriteBusinessMode = true`; conflicts require
   `acknowledgeConflicts = true`.
3. **No data destruction.** Templates do not delete or modify
   orders, customers, invoices, menus, or production rows.
4. **Idempotent.** Re-applying the same template skips already-pinned
   modules and already-seeded playbooks.
5. **Rollback.** Module pins → un-pinned; setup tasks → deleted
   (only if `status = OPEN`); business mode → restored to prior
   value; seeded playbooks → set `active = false` (never deleted
   because runs may reference them).
