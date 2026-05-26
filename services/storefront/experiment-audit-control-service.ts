import { prisma } from "@/lib/prisma";

export type AuditControlResult = {
  ok: boolean;
  checks: { id: string; passed: boolean; detail: string }[];
};

/** Continuous control tests on immutable audit stream. */
export async function runExperimentAuditControlChecks(): Promise<AuditControlResult> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const events = await prisma.storefrontExperimentAuditEvent.findMany({
    where: { createdAt: { gte: since } },
    select: { id: true, action: true, storefrontId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const gapCheck = events.length > 0;
  const duplicateActions = new Set(events.map((e) => `${e.storefrontId}:${e.action}:${e.createdAt.toISOString()}`));
  const noDuplicates = duplicateActions.size === events.length;

  const requiredActions = ["storefront.experiment.edge_sync", "storefront.experiment.auto_conclude"];
  const actionSet = new Set(events.map((e) => e.action));
  const hasRequired = requiredActions.some((a) => actionSet.has(a));

  const checks = [
    {
      id: "stream_active_24h",
      passed: gapCheck,
      detail: gapCheck ? `${events.length} events in 24h` : "No audit events in 24h",
    },
    {
      id: "no_duplicate_timestamps",
      passed: noDuplicates,
      detail: noDuplicates ? "No duplicate event keys" : "Possible duplicate audit rows",
    },
    {
      id: "ops_actions_present",
      passed: hasRequired || events.length === 0,
      detail: hasRequired ? "Required ops actions seen" : "Missing edge_sync or auto_conclude in 24h",
    },
  ];

  return { ok: checks.every((c) => c.passed), checks };
}
