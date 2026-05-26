# Template permissions

Capabilities (`TemplateCapability`):

| Capability | Description | Default roles |
|------------|-------------|---------------|
| `templates.view` | Open `/dashboard/templates` | All roles (manager, admin, accountant, kitchen, packer, driver, dispatcher, sales, viewer) |
| `templates.preview` | Generate a preview (writes a `PREVIEWED` application row) | manager, admin |
| `templates.apply` | Apply a template | admin |
| `templates.rollback` | Roll back an applied template | admin |
| `templates.history` | Read the Applied history tab | manager, admin, accountant |

Owners bypass all checks. The platform super-admin
(`workspace.moroz@gmail.com`) bypasses via `isSuperAdminTemplates`.

The Apply server action and the Apply page both check
`canUseTemplates(scope, "templates.apply")`. A read-only manager
visiting the Apply page will see an explicit "Not authorised" card.
