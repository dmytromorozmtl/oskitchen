/**
 * Multi-Brand Command Center summary — Round 2 wiring audit (Era 186).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MULTI_BRAND_COMMAND_CENTER_ERA186_CANONICAL_SUMMARY_ARTIFACT,
  MULTI_BRAND_COMMAND_CENTER_ERA186_CAPABILITIES,
  MULTI_BRAND_COMMAND_CENTER_ERA186_POLICY_ID,
  MULTI_BRAND_COMMAND_CENTER_ERA186_ROUTE,
} from "@/lib/enterprise/multi-brand-command-center-era186-policy";
import { auditMultiBrandCommandCenterSmokeWiring } from "@/lib/enterprise/multi-brand-command-center-smoke-summary";

export const MULTI_BRAND_COMMAND_CENTER_ERA186_SMOKE_SUMMARY_VERSION =
  MULTI_BRAND_COMMAND_CENTER_ERA186_POLICY_ID;

export type MultiBrandCommandCenterSmokeEra186Overall = "PASSED" | "FAILED" | "SKIPPED";

export type MultiBrandCommandCenterSmokeEra186ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type MultiBrandCommandCenterSmokeEra186Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type MultiBrandCommandCenterSmokeEra186Summary = {
  version: typeof MULTI_BRAND_COMMAND_CENTER_ERA186_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: MultiBrandCommandCenterSmokeEra186Overall;
  proofStatus: MultiBrandCommandCenterSmokeEra186ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  capabilities: readonly string[];
  steps: MultiBrandCommandCenterSmokeEra186Step[];
  honestyNote: string;
};

export function auditMultiBrandCommandCenterSmokeEra186Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditMultiBrandCommandCenterSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, MULTI_BRAND_COMMAND_CENTER_ERA186_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveMultiBrandCommandCenterSmokeEra186ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): MultiBrandCommandCenterSmokeEra186ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildMultiBrandCommandCenterSmokeEra186Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): MultiBrandCommandCenterSmokeEra186Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveMultiBrandCommandCenterSmokeEra186ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: MultiBrandCommandCenterSmokeEra186Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: MultiBrandCommandCenterSmokeEra186Step[] = [
    {
      id: "wiring_audit",
      label: "Brand lanes A–D → revenue per brand → portfolio alerts → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 186 Multi-Brand Command Center cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era111)",
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
          ? "Canonical era111 smoke PASSED"
          : liveSmokeOverall
            ? `era111 artifact overall: ${liveSmokeOverall}`
            : "No era111 artifact — run npm run smoke:multi-brand-command-center-era111",
    },
  ];

  return {
    version: MULTI_BRAND_COMMAND_CENTER_ERA186_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: MULTI_BRAND_COMMAND_CENTER_ERA186_ROUTE,
    capabilities: MULTI_BRAND_COMMAND_CENTER_ERA186_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with multiple brands and order history.",
  };
}

export function formatMultiBrandCommandCenterSmokeEra186ReportLines(
  summary: MultiBrandCommandCenterSmokeEra186Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era111): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
