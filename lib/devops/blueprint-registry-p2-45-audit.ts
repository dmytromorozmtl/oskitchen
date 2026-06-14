import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BLUEPRINT_REGISTRY_P2_45_ARTIFACT,
  BLUEPRINT_REGISTRY_P2_45_POLICY_ID,
  BLUEPRINT_REGISTRY_P2_45_SENTRY_TASK_ID,
  type BlueprintRegistryArtifact,
  isBlueprintRegistrySentryLive,
} from "@/lib/devops/blueprint-registry-p2-45-policy";

export type BlueprintRegistryP245AuditSummary = {
  policyId: typeof BLUEPRINT_REGISTRY_P2_45_POLICY_ID;
  registryPresent: boolean;
  sentryOk: boolean;
  sentryStatus: string | null;
  blueprintTrackerDone: boolean;
  sentryUnblockStatusDone: boolean;
  absoluteFinalTrackerDone: boolean;
  healthRouteWired: boolean;
  passed: boolean;
};

function readJson<T>(root: string, relativePath: string): T | null {
  const path = join(root, relativePath);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function readBlueprintRegistryArtifact(
  root = process.cwd(),
): BlueprintRegistryArtifact | null {
  return readJson<BlueprintRegistryArtifact>(root, BLUEPRINT_REGISTRY_P2_45_ARTIFACT);
}

export function auditBlueprintRegistryP245(root = process.cwd()): BlueprintRegistryP245AuditSummary {
  const registry = readBlueprintRegistryArtifact(root);
  const registryPresent = registry !== null;

  const sentryItem = registry?.items?.[BLUEPRINT_REGISTRY_P2_45_SENTRY_TASK_ID];
  const sentryHealth = sentryItem?.healthCheck?.sentryServer;
  const sentryOk =
    sentryItem?.ok === true &&
    sentryItem?.status === "done" &&
    sentryHealth !== undefined &&
    isBlueprintRegistrySentryLive(sentryHealth);

  const blueprintTracker = readJson<Record<string, string>>(root, "artifacts/blueprint-tracker.json");
  const blueprintTrackerDone =
    blueprintTracker?.[BLUEPRINT_REGISTRY_P2_45_SENTRY_TASK_ID] === "done";

  const sentryUnblock = readJson<{ status?: string; healthCheck?: { sentryServer?: { ok?: boolean; status?: string } } }>(
    root,
    "artifacts/sentry-p0-unblock-status.json",
  );
  const sentryUnblockStatusDone =
    sentryUnblock?.status === "done" &&
    sentryUnblock?.healthCheck?.sentryServer?.ok === true &&
    sentryUnblock?.healthCheck?.sentryServer?.status === "live";

  const absoluteFinal = readJson<Record<string, string>>(root, "artifacts/absolute-final-tracker.json");
  const absoluteFinalTrackerDone = absoluteFinal?.["2-activate-sentry-dsn"] === "done";

  let healthRouteWired = false;
  const healthPath = join(root, "app/api/health/route.ts");
  if (existsSync(healthPath)) {
    const healthSource = readFileSync(healthPath, "utf8");
    healthRouteWired =
      healthSource.includes("sentryServer") &&
      healthSource.includes('extended.sentryServer === "live"');
  }

  const passed =
    registryPresent &&
    registry?.policyId === BLUEPRINT_REGISTRY_P2_45_POLICY_ID &&
    sentryOk &&
    blueprintTrackerDone &&
    sentryUnblockStatusDone &&
    absoluteFinalTrackerDone &&
    healthRouteWired;

  return {
    policyId: BLUEPRINT_REGISTRY_P2_45_POLICY_ID,
    registryPresent,
    sentryOk,
    sentryStatus: sentryHealth?.status ?? null,
    blueprintTrackerDone,
    sentryUnblockStatusDone,
    absoluteFinalTrackerDone,
    healthRouteWired,
    passed,
  };
}

export function formatBlueprintRegistryP245AuditLines(
  summary: BlueprintRegistryP245AuditSummary,
): string[] {
  return [
    `Blueprint registry Sentry sync (${summary.policyId})`,
    `Registry present: ${summary.registryPresent ? "yes" : "no"}`,
    `Sentry ok (live): ${summary.sentryOk ? "yes" : "no"} (status=${summary.sentryStatus ?? "missing"})`,
    `blueprint-tracker done: ${summary.blueprintTrackerDone ? "yes" : "no"}`,
    `sentry-p0-unblock-status done: ${summary.sentryUnblockStatusDone ? "yes" : "no"}`,
    `absolute-final-tracker done: ${summary.absoluteFinalTrackerDone ? "yes" : "no"}`,
    `Health route wired: ${summary.healthRouteWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
