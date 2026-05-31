import {
  DEFAULT_B2B_COLLECTOR_SNOOZE_DAYS,
  resolveB2bCollectorSlaDays,
} from "@/lib/commercial/shopify-market-b2b-collector-queue";
import type { B2bArCollectionPriority } from "@/lib/integrations/shopify-b2b-ar-dashboard-metadata";
import type { B2bArCompanyRollup, B2bArDashboardRow } from "@/lib/integrations/shopify-b2b-ar-dashboard-metadata";

export type B2bArCollectorTaskStatus = "open" | "snoozed" | "done";

export type B2bArCollectorTask = {
  taskId: string;
  companyAccountId: string | null;
  companyKey: string;
  companyName: string;
  assignee: string | null;
  status: B2bArCollectorTaskStatus;
  dueAt: string | null;
  snoozedUntil: string | null;
  slaDays: number;
  maxDaysPastDue: number;
  openInvoices: number;
  openAmountCents: number;
  overdueInvoices: number;
  paymentDriftCount: number;
  priority: B2bArCollectionPriority;
  slaBreached: boolean;
  escalated: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  notes: string | null;
};

export type B2bArCollectorQueueSnapshot = {
  computedAt: string;
  tasks: B2bArCollectorTask[];
  openCount: number;
  snoozedCount: number;
  doneCount: number;
  slaBreachedCount: number;
  escalatedCount: number;
};

export type B2bArCollectorQueueStats = {
  syncRuns: number;
  tasksCreated: number;
  tasksCompleted: number;
  tasksSnoozed: number;
  digestsSent: number;
  skippedEmailOff: number;
  skippedRecentDigest: number;
  skippedNoTasks: number;
};

export function isB2bCollectorSlaBreached(maxDaysPastDue: number, slaDays: number): boolean {
  if (maxDaysPastDue <= 0) return false;
  return maxDaysPastDue > slaDays;
}

export function resolveB2bCollectorTaskPriority(input: {
  maxDaysPastDue: number;
  slaBreached: boolean;
  paymentDriftCount: number;
  bucket61Plus: number;
}): B2bArCollectionPriority {
  if (input.slaBreached || input.bucket61Plus > 0 || input.maxDaysPastDue >= 61) return "critical";
  if (input.paymentDriftCount > 0 || input.maxDaysPastDue >= 31) return "high";
  if (input.maxDaysPastDue >= 1) return "medium";
  return "low";
}

export function computeCollectorTaskDueAt(maxDaysPastDue: number, slaDays: number, nowMs: number): string {
  const daysUntilSla = Math.max(0, slaDays - maxDaysPastDue);
  return new Date(nowMs + daysUntilSla * 86400000).toISOString();
}

export function resolveEffectiveCollectorTaskStatus(
  task: Pick<B2bArCollectorTask, "status" | "snoozedUntil">,
  nowMs: number,
): B2bArCollectorTaskStatus {
  if (task.status === "snoozed" && task.snoozedUntil) {
    const untilMs = new Date(task.snoozedUntil).getTime();
    if (Number.isFinite(untilMs) && untilMs <= nowMs) return "open";
  }
  return task.status;
}

function summarizeCompanyRows(companyKey: string, rows: B2bArDashboardRow[]) {
  const companyRows = rows.filter(
    (row) => (row.companyAccountId ?? row.companyName ?? row.orderId) === companyKey,
  );
  return {
    paymentDriftCount: companyRows.filter((row) => row.paymentStatusDrift).length,
    bucket61Plus: companyRows.filter((row) => row.bucket === "days_61_plus").length,
  };
}

