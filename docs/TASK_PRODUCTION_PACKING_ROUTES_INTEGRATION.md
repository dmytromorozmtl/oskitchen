# Task integrations: Production / Packing / Routes / Purchasing / Sales Channels

The Operations Task Center exposes one public hook for every other module:

```ts
// actions/kitchen-task.ts
export async function createIntegrationFollowUpTask(args: {
  title: string;
  source: KitchenTaskSource;
  sourceId?: string | null;
  sourceLabel?: string | null;
  priority?: KitchenTaskPriority;
  dueAt?: Date | null;
  description?: string | null;
}): Promise<{ ok: true; taskId: string } | { error: string }>;
```

It enforces session, calls the service layer, and revalidates every Tasks route.

## Routes — failed delivery → follow-up task (already wired)

`services/routes/route-service.ts → updateStopStatus()` runs this side-effect
after a stop is moved to `FAILED`:

```ts
await createFollowUpTask({
  userId: scope.userId,
  title: `Follow up failed delivery — ${stop.customerName} #${stop.sequence}`,
  source: "ROUTE",
  sourceId: routeId,
  sourceLabel: `Route stop ${stop.id}`,
  priority: "HIGH",
  description: notes ?? `Stop marked FAILED${reason ? ` (${reason})` : ""}. Contact customer and reschedule or refund.`,
  metadata: { stopId, failedReason, customerPhone },
});
```

Wrapped in try/catch — task creation failure does **not** roll back the route
update.

## Production / Packing — recommended call sites

Production:

```ts
// when a work item is blocked
await createIntegrationFollowUpTask({
  title: `Production blocker — ${batch.title}`,
  source: "PRODUCTION",
  sourceId: batch.id,
  priority: "URGENT",
});
```

Packing:

```ts
// when a missing item is reported
await createIntegrationFollowUpTask({
  title: `Missing pack item — order ${order.shortCode}`,
  source: "PACKING",
  sourceId: packingTask.id,
  priority: "HIGH",
});
```

## Purchasing — shortage → PO task

```ts
await createIntegrationFollowUpTask({
  title: `Purchasing shortage — ${ingredient.name}`,
  source: "PURCHASING",
  sourceId: ingredient.id,
  priority: "URGENT",
});
```

## Sales channels — failed import / mapping task

```ts
await createIntegrationFollowUpTask({
  title: `Channel sync failed — ${channel.name}`,
  source: "SALES_CHANNEL",
  sourceId: channel.id,
  priority: "HIGH",
});
```

## Discoverability

Every integration-generated task is filterable via:

- `/dashboard/tasks/list?source=ROUTE` (or `PRODUCTION`, `PACKING`, …)
- KPI tiles on `/dashboard/tasks` ("From playbooks" + similar)
- Task detail page surfaces "Open source" button that resolves via
  `hrefForTaskSource()`.
