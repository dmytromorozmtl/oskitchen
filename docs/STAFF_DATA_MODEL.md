# Staff data model

All changes are **additive**. The existing `staff_members` rows keep
working: the `role` string, `active` boolean, and per-workspace `userId`
scope are untouched.

## Enums (new)

| Enum | Members |
|------|---------|
| `StaffRoleType` | OWNER, MANAGER, KITCHEN_LEAD, PREP_COOK, LINE_COOK, PACKER, DRIVER, CUSTOMER_SERVICE, CATERING_COORDINATOR, PURCHASING, INVENTORY, ACCOUNTING, MARKETING, VIEWER, CUSTOM |
| `StaffStatus` | ACTIVE, INVITED, TRAINING, PAUSED, INACTIVE, ARCHIVED |
| `StaffEmploymentType` | FULL_TIME, PART_TIME, CONTRACTOR, TEMPORARY, SEASONAL, VOLUNTEER, CUSTOM |
| `StaffShiftStatus` | SCHEDULED, CHECKED_IN, COMPLETED, NO_SHOW, CANCELLED |
| `StaffCertificationStatus` | PENDING, ACTIVE, EXPIRED, REVOKED |

## `StaffMember` (extended)

New optional columns; defaults are chosen so existing rows remain valid:

```
linked_user_id         UUID            // Reserved for SSO; null today
phone                  VARCHAR(64)
role_type              StaffRoleType   default CUSTOM
status                 StaffStatus     default ACTIVE
employment_type        StaffEmploymentType default CUSTOM
brand_id               UUID            -> brands.id
location_id            UUID            -> locations.id
custom_role_id         UUID            -> staff_roles.id
departments_json       JSONB
permissions_json       JSONB
availability_json      JSONB           // cached summary
emergency_contact_json JSONB           // gated by PII capability
notes                  TEXT
invited_at             TIMESTAMP
archived_at            TIMESTAMP
last_active_at         TIMESTAMP
```

Indexes added: `(userId, status)`, `(userId, role_type)`, `(userId, location_id)`,
`(userId, brand_id)`, `(userId, linked_user_id)`, `(userId, email)`.

## `StaffRole`

Custom roles per workspace. System roles are defined in
`lib/staff/staff-roles.ts` and **not** persisted.

```
id, user_id, key UNIQUE per workspace, label, description, permissions_json,
system_role, active, created_at, updated_at
```

## `StaffAvailability`

Weekly availability windows.

```
id, user_id, staff_member_id, day_of_week (0–6),
start_time VARCHAR(10), end_time VARCHAR(10), available, notes
```

## `StaffShift`

```
id, user_id, staff_member_id, location_id?, brand_id?,
role StaffRoleType, role_label?, shift_date DATE,
start_time, end_time, status StaffShiftStatus,
notes, checked_in_at?, completed_at?
```

## `StaffCertification`

Separate from `TrainingCertification`; this table records HR-style
certifications (food safety, allergen, alcohol service, etc.).

```
id, user_id, staff_member_id, certification_type, status,
issued_at?, expires_at?, source_training_id?, notes
```

`status` is derived from `expires_at` on insert via
`deriveStatusFromExpiry` so an in-the-past expiry becomes `EXPIRED` even
if the input said `ACTIVE`.

## `StaffEvent`

Audit trail.

```
id, user_id, staff_member_id?, event_type VARCHAR(80),
performed_by_id?, summary, metadata_json
```

Indexes: `(userId, created_at)`, `(userId, staff_member_id)`,
`(userId, event_type)`.
