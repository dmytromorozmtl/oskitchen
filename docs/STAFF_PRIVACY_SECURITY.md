# Staff privacy & security

## Scoping

Every Prisma query in `services/staff/*` and `actions/staff.ts` filters
by `userId` (workspace id). New tables include workspace indexes for
common access paths.

## PII

These fields are gated behind the `staff.view.pii` capability:

- `email`
- `phone`
- `notes`
- `emergencyContactJson`

The helper `visibleStaffShape` in `lib/staff/staff-permissions.ts` returns
a stripped representation for actors without PII access; the roster page
also conditionally renders contact rows.

The `permissionsJson` column is only returned to actors with
`staff.audit.view`.

## Capabilities

```
staff.view              roster (no PII)
staff.view.pii          email / phone / notes / emergency contact
staff.create            add teammate
staff.update            edit teammate
staff.archive           soft-archive
staff.assign.role       change role type / custom role
staff.assign.location   change brand / location
staff.assign.training   issue training assignment (read-only for now)
staff.role.create       custom roles
staff.role.update       deactivate roles
staff.shift.create      create shifts
staff.shift.update      transition shifts
staff.cert.write        add / revoke staff certifications
staff.audit.view        see permissionsJson and broader events
```

## Superadmin

`workspace.moroz@gmail.com` is granted every capability via
`isSuperAdminEmail` (re-exported from `lib/platform-owner.ts`).

## SSO

Not implemented. The schema reserves `linked_user_id` (nullable FK to
`UserProfile`) for the future SSO flow. The current Staff creation paths
**never** populate this field, and the UI is explicit that SSO logins
remain on the roadmap.

## Audit

All mutations go through services that record `StaffEvent` rows.
`actions/staff-member.ts` also writes a best-effort `STAFF_CREATED`
event so the legacy quick-add form is audited.
