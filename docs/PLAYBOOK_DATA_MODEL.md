# Playbook data model

Prisma models added in migration `20260517000000_playbooks`:

## `Playbook`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| userId | UUID? | Workspace owner (null for org-wide future use) |
| title | varchar(255) | |
| slug | varchar(120)? | Used to identify system templates |
| description | text | |
| type | `PlaybookType` enum | `DAILY_OPERATIONS`, `WEEKLY_CYCLE`, etc. |
| businessModesJson | jsonb? | List of `BusinessType` codes |
| recommendedModulesJson | jsonb? | `PlaybookModuleKey[]` |
| defaultRolesJson | jsonb? | `string[]` |
| triggerType | `PlaybookTriggerType` | `MANUAL` by default |
| recurrenceRule | varchar(255)? | RFC-5545-ish (`FREQ=DAILY`, …) |
| active | bool | Soft-deactivate without delete |
| systemTemplate | bool | Read-only baked-in template |
| status | `PlaybookStatus` | Lifecycle |
| createdAt / updatedAt | timestamp | |

Indexes: `(userId, active)`, `(type)`, `(systemTemplate)`

## `PlaybookStep`

Ordered children of a `Playbook`. Includes `recommendedRole`,
`moduleKey`, `actionRoute`, `estimatedMinutes`, `required`,
`checklistJson`, `taskTemplateJson`, and
`dependencyStepIdsJson`. Unique by `(playbookId, sortOrder)`.

## `PlaybookRun`

A single execution of a playbook. Includes `brandId`, `locationId`,
`status`, `businessMode`, `startedBy`, `startedAt`, `completedAt`,
`dueAt`, `notes`, and `tasksGenerated`.

Indexes: `(userId, status)`, `(userId, dueAt)`, `(playbookId)`,
`(sourceType, sourceId)`.

## `PlaybookRunStep`

Per-step state for a run. Unique by `(runId, stepId)`. Has
`assignedToId`, `assignedRole`, `taskId` (FK to `KitchenTask`),
`startedAt`, `completedAt`, `blockedReason`, `notes`.

## `PlaybookEvent`

Append-only audit row. `eventType` is free-form: `run_started`,
`step_completed`, `step_blocked`, `tasks_generated`,
`run_completed`, `run_cancelled`, `playbook_created`,
`playbook_archived`, …
