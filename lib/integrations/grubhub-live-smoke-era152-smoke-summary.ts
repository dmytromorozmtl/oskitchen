/**
 * Grubhub LIVE integration summary — wiring audit (Era 152).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  GRUBHUB_LIVE_SMOKE_ERA152_CANONICAL_SUMMARY_ARTIFACT,
  GRUBHUB_LIVE_SMOKE_ERA152_CAPABILITIES,
  GRUBHUB_LIVE_SMOKE_ERA152_POLICY_ID,
} from "@/lib/integrations/grubhub-live-smoke-era152-policy";
import { auditGrubhubLiveSmokeWiring } from "@/lib/integrations/grubhub-live-smoke-summary";

export const GRUBHUB_LIVE_SMOKE_ERA152_SMOKE_SUMMARY_VERSION =
  GRUBHUB_LIVE_SMOKE_ERA152_POLICY_ID;

export type GrubhubLiveSmokeEra152Overall = "PASSED" | "FAILED" | "SKIPPED";

export type GrubhubLiveSmokeEra152ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type GrubhubLiveSmokeEra152Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type GrubhubLiveSmokeEra152Summary = {
  version: typeof GRUBHUB_LIVE_SMOKE_ERA152_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: GrubhubLiveSmokeEra152Overall;
  proofStatus: GrubhubLiveSmokeEra152ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: GrubhubLiveSmokeEra152Step[];
  honestyNote: string;
};

export function auditGrubhubLiveSmokeEra152Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditGrubhubLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, GRUBHUB_LIVE_SMOKE_ERA152_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveGrubhubLiveSmokeEra152ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): GrubhubLiveSmokeEra152ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildGrubhubLiveSmokeEra152Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): GrubhubLiveSmokeEra152Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveGrubhubLiveSmokeEra152ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: GrubhubLiveSmokeEra152Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: GrubhubLiveSmokeEra152Step[] = [
    {
      id: "wiring_audit",
      label: "Grubhub OAuth → webhook → menu sync → KDS wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 152 Grubhub LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era78)",
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
          ? "Live partner sandbox path PASSED"
          : liveSmokeOverall
            ? `era78 artifact overall: ${liveSmokeOverall} — run npm run smoke:grubhub-live with real merchant ID`
            : "No era78 artifact — run npm run smoke:grubhub-live-era78",
    },
  ];

  return {
    version: GRUBHUB_LIVE_SMOKE_ERA152_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: GRUBHUB_LIVE_SMOKE_ERA152_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Grubhub → webhook → menu sync → KDS wiring — live proof requires partner sandbox merchant ID.",
  };
}

export function formatGrubhubLiveSmokeEra152ReportLines(
  summary: GrubhubLiveSmokeEra152Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era78): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
