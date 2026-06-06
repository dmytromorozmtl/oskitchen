/**
 * KDS Expo View summary — Round 2 wiring audit (Era 176).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_EXPO_VIEW_ERA176_CANONICAL_SUMMARY_ARTIFACT,
  KDS_EXPO_VIEW_ERA176_CAPABILITIES,
  KDS_EXPO_VIEW_ERA176_LANES,
  KDS_EXPO_VIEW_ERA176_POLICY_ID,
  KDS_EXPO_VIEW_ERA176_ROUTE,
} from "@/lib/kitchen/kds-expo-view-era176-policy";
import { auditKdsExpoViewSmokeWiring } from "@/lib/kitchen/kds-expo-view-smoke-summary";

export const KDS_EXPO_VIEW_ERA176_SMOKE_SUMMARY_VERSION = KDS_EXPO_VIEW_ERA176_POLICY_ID;

export type KdsExpoViewSmokeEra176Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KdsExpoViewSmokeEra176ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KdsExpoViewSmokeEra176Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KdsExpoViewSmokeEra176Summary = {
  version: typeof KDS_EXPO_VIEW_ERA176_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KdsExpoViewSmokeEra176Overall;
  proofStatus: KdsExpoViewSmokeEra176ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  lanes: readonly string[];
  capabilities: readonly string[];
  steps: KdsExpoViewSmokeEra176Step[];
  honestyNote: string;
};

export function auditKdsExpoViewSmokeEra176Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditKdsExpoViewSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, KDS_EXPO_VIEW_ERA176_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveKdsExpoViewSmokeEra176ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): KdsExpoViewSmokeEra176ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildKdsExpoViewSmokeEra176Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): KdsExpoViewSmokeEra176Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveKdsExpoViewSmokeEra176ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: KdsExpoViewSmokeEra176Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: KdsExpoViewSmokeEra176Step[] = [
    {
      id: "wiring_audit",
      label: "Order tickets → ready / waiting / delayed lanes → expo handoff UI",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 176 KDS Expo View cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era101)",
      status:
        liveSmokeOverall === "PASSED"
          ? "PASSED"
          : liveSmokeOverall === "SKIPPED"
            ? "SKIPPED"
            : liveSmokeOverall === "FAILED"
              ? "FAILED"
              : "SKIPPED",
      reason:
        liveSmokeOverall === "PASSED"
          ? "Canonical era101 smoke PASSED"
          : liveSmokeOverall
            ? `era101 artifact overall: ${liveSmokeOverall}`
            : "No era101 artifact — run npm run smoke:kds-expo-view-era101",
    },
  ];

  return {
    version: KDS_EXPO_VIEW_ERA176_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: KDS_EXPO_VIEW_ERA176_ROUTE,
    lanes: KDS_EXPO_VIEW_ERA176_LANES,
    capabilities: KDS_EXPO_VIEW_ERA176_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live expo proof requires staging tenant with bumped tickets.",
  };
}

export function formatKdsExpoViewSmokeEra176ReportLines(
  summary: KdsExpoViewSmokeEra176Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era101): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Lanes: ${summary.lanes.join(" · ")}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
