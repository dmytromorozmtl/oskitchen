# Playbook permissions

Capabilities (`PlaybookCapability` in `lib/playbooks/playbook-types.ts`):

| Capability | Description | Default roles |
|------------|-------------|---------------|
| `playbooks.view` | Open `/dashboard/playbooks` | manager, admin, accountant, kitchen_lead, kitchen, packer, packing, driver, dispatcher, sales, viewer |
| `playbooks.run` | Start a run | manager, admin, kitchen_lead, sales |
| `playbooks.complete_step` | Move a step to COMPLETED / SKIPPED / IN_PROGRESS | manager, admin, kitchen_lead, kitchen, packer, packing, driver, dispatcher, sales |
| `playbooks.block_step` | Mark a step blocked | same as complete_step |
| `playbooks.generate_tasks` | Create kitchen tasks for the run | manager, admin, kitchen_lead |
| `playbooks.create_custom` | Use the custom builder | manager, admin |
| `playbooks.edit` | Edit a playbook | manager, admin |
| `playbooks.archive` | Archive a custom playbook | manager, admin |
| `playbooks.read.reports` | Open the reports tab | manager, admin, accountant |

Owners bypass all checks. The platform super-admin
(`workspace.moroz@gmail.com`) bypasses all checks via
`isSuperAdminPlaybooks`.

Permission checks live in `lib/playbooks/playbook-permissions.ts`
and are invoked by every server action before mutating state.
