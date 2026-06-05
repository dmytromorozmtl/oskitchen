import { buildLaborManagerSnapshot } from "@/lib/ai/labor-manager-builders";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { loadAiSchedulePlan } from "@/services/labor/ai-scheduling-service";
import { getLaborRealtimeData } from "@/services/labor/labor-realtime-load";

export type {
  LaborManagerDailyBrief,
  LaborManagerSnapshot,
  OvertimeAlert,
  StaffingOptimizationSignal,
} from "@/lib/ai/labor-manager-types";

/**
 * AI Labor Manager — staffing optimization from demand-based schedule plan and overtime alerts
 * from real-time clock data. Deterministic engine; not a generative model.
 */
export async function loadLaborManagerSnapshot(userId: string) {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) {
    throw new Error(`No workspace for user: ${userId}`);
  }

  const [realtime, plan] = await Promise.all([
    getLaborRealtimeData(userId),
    loadAiSchedulePlan(userId).catch(() => null),
  ]);

  return buildLaborManagerSnapshot({
    workspaceId,
    weekStartIso: plan?.weekStartIso ?? new Date().toISOString().slice(0, 10),
    realtime,
    plan,
  });
}

export async function loadLaborManagerSnapshotForWorkspace(workspaceId: string) {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  return loadLaborManagerSnapshot(ownerUserId);
}
