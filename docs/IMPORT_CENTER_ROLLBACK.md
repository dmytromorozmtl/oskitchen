# Import Center rollback

Rollback safely undoes records created by a specific import job.

## Capture (at commit time)

`commitImportJob` collects every row it inserts into a
`createdEntities[]` array:

```ts
type Created = { entity: "kitchenCustomer" | "ingredient" | "product"
                       | "productionTask" | "staffMember";
                 id: string };
```

These are wrapped into a `RollbackPlan` and stored as
`import_jobs.rollback_json`:

```json
{
  "type": "INGREDIENTS",
  "createdEntities": [
    { "entity": "ingredient", "id": "..." },
    { "entity": "ingredient", "id": "..." }
  ],
  "capturedAt": "2026-05-11T19:42:00.000Z"
}
```

## Availability

`rollbackAvailability(plan, alreadyRolledBack)` returns
`{ available: true, count }` only when:

- the job has been committed (`status === IMPORTED`),
- `rollback_json` exists,
- the plan has at least one created entity,
- `rolled_back_at` is null.

When the user opens the job detail page the result is shown as either
a working rollback panel or a “Rollback unavailable” card with the
reason.

## User action

```
POST /dashboard/import-center  (rollbackImportJobAction)
  jobId, confirm=true, reason
```

The reason is required (3–800 chars). The action calls
`rollbackImportJob` which:

1. Loads the job and verifies its current state.
2. Iterates the rollback plan and runs the appropriate Prisma delete
   for each entity kind.
3. Skips entities the database refuses to delete (FK constraints
   from downstream activity — orders, demand runs, etc.) and records
   the failure in the `resultJson.rollbackNotes` array.
4. Writes a new `ImportRollback` row with
   `recordsRolledBack = removed` and status
   `COMPLETED` (all deleted) or `FAILED` (partial).
5. Updates `import_jobs.rolled_back_at = now()`.

## Allowed entity deletes

| Entity            | Where                                |
|-------------------|--------------------------------------|
| `kitchenCustomer` | `prisma.kitchenCustomer.delete`      |
| `staffMember`     | `prisma.staffMember.delete`          |
| `ingredient`      | `prisma.ingredient.delete`           |
| `product`         | `prisma.product.delete`              |
| `productionTask`  | `prisma.productionTask.delete`      |

Unrecognised entity kinds are skipped and logged in
`rollbackNotes[]`.

## What rollback never does

- It never deletes rows that were updated (not inserted) by the job.
- It never deletes rows the database refuses to delete (FK-protected
  by downstream activity). Those are reported in `rollbackNotes`.
- It never runs without an explicit user reason.
- It cannot be undone — once a job is rolled back its status is
  permanent.