export function buildB2bCollectorTaskFromCompany(input: {
  company: B2bArCompanyRollup;
  rows: B2bArDashboardRow[];
  assignee: string | null;
  slaByCompany: Record<string, number> | null | undefined;
  defaultSlaDays: number | null | undefined;
  existing: B2bArCollectorTask | null;
  nowMs: number;
  nowIso: string;
}): B2bArCollectorTask | null {
  if (input.company.overdueInvoices <= 0) return null;

  const taskId = input.company.companyAccountId ?? input.company.companyKey;
  const slaDays = resolveB2bCollectorSlaDays(
    input.company.companyAccountId,
    input.slaByCompany,
    input.defaultSlaDays,
  );
  const rowStats = summarizeCompanyRows(input.company.companyKey, input.rows);
  const slaBreached = isB2bCollectorSlaBreached(input.company.maxDaysPastDue, slaDays);
  const priority = resolveB2bCollectorTaskPriority({
    maxDaysPastDue: input.company.maxDaysPastDue,
    slaBreached,
    paymentDriftCount: rowStats.paymentDriftCount,
    bucket61Plus: rowStats.bucket61Plus,
  });
  const escalated = slaBreached || rowStats.paymentDriftCount > 0;

  const prior = input.existing;
  let status: B2bArCollectorTaskStatus = prior?.status ?? "open";
  if (status === "done") status = "open";
  status = resolveEffectiveCollectorTaskStatus(
    { status, snoozedUntil: prior?.snoozedUntil ?? null },
    input.nowMs,
  );

  const dueAt =
    status === "open"
      ? prior?.dueAt ?? computeCollectorTaskDueAt(input.company.maxDaysPastDue, slaDays, input.nowMs)
      : prior?.dueAt ?? null;

  return {
    taskId,
    companyAccountId: input.company.companyAccountId,
    companyKey: input.company.companyKey,
    companyName: input.company.companyName,
    assignee: input.assignee ?? prior?.assignee ?? null,
    status,
    dueAt,
    snoozedUntil: status === "snoozed" ? prior?.snoozedUntil ?? null : null,
    slaDays,
    maxDaysPastDue: input.company.maxDaysPastDue,
    openInvoices: input.company.openInvoices,
    openAmountCents: input.company.openAmountCents,
    overdueInvoices: input.company.overdueInvoices,
    paymentDriftCount: rowStats.paymentDriftCount,
    priority,
    slaBreached,
    escalated,
    createdAt: prior?.createdAt ?? input.nowIso,
    updatedAt: input.nowIso,
    completedAt: status === "done" ? prior?.completedAt ?? input.nowIso : null,
    notes: prior?.notes ?? null,
  };
}

export function syncB2bCollectorTasks(input: {
  companies: B2bArCompanyRollup[];
  rows: B2bArDashboardRow[];
  collectorsByCompanyId: Record<string, string>;
  slaByCompany: Record<string, number> | null | undefined;
  defaultSlaDays: number | null | undefined;
  existingTasks: B2bArCollectorTask[] | null | undefined;
  nowMs?: number;
}): { tasks: B2bArCollectorTask[]; created: number; completed: number } {
  const nowMs = input.nowMs ?? Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const existingMap = new Map((input.existingTasks ?? []).map((task) => [task.taskId, task]));

  const nextTasks: B2bArCollectorTask[] = [];
  let created = 0;
  let completed = 0;

  for (const company of input.companies) {
    const taskId = company.companyAccountId ?? company.companyKey;
    const existing = existingMap.get(taskId) ?? null;
    const assignee =
      company.companyAccountId && input.collectorsByCompanyId[company.companyAccountId]
        ? input.collectorsByCompanyId[company.companyAccountId]
        : company.assignedCollector;

    if (company.overdueInvoices <= 0) {
      if (existing && existing.status !== "done") {
        nextTasks.push({
          ...existing,
          status: "done",
          completedAt: nowIso,
          updatedAt: nowIso,
          snoozedUntil: null,
        });
        completed += 1;
      } else if (existing?.status === "done") {
        nextTasks.push(existing);
      }
      continue;
    }

    const built = buildB2bCollectorTaskFromCompany({
      company,
      rows: input.rows,
      assignee,
      slaByCompany: input.slaByCompany,
      defaultSlaDays: input.defaultSlaDays,
      existing,
      nowMs,
      nowIso,
    });
    if (!built) continue;
    if (!existing) created += 1;
    nextTasks.push(built);
  }

  return { tasks: nextTasks, created, completed };
}

