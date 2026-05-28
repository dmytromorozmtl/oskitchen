/**
 * Channel live smoke summary — Evolution Era 16 Cycle 5.
 *
 * Pure helpers for PASS / FAILED / SKIPPED WITH REASON orchestration.
 */

export const CHANNEL_LIVE_SMOKE_SUMMARY_VERSION = "era16-channel-live-smoke-v1" as const;

export type ChannelLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type ChannelLiveSmokeStep = {
  id: string;
  label: string;
  status: ChannelLiveSmokeStepStatus;
  reason?: string;
};

export type ChannelLiveSmokeOverall = "PASSED" | "FAILED" | "SKIPPED";

export type ChannelLiveSmokeSummary = {
  version: typeof CHANNEL_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  overall: ChannelLiveSmokeOverall;
  steps: ChannelLiveSmokeStep[];
};

export type ChannelLiveSmokePrerequisiteInput = {
  databaseUrl?: string | null;
  encryptionKey?: string | null;
  ownerEmail?: string | null;
  connectionId?: string | null;
};

export function evaluateChannelLiveSmokePrerequisites(
  input: ChannelLiveSmokePrerequisiteInput,
): { ok: true } | { ok: false; reason: string } {
  if (!input.databaseUrl?.trim()) {
    return {
      ok: false,
      reason: "DATABASE_URL is not configured — live tenant smoke requires a database connection.",
    };
  }
  if (!input.encryptionKey?.trim()) {
    return {
      ok: false,
      reason: "ENCRYPTION_KEY is not configured — integration credentials cannot be decrypted.",
    };
  }
  if (!input.connectionId?.trim() && !input.ownerEmail?.trim()) {
    return {
      ok: false,
      reason:
        "Set CHANNEL_SMOKE_OWNER_EMAIL or CHANNEL_SMOKE_CONNECTION_ID (or CLI flags) to select a Woo/Shopify connection.",
    };
  }
  return { ok: true };
}

export function formatChannelLiveSmokeStepLine(step: ChannelLiveSmokeStep): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${step.label}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
}

export function resolveChannelLiveSmokeOverall(
  steps: readonly ChannelLiveSmokeStep[],
): ChannelLiveSmokeOverall {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function buildChannelLiveSmokeSummary(
  steps: readonly ChannelLiveSmokeStep[],
  runAt: Date = new Date(),
): ChannelLiveSmokeSummary {
  return {
    version: CHANNEL_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: runAt.toISOString(),
    overall: resolveChannelLiveSmokeOverall(steps),
    steps: [...steps],
  };
}

export function printChannelLiveSmokeSummary(summary: ChannelLiveSmokeSummary): void {
  console.log(`\nChannel live smoke summary (${summary.version})`);
  console.log(`Overall: ${summary.overall}`);
  for (const step of summary.steps) {
    console.log(`  ${formatChannelLiveSmokeStepLine(step)}`);
  }
  console.log("");
}
