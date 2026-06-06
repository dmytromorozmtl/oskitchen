/**
 * KDS Production View summary — Round 2 wiring audit (Era 175).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_PRODUCTION_VIEW_ERA175_CANONICAL_SUMMARY_ARTIFACT,
  KDS_PRODUCTION_VIEW_ERA175_CAPABILITIES,
  KDS_PRODUCTION_VIEW_ERA175_POLICY_ID,
  KDS_PRODUCTION_VIEW_ERA175_ROUTE,
} from "@/lib/kitchen/kds-production-view-era175-policy";
import { auditKdsProductionViewSmokeWiring } from "@/lib/kitchen/kds-production-view-smoke-summary";

export const KDS_PRODUCTION_VIEW_ERA175_SMOKE_SUMMARY_VERSION =
  KDS_PRODUCTION_VIEW_ERA175_POLICY_ID;

export type KdsProductionViewSmokeEra175Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KdsProductionViewSmokeEra175ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KdsProductionViewSmokeEra175Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KdsProductionViewSmokeEra175Summary = {
  version: typeof KDS_PRODUCTION_VIEW_ERA175_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KdsProductionViewSmokeEra175Overall;
  proofStatus: KdsProductionViewSmokeEra175ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  capabilities: readonly string[];
  steps: KdsProductionViewSmokeEra175Step[];
  honestyNote: string;
};

export function auditKdsProductionViewSmokeEra175Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditKdsProductionViewSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, KDS_PRODUCTION_VIEW_ERA175_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveKdsProductionViewSmokeEra175ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): KdsProductionViewSmokeEra175ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildKdsProductionViewSmokeEra175Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): KdsProductionViewSmokeEra175Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveKdsProductionViewSmokeEra175ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: KdsProductionViewSmokeEra175Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: KdsProductionViewSmokeEra175Step[] = [
    {
      id: "wiring_audit",
      label: "Active tickets → station load → bottleneck detection → kitchen ETA",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 175 KDS Production View cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era100)",
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
          ? "Canonical era100 smoke PASSED"
          : liveSmokeOverall
            ? `era100 artifact overall: ${liveSmokeOverall}`
            : "No era100 artifact — run npm run smoke:kds-production-view-era100",
    },
  ];

  return {
    version: KDS_PRODUCTION_VIEW_ERA175_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: KDS_PRODUCTION_VIEW_ERA175_ROUTE,
    capabilities: KDS_PRODUCTION_VIEW_ERA175_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live rush-hour proof requires staging tenant with active tickets.",
  };
}

export function formatKdsProductionViewSmokeEra175ReportLines(
  summary: KdsProductionViewSmokeEra175Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era100): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