export function buildB2bCollectorQueueSnapshot(
  tasks: B2bArCollectorTask[],
  nowMs = Date.now(),
): B2bArCollectorQueueSnapshot {
  const effective = tasks.map((task) => ({
    ...task,
    status: resolveEffectiveCollectorTaskStatus(task, nowMs),
  }));

  const openCount = effective.filter((task) => task.status === "open").length;
  const snoozedCount = effective.filter((task) => task.status === "snoozed").length;
  const doneCount = effective.filter((task) => task.status === "done").length;
  const active = effective.filter((task) => task.status === "open" || task.status === "snoozed");

  return {
    computedAt: new Date(nowMs).toISOString(),
    tasks: effective.sort((a, b) => {
      if (a.slaBreached !== b.slaBreached) return a.slaBreached ? -1 : 1;
      if (a.priority !== b.priority) {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }
      return b.maxDaysPastDue - a.maxDaysPastDue;
    }),
    openCount,
    snoozedCount,
    doneCount,
    slaBreachedCount: active.filter((task) => task.slaBreached).length,
    escalatedCount: active.filter((task) => task.escalated).length,
  };
}

export function incrementB2bCollectorQueueStats(
  current: B2bArCollectorQueueStats | null | undefined,
  patch: Partial<B2bArCollectorQueueStats>,
): B2bArCollectorQueueStats {
  const base: B2bArCollectorQueueStats = current ?? {
    syncRuns: 0,
    tasksCreated: 0,
    tasksCompleted: 0,
    tasksSnoozed: 0,
    digestsSent: 0,
    skippedEmailOff: 0,
    skippedRecentDigest: 0,
    skippedNoTasks: 0,
  };
  return {
    syncRuns: base.syncRuns + (patch.syncRuns ?? 0),
    tasksCreated: base.tasksCreated + (patch.tasksCreated ?? 0),
    tasksCompleted: base.tasksCompleted + (patch.tasksCompleted ?? 0),
    tasksSnoozed: base.tasksSnoozed + (patch.tasksSnoozed ?? 0),
    digestsSent: base.digestsSent + (patch.digestsSent ?? 0),
    skippedEmailOff: base.skippedEmailOff + (patch.skippedEmailOff ?? 0),
    skippedRecentDigest: base.skippedRecentDigest + (patch.skippedRecentDigest ?? 0),
    skippedNoTasks: base.skippedNoTasks + (patch.skippedNoTasks ?? 0),
  };
}

export function buildB2bCollectorDigestPreview(input: {
  snapshot: B2bArCollectorQueueSnapshot;
  digestEnabled: boolean;
  lastDigestAt: string | null;
}): {
  computedAt: string;
  digestEnabled: boolean;
  lastDigestAt: string | null;
  openCount: number;
  slaBreachedCount: number;
  tasksByAssignee: Array<{
    assignee: string;
    tasks: B2bArCollectorTask[];
  }>;
} {
  const active = input.snapshot.tasks.filter(
    (task) => task.status === "open" || task.status === "snoozed",
  );
  const groups = new Map<string, B2bArCollectorTask[]>();
  for (const task of active) {
    const key = task.assignee?.trim() || "Unassigned";
    const list = groups.get(key) ?? [];
    list.push(task);
    groups.set(key, list);
  }

  return {
    computedAt: input.snapshot.computedAt,
    digestEnabled: input.digestEnabled,
    lastDigestAt: input.lastDigestAt,
    openCount: input.snapshot.openCount + input.snapshot.snoozedCount,
    slaBreachedCount: input.snapshot.slaBreachedCount,
    tasksByAssignee: [...groups.entries()].map(([assignee, tasks]) => ({
      assignee,
      tasks: tasks.sort((a, b) => b.maxDaysPastDue - a.maxDaysPastDue),
    })),
  };
}

export function defaultSnoozedUntil(nowMs = Date.now()): string {
  return new Date(nowMs + DEFAULT_B2B_COLLECTOR_SNOOZE_DAYS * 86400000).toISOString();
}
