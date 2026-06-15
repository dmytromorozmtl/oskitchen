import type { BenchmarkPremiumSettings } from "@/lib/ai/benchmark-2.0-types";

export function readBenchmarkPremiumSettings(settingsCenterJson: unknown): BenchmarkPremiumSettings {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object" || Array.isArray(settingsCenterJson)) {
    return {};
  }
  const raw = (settingsCenterJson as Record<string, unknown>).benchmarkPremium;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as BenchmarkPremiumSettings;
}

export function mergeBenchmarkPremiumSettings(
  center: Record<string, unknown>,
  premium: BenchmarkPremiumSettings,
): Record<string, unknown> {
  return {
    ...center,
    benchmarkPremium: premium,
  };
}
