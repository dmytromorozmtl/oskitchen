import type { BenchmarkHistoryPoint } from "@/lib/ai/benchmark-dashboard-types";
import { appendHistoryPoint } from "@/lib/ai/benchmark-dashboard-builders";

export type BenchmarkNetworkSettings = {
  history?: BenchmarkHistoryPoint[];
  contribution?: {
    contributing?: boolean;
    lastContributedAt?: string;
    metricsShared?: number;
    anonId?: string;
    cohortId?: string;
  };
};

export function readBenchmarkSettings(settingsCenterJson: unknown): BenchmarkNetworkSettings {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object" || Array.isArray(settingsCenterJson)) {
    return {};
  }
  const raw = (settingsCenterJson as Record<string, unknown>).benchmarkNetwork;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as BenchmarkNetworkSettings;
}

export function mergeBenchmarkHistory(
  settings: BenchmarkNetworkSettings,
  point: BenchmarkHistoryPoint,
): BenchmarkNetworkSettings {
  return {
    ...settings,
    history: appendHistoryPoint(settings.history ?? [], point),
  };
}
