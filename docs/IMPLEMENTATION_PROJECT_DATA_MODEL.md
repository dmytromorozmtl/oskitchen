# Implementation project data model

## Migration

`prisma/migrations/20260521000000_implementation_center/migration.sql`

Adds the following enums / tables / columns. **Additive** — no
existing data is mutated.

### Enum extensions

`ImplementationStatus` is extended with:

- `SETUP`
- `MIGRATION`
- `TRAINING`
- `TESTING`
- `READY_FOR_GO_LIVE`
- `LIVE`
- `POST_LAUNCH`
- `CANCELLED`

(Pre-existing values such as `DISCOVERY`, `DATA_IMPORT`,
`CONFIGURATION`, `STAFF_TRAINING`, `TEST_RUN`, `GO_LIVE`, `COMPLETED`,
`BLOCKED` remain valid for backward compatibility.)

### New enums

- `ImplementationPhaseKey` — phase lifecycle keys.
- `ImplementationPhaseStatus` — `NOT_STARTED / IN_PROGRESS / BLOCKED / COMPLETED / SKIPPED`.
- `ImplementationChecklistStatus` — `TODO / IN_PROGRESS / BLOCKED / DONE / SKIPPED`.
- `ImplementationChecklistPriority` — `LOW / MEDIUM / HIGH / CRITICAL`.
- `GoLiveReadinessStatus` — `PASS / WARN / FAIL / NOT_CHECKED`.

### `implementation_projects` (extended)

New columns:

| column                    | type   | notes                                  |
|---------------------------|--------|----------------------------------------|
| `readiness_score`         | int    | 0–100, last computed score             |
| `readiness_snapshot_json` | jsonb  | Last `ReadinessSnapshot`               |
| `created_by`              | uuid   | `UserProfile.id` that created the row  |

New indexes: `target_go_live_date`, `assigned_owner`.

### `implementation_phases`

| column        | type                       |
|---------------|----------------------------|
| `id`          | uuid pk                    |
| `project_id`  | uuid (cascade)             |
| `key`         | `ImplementationPhaseKey`   |
| `name`        | varchar(120)               |
| `status`      | `ImplementationPhaseStatus`|
| `sort_order`  | int                        |
| `due_date`    | date                       |
| `completed_at`| timestamp                  |
| `notes`       | text                       |

Unique: `(project_id, key)`.

### `implementation_checklist_items`

| column                | type                              |
|-----------------------|-----------------------------------|
| `id`                  | uuid pk                           |
| `project_id`          | uuid (cascade)                    |
| `phase_id`            | uuid (set null)                   |
| `title`               | varchar(255)                      |
| `description`         | text                              |
| `status`              | `ImplementationChecklistStatus`   |
| `priority`            | `ImplementationChecklistPriority` |
| `module_key`          | varchar(80)                       |
| `action_route`        | varchar(512)                      |
| `assigned_to_id`      | uuid                              |
| `due_at`              | timestamp                         |
| `task_id`             | uuid (Kitchen task fk)            |
| `required_for_go_live`| bool                              |
| `blocker_reason`      | text                              |
| `completed_at`        | timestamp                         |
| `metadata_json`       | jsonb                             |

### `implementation_events`

| column         | type           |
|----------------|----------------|
| `id`           | uuid pk        |
| `project_id`   | uuid (cascade) |
| `event_type`   | varchar(80)    |
| `performed_by` | varchar(255)   |
| `summary`      | varchar(500)   |
| `metadata_json`| jsonb          |
| `created_at`   | timestamp      |

### `go_live_readiness_checks`

| column        | type                    |
|---------------|-------------------------|
| `id`          | uuid pk                 |
| `project_id`  | uuid (cascade)          |
| `category`    | varchar(80)             |
| `title`       | varchar(255)            |
| `status`      | `GoLiveReadinessStatus` |
| `required`    | bool                    |
| `result_json` | jsonb                   |
| `action_route`| varchar(512)            |
| `explanation` | text                    |
| `checked_at`  | timestamp               |

Unique: `(project_id, category, title)`.

## Existing models reused

- `ImplementationRisk` — surfaced in UI; no schema change.
- `ImplementationTask` (legacy) — left intact for backward compat with
  the original form.
- `KitchenTask` (`sourceType = IMPLEMENTATION`) — populated by the
  preview-first task generator.
- `IntegrationConnection` — read by the readiness engine.
- `KitchenSettings`, `Brand`, `Location`, `Menu`, `Product`,
  `StaffMember`, `ImportJob`, `SavedReport` — read by the readiness
  engine; never modified.
