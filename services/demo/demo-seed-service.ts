import { getGoldenDemoScenario } from "@/lib/demo/golden-demo-scenarios";
import { isDemoGloballyFlagged } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { auditLogListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { areDemoWorkspaceMutationsAllowed, demoWorkspaceBlockedInProductionMessage } from "@/lib/production-guards";
import { auditLog } from "@/services/audit/audit-service";
import { seedDemoWorkspace } from "@/services/demo-data";
import { clearDemoScenarioWorkspace } from "@/services/demo/demo-reset-service";

export type DemoSeedGateResult =
  | { ok: true }
  | { ok: false; reason: string };

export function evaluateDemoSeedGate(): DemoSeedGateResult {
  if (!areDemoWorkspaceMutationsAllowed()) {
    return { ok: false, reason: demoWorkspaceBlockedInProductionMessage() };
  }
  return { ok: true };
}

export async function seedGoldenDemoScenario(userId: string, scenarioId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = evaluateDemoSeedGate();
  if (!gate.ok) return { ok: false, error: gate.reason };

  const plan = getGoldenDemoScenario(scenarioId);
  if (!plan) return { ok: false, error: "Unknown demo scenario." };

  await seedDemoWorkspace(userId, plan.vertical);

  void auditLog({
    actor: { userId },
    action: "DEMO_GOLDEN_SCENARIO_SEEDED",
    category: "DEVELOPER",
    source: "USER",
    entity: { type: "DemoScenario", id: plan.scenarioId, label: plan.title },
    metadata: {
      scenarioId: plan.scenarioId,
      vertical: plan.vertical,
      demoGloballyFlagged: isDemoGloballyFlagged(),
      simulatedWebhooksOnly: true,
    },
  });

  return { ok: true };
}

export async function resetGoldenDemoScenario(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await clearDemoScenarioWorkspace(userId);
    await prisma.kitchenSettings.update({
      where: { userId },
      data: { demoMode: false },
    });
    void auditLog({
      actor: { userId },
      action: "DEMO_GOLDEN_SCENARIO_RESET",
      category: "DEVELOPER",
      source: "USER",
      entity: { type: "DemoScenario", id: "reset", label: "Demo reset" },
      metadata: {},
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Reset failed.";
    return { ok: false, error: msg };
  }
}

export async function getLastDemoScenarioSeedAt(userId: string): Promise<Date | null> {
  const scope = await auditLogListWhereForOwner(userId);
  const row = await prisma.auditLog.findFirst({
    where: { AND: [scope, { action: "DEMO_GOLDEN_SCENARIO_SEEDED" }] },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return row?.createdAt ?? null;
}
