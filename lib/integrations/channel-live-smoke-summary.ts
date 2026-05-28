/**
 * Channel live smoke summary — Evolution Era 16 Cycle 5 + Era 17 Woo proof.
 *
 * Pure helpers for PASS / FAILED / SKIPPED WITH REASON orchestration.
 */

export const CHANNEL_LIVE_SMOKE_SUMMARY_VERSION = "era17-channel-live-smoke-v1" as const;

export type ChannelLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type ChannelLiveSmokeStep = {
  id: string;
  label: string;
  status: ChannelLiveSmokeStepStatus;
  reason?: string;
};

export type ChannelLiveSmokeOverall = "PASSED" | "FAILED" | "SKIPPED";

export type ChannelLiveProviderProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_pending_next_cycle"
  | "proof_failed";

export type ChannelLiveSmokeSummary = {
  version: typeof CHANNEL_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  overall: ChannelLiveSmokeOverall;
  wooLiveProofStatus: ChannelLiveProviderProofStatus;
  shopifyLiveProofStatus: ChannelLiveProviderProofStatus;
  missingEnvVars: string[];
  steps: ChannelLiveSmokeStep[];
};

export type ChannelLiveSmokePrerequisiteInput = {
  databaseUrl?: string | null;
  encryptionKey?: string | null;
  ownerEmail?: string | null;
  connectionId?: string | null;
};

const PREREQUISITE_ENV_CHECKS: readonly {
  key: string;
  present: (input: ChannelLiveSmokePrerequisiteInput) => boolean;
}[] = [
  {
    key: "DATABASE_URL",
    present: (input) => Boolean(input.databaseUrl?.trim()),
  },
  {
    key: "ENCRYPTION_KEY",
    present: (input) => Boolean(input.encryptionKey?.trim()),
  },
  {
    key: "CHANNEL_SMOKE_OWNER_EMAIL",
    present: (input) =>
      Boolean(input.connectionId?.trim()) || Boolean(input.ownerEmail?.trim()),
  },
  {
    key: "CHANNEL_SMOKE_CONNECTION_ID",
    present: (input) =>
      Boolean(input.connectionId?.trim()) || Boolean(input.ownerEmail?.trim()),
  },
];

export function listMissingChannelLiveSmokeEnvVars(
  input: ChannelLiveSmokePrerequisiteInput,
): string[] {
  const missing = PREREQUISITE_ENV_CHECKS.filter((check) => !check.present(input)).map(
    (check) => check.key,
  );
  const hasTenantSelector =
    Boolean(input.connectionId?.trim()) || Boolean(input.ownerEmail?.trim());
  if (hasTenantSelector) {
    return missing.filter(
      (key) =>
        key !== "CHANNEL_SMOKE_CONNECTION_ID" && key !== "CHANNEL_SMOKE_OWNER_EMAIL",
    );
  }
  return [...new Set(missing.filter((key) => key !== "CHANNEL_SMOKE_CONNECTION_ID"))];
}

export function formatMissingChannelLiveSmokeEnvVarsReason(
  missingKeys: readonly string[],
): string {
  if (missingKeys.length === 0) {
    return "All channel live smoke prerequisite env vars are set.";
  }
  return `Missing env vars: ${missingKeys.join(", ")} — configure staging channel connection credentials before live smoke.`;
}

export function evaluateChannelLiveSmokePrerequisites(
  input: ChannelLiveSmokePrerequisiteInput,
): { ok: true } | { ok: false; reason: string } {
  const missing = listMissingChannelLiveSmokeEnvVars(input);
  if (missing.length > 0) {
    return {
      ok: false,
      reason: formatMissingChannelLiveSmokeEnvVarsReason(missing),
    };
  }
  return { ok: true };
}

export function resolveChannelLiveProviderProofStatus(input: {
  prerequisitesMet: boolean;
  step?: ChannelLiveSmokeStep;
  pendingNextCycle?: boolean;
}): ChannelLiveProviderProofStatus {
  if (input.pendingNextCycle) return "proof_pending_next_cycle";
  if (!input.prerequisitesMet) return "proof_skipped_missing_prerequisites";
  if (!input.step) return "proof_skipped_missing_prerequisites";
  if (input.step.status === "PASSED") return "proof_passed";
  if (input.step.status === "FAILED") return "proof_failed";
  return "proof_skipped_missing_prerequisites";
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
  input?: {
    missingEnvVars?: readonly string[];
    prerequisitesMet?: boolean;
  },
  runAt: Date = new Date(),
): ChannelLiveSmokeSummary {
  const prerequisitesMet = input?.prerequisitesMet ?? false;
  const wooStep = steps.find((step) => step.id === "woo_live_certification");
  const shopifyStep = steps.find((step) => step.id === "shopify_live_certification");

  return {
    version: CHANNEL_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: runAt.toISOString(),
    overall: resolveChannelLiveSmokeOverall(steps),
    wooLiveProofStatus: resolveChannelLiveProviderProofStatus({
      prerequisitesMet,
      step: wooStep,
    }),
    shopifyLiveProofStatus: resolveChannelLiveProviderProofStatus({
      prerequisitesMet,
      step: shopifyStep,
      pendingNextCycle: Boolean(
        shopifyStep?.status === "SKIPPED" &&
          shopifyStep.reason?.includes("Cycle 8"),
      ),
    }),
    missingEnvVars: [...(input?.missingEnvVars ?? [])],
    steps: [...steps],
  };
}

export function formatChannelLiveSmokeReportLines(summary: ChannelLiveSmokeSummary): string[] {
  return [
    `Channel live smoke (${summary.version}) — overall: ${summary.overall}`,
    `Run at: ${summary.runAt}`,
    `Woo live proof status: ${summary.wooLiveProofStatus}`,
    `Shopify live proof status: ${summary.shopifyLiveProofStatus}`,
    summary.missingEnvVars.length > 0
      ? `Missing env vars: ${summary.missingEnvVars.join(", ")}`
      : "Missing env vars: none",
    "",
    ...summary.steps.map((step) => formatChannelLiveSmokeStepLine(step)),
  ];
}

export function printChannelLiveSmokeSummary(summary: ChannelLiveSmokeSummary): void {
  console.log(`\nChannel live smoke summary (${summary.version})`);
  console.log(`Overall: ${summary.overall}`);
  console.log(`Woo live proof: ${summary.wooLiveProofStatus}`);
  console.log(`Shopify live proof: ${summary.shopifyLiveProofStatus}`);
  for (const step of summary.steps) {
    console.log(`  ${formatChannelLiveSmokeStepLine(step)}`);
  }
  console.log("");
}
