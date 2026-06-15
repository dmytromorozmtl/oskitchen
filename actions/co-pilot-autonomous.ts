"use server";

import { revalidatePath } from "next/cache";

import { fail, ok } from "@/lib/action-result";
import { requireCopilotMutation } from "@/lib/ai/require-copilot-mutation";
import type { CoPilotAutonomousSettings } from "@/lib/ai/co-pilot-autonomous-types";
import { safeError } from "@/lib/security";
import {
  loadCoPilotAutonomousDashboard,
  resolveCoPilotException,
  runCoPilotAutonomousCycle,
  updateCoPilotAutonomousSettings,
} from "@/services/ai/co-pilot-autonomous-service";

const AUTONOMOUS_PATH = "/dashboard/ai/co-pilot/autonomous";
const CO_PILOT_PATH = "/dashboard/ai/co-pilot";

function revalidateCoPilot() {
  revalidatePath(AUTONOMOUS_PATH);
  revalidatePath(CO_PILOT_PATH);
  revalidatePath("/dashboard/copilot/drafts");
}

export async function refreshCoPilotAutonomousDashboardAction() {
  try {
    const gate = await requireCopilotMutation({
      capability: "copilot.view",
      operation: "co_pilot_autonomous.refresh",
    });
    if (!gate.ok) return fail(gate.error);

    const dashboard = await loadCoPilotAutonomousDashboard(gate.scope.userId);
    revalidateCoPilot();
    return ok(dashboard);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function updateCoPilotAutonomousSettingsAction(patch: Partial<CoPilotAutonomousSettings>) {
  try {
    const gate = await requireCopilotMutation({
      capability: "copilot.actions.approve",
      operation: "co_pilot_autonomous.settings",
    });
    if (!gate.ok) return fail(gate.error);

    const settings = await updateCoPilotAutonomousSettings(gate.scope.userId, patch);
    revalidateCoPilot();
    return ok({ settings, message: "Autonomous Co-Pilot settings saved." });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function runCoPilotAutonomousCycleAction() {
  try {
    const gate = await requireCopilotMutation({
      capability: "copilot.actions.approve",
      operation: "co_pilot_autonomous.run",
    });
    if (!gate.ok) return fail(gate.error);

    const { dashboard, autoExecuted, errors } = await runCoPilotAutonomousCycle({
      userId: gate.scope.userId,
      email: gate.scope.email,
      workspaceId: gate.scope.workspaceId ?? null,
    });

    revalidateCoPilot();

    if (errors.length > 0 && autoExecuted === 0) {
      return fail(errors.join("; "));
    }

    return ok({
      dashboard,
      message: `Cycle complete — ${autoExecuted} safe action(s) executed, ${dashboard.exceptions.length} exception(s) in log.`,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function resolveCoPilotExceptionAction(exceptionId: string) {
  try {
    const gate = await requireCopilotMutation({
      capability: "copilot.actions.approve",
      operation: "co_pilot_autonomous.resolve",
    });
    if (!gate.ok) return fail(gate.error);

    const exceptions = await resolveCoPilotException(gate.scope.userId, exceptionId);
    revalidateCoPilot();
    return ok({ exceptions, message: "Exception marked resolved." });
  } catch (e) {
    return fail(safeError(e));
  }
}
