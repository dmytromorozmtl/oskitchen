import type { Prisma } from "@prisma/client";

import {
  AUTO_SAFE_ACTION_TYPES,
  buildDailyDigest,
  buildExceptionLogFromRecommendations,
  isAutoSafeRecommendation,
} from "@/lib/ai/co-pilot-autonomous-builders";
import {
  appendExceptionLog,
  CO_PILOT_AUTONOMOUS_STORAGE_KEY,
  readCoPilotAutonomousStorage,
  type CoPilotAutonomousStorage,
} from "@/lib/ai/co-pilot-autonomous-storage";
import type {
  CoPilotAutonomousDashboard,
  CoPilotAutonomousSettings,
  CoPilotExceptionEntry,
} from "@/lib/ai/co-pilot-autonomous-types";
import { DEFAULT_CO_PILOT_AUTONOMOUS_SETTINGS } from "@/lib/ai/co-pilot-autonomous-types";
import { prisma } from "@/lib/prisma";
import {
  approveCoPilotDraft,
  executeCoPilotDraft,
  getRestaurantCoPilotDashboard,
  promoteCoPilotRecommendation,
  scanRestaurantCoPilotRecommendations,
} from "@/services/ai/co-pilot-service";

export type { CoPilotAutonomousDashboard } from "@/lib/ai/co-pilot-autonomous-types";

type Scope = { userId: string; email: string | null; workspaceId: string | null };

async function loadStorage(ownerUserId: string): Promise<CoPilotAutonomousStorage> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  return readCoPilotAutonomousStorage(kitchen?.settingsCenterJson ?? null);
}

async function saveStorage(ownerUserId: string, storage: CoPilotAutonomousStorage): Promise<void> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });

  const center =
    kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object" && !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  center[CO_PILOT_AUTONOMOUS_STORAGE_KEY] = storage;

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, settingsCenterJson: center as Prisma.InputJsonValue },
    update: { settingsCenterJson: center as Prisma.InputJsonValue },
  });
}

export async function loadCoPilotAutonomousDashboard(userId: string): Promise<CoPilotAutonomousDashboard> {
  const [dashboard, storage] = await Promise.all([
    getRestaurantCoPilotDashboard(userId),
    loadStorage(userId),
  ]);

  const digest = buildDailyDigest({
    recommendations: dashboard.recommendations,
    pendingApproval: dashboard.counts.needsApproval,
    autoExecuted: 0,
    exceptionsLogged: storage.exceptionLog?.length ?? 0,
  });

  return {
    settings: {
      enabled: storage.enabled,
      autoRunSafeActions: storage.autoRunSafeActions,
      lastDigestAt: storage.lastDigestAt,
      lastRunAt: storage.lastRunAt,
    },
    digest,
    exceptions: storage.exceptionLog ?? [],
    recentRecommendations: dashboard.recommendations.slice(0, 12),
    scannedAt: dashboard.scannedAt,
  };
}

export async function updateCoPilotAutonomousSettings(
  userId: string,
  patch: Partial<CoPilotAutonomousSettings>,
): Promise<CoPilotAutonomousSettings> {
  const current = await loadStorage(userId);
  const next: CoPilotAutonomousStorage = { ...current, ...patch };
  await saveStorage(userId, next);
  return {
    enabled: next.enabled,
    autoRunSafeActions: next.autoRunSafeActions,
    lastDigestAt: next.lastDigestAt,
    lastRunAt: next.lastRunAt,
  };
}

export async function runCoPilotAutonomousCycle(scope: Scope): Promise<{
  dashboard: CoPilotAutonomousDashboard;
  autoExecuted: number;
  errors: string[];
}> {
  const ownerUserId = scope.userId;
  const storage = await loadStorage(ownerUserId);
  const recommendations = await scanRestaurantCoPilotRecommendations(ownerUserId);
  const coPilotDash = await getRestaurantCoPilotDashboard(ownerUserId);

  let autoExecuted = 0;
  const errors: string[] = [];
  let exceptionLog = buildExceptionLogFromRecommendations(
    recommendations,
    storage.exceptionLog ?? [],
  );

  if (storage.enabled && storage.autoRunSafeActions) {
    const safe = recommendations.filter(isAutoSafeRecommendation).slice(0, 3);
    for (const rec of safe) {
      try {
        const { draftId } = await promoteCoPilotRecommendation(scope, rec);
        await approveCoPilotDraft(scope, draftId);
        const result = await executeCoPilotDraft(scope, draftId);
        if (result.ok) {
          autoExecuted += 1;
        } else {
          errors.push(result.reason ?? `Failed to execute ${rec.title}`);
          exceptionLog = appendExceptionLog(exceptionLog, {
            id: `exc-run-${rec.id}-${Date.now()}`,
            at: new Date().toISOString(),
            severity: "warning",
            category: rec.category,
            title: `Auto-run failed: ${rec.title}`,
            detail: result.reason ?? "Unknown execution error",
            resolved: false,
            source: "execution_failure",
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Auto-run failed";
        errors.push(msg);
        exceptionLog = appendExceptionLog(exceptionLog, {
          id: `exc-run-${rec.id}-${Date.now()}`,
          at: new Date().toISOString(),
          severity: "warning",
          category: rec.category,
          title: `Auto-run error: ${rec.title}`,
          detail: msg,
          resolved: false,
          source: "autonomous_run",
        });
      }
    }
  }

  const digest = buildDailyDigest({
    recommendations,
    pendingApproval: coPilotDash.counts.needsApproval,
    autoExecuted,
    exceptionsLogged: exceptionLog.length,
  });

  const now = new Date().toISOString();
  await saveStorage(ownerUserId, {
    ...storage,
    lastDigestAt: now,
    lastRunAt: now,
    exceptionLog,
  });

  return {
    dashboard: {
      settings: {
        enabled: storage.enabled,
        autoRunSafeActions: storage.autoRunSafeActions,
        lastDigestAt: now,
        lastRunAt: now,
      },
      digest,
      exceptions: exceptionLog,
      recentRecommendations: recommendations.slice(0, 12),
      scannedAt: now,
    },
    autoExecuted,
    errors,
  };
}

export async function resolveCoPilotException(
  userId: string,
  exceptionId: string,
): Promise<CoPilotExceptionEntry[]> {
  const storage = await loadStorage(userId);
  const exceptionLog = (storage.exceptionLog ?? []).map((e) =>
    e.id === exceptionId ? { ...e, resolved: true } : e,
  );
  await saveStorage(userId, { ...storage, exceptionLog });
  return exceptionLog;
}

export function listAutoSafeActionTypes(): string[] {
  return [...AUTO_SAFE_ACTION_TYPES];
}

export async function getDefaultCoPilotAutonomousSettings(): Promise<CoPilotAutonomousSettings> {
  return { ...DEFAULT_CO_PILOT_AUTONOMOUS_SETTINGS };
}
