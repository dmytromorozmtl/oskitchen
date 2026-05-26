# Roles & permissions

## System roles

Defined in `lib/staff/staff-roles.ts`. Each role maps to a per-area
permission (`none | view | edit | admin`) across 13 areas:

`orders, production, kitchen_screen, packing, routes, tasks, crm, costing,
analytics, billing, settings, staff, training`

| Role | Highlights |
|------|------------|
| Owner / Admin | Admin on everything |
| Manager | Edit on operations + view on financial |
| Kitchen lead | Edit production / kitchen screen / tasks |
| Prep cook | View production / kitchen screen; edit own tasks |
| Line cook | Same as Prep cook |
| Packer | Edit packing + tasks |
| Driver | Edit routes + tasks |
| Customer service | Edit orders + CRM |
| Catering coordinator | Edit orders / production / packing / routes / CRM |
| Purchasing | Edit costing |
| Inventory | Edit costing |
| Accounting | Edit billing; view costing/analytics |
| Marketing | Edit CRM; view analytics |
| Viewer | Read-only across operations |

## Custom roles

Workspaces can add `StaffRole` rows via `/dashboard/staff/roles`. A custom
role has a free-form `permissionsJson` shape and can be linked from a
`StaffMember.customRoleId`.

## Capability checks

`lib/staff/staff-permissions.ts` exposes 13 capabilities:

```
staff.view, staff.view.pii, staff.create, staff.update, staff.archive,
staff.assign.role, staff.assign.location, staff.assign.training,
staff.role.create, staff.role.update,
staff.shift.create, staff.shift.update,
staff.cert.write, staff.audit.view
```

Every Server Action calls `gate(capability)`. The fallback is denial.
`workspace.moroz@gmail.com` bypasses every gate.

## Server enforcement

- Capabilities are checked in `actions/staff.ts`.
- PII (email, phone, notes, emergency contact) is filtered via
  `visibleStaffShape` and via inline conditional rendering on the roster
  page.
- The UI hides edit forms for actors without `staff.update`.
