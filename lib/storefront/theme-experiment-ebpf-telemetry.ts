/**
 * R2 — eBPF edge telemetry: kernel-level assignment latency + adaptive CDN purge on arm drift.
 */

import { storefrontThemeArmCacheTag } from "@/lib/storefront/cdn-cache";
import { toJsonValue } from "@/lib/prisma/json";
import type { ThemeExperimentArm } from "@/lib/storefront/theme-experiment";

export type EbpfAssignmentSample = {
  at: string;
  storeSlug: string;
  arm: string;
  latencyUs: number;
  kernelPath: "ebpf" | "userspace_fallback";
};

export type EbpfTelemetrySnapshot = {
  at: string;
  samples: EbpfAssignmentSample[];
  assignmentLatencyUsP99: number;
  armDistribution: Record<string, number>;
  lastPurgedAt: string | null;
  driftDetected: boolean;
};

export function isEbpfTelemetryEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_EBPF_TELEMETRY === "1";
}

export function ebpfAssignmentSloUs(): number {
  return Number(process.env.THEME_EXPERIMENT_EBPF_SLO_US ?? "500");
}

export function armDriftThresholdPercent(): number {
  return Number(process.env.THEME_EXPERIMENT_ARM_DRIFT_PP ?? "15");
}

export function readEbpfTelemetry(raw: unknown): EbpfTelemetrySnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).ebpfTelemetry;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const t = o as Record<string, unknown>;
  if (!Array.isArray(t.samples)) return null;
  return {
    at: typeof t.at === "string" ? t.at : new Date().toISOString(),
    samples: t.samples as EbpfAssignmentSample[],
    assignmentLatencyUsP99:
      typeof t.assignmentLatencyUsP99 === "number" ? t.assignmentLatencyUsP99 : 0,
    armDistribution:
      t.armDistribution && typeof t.armDistribution === "object" && !Array.isArray(t.armDistribution)
        ? (t.armDistribution as Record<string, number>)
        : {},
    lastPurgedAt: typeof t.lastPurgedAt === "string" ? t.lastPurgedAt : null,
    driftDetected: t.driftDetected === true,
  };
}

function computeP99(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.99));
  return sorted[idx] ?? 0;
}

export function detectArmDrift(distribution: Record<string, number>): boolean {
  const total = Object.values(distribution).reduce((s, v) => s + v, 0);
  if (total < 50) return false;
  const expected = total / Math.max(1, Object.keys(distribution).length);
  const threshold = armDriftThresholdPercent() / 100;
  for (const count of Object.values(distribution)) {
    const ratio = count / total;
    const expectedRatio = 1 / Math.max(1, Object.keys(distribution).length);
    if (Math.abs(ratio - expectedRatio) > threshold) return true;
    if (count > expected * (1 + threshold * 2)) return true;
  }
  return false;
}

export function recordEbpfAssignmentSample(
  raw: unknown,
  sample: Omit<EbpfAssignmentSample, "at">,
): EbpfTelemetrySnapshot {
  const prev = readEbpfTelemetry(raw) ?? {
    at: new Date().toISOString(),
    samples: [],
    assignmentLatencyUsP99: 0,
    armDistribution: {},
    lastPurgedAt: null,
    driftDetected: false,
  };

  const samples = [...prev.samples, { ...sample, at: new Date().toISOString() }].slice(-500);
  const lags = samples.map((s) => s.latencyUs);
  const armDistribution = { ...prev.armDistribution };
  armDistribution[sample.arm] = (armDistribution[sample.arm] ?? 0) + 1;
  const driftDetected = detectArmDrift(armDistribution);

  return {
    at: new Date().toISOString(),
    samples,
    assignmentLatencyUsP99: computeP99(lags),
    armDistribution,
    lastPurgedAt: prev.lastPurgedAt,
    driftDetected,
  };
}

export function mergeEbpfTelemetryIntoJson(
  previousRaw: unknown,
  snap: EbpfTelemetrySnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.ebpfTelemetry = snap;
  return base;
}

export function cdnTagsForArmDriftPurge(storeSlug: string, arms: string[]): string[] {
  return arms.map((arm) => storefrontThemeArmCacheTag(storeSlug, arm as ThemeExperimentArm));
}

export function markEbpfPurged(snap: EbpfTelemetrySnapshot): EbpfTelemetrySnapshot {
  return {
    ...snap,
    at: new Date().toISOString(),
    lastPurgedAt: new Date().toISOString(),
    driftDetected: false,
    armDistribution: {},
  };
}
