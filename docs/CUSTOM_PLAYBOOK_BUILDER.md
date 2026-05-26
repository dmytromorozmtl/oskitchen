# Custom playbook builder

Route: `/dashboard/playbooks/new`

The builder (`components/dashboard/playbooks/custom-playbook-form.tsx`)
captures:

- title, description
- type (e.g. `PRODUCTION_DAY`)
- trigger (e.g. `MANUAL`)
- business modes (comma-separated)
- a list of steps with title, description, role, module key,
  action route, estimated minutes, required flag

Submission goes through `createCustomPlaybookAction`, which:

1. Authenticates and checks `playbooks.create_custom` capability.
2. Validates with zod.
3. Calls `createPlaybookFromSeed` with `systemTemplate = false`.
4. Returns the new playbook id so the form can redirect to its detail page.

Custom playbooks behave the same as system templates: they can be
run, generate tasks, and appear in the schedule/active views.
