/**
 * POS Hardware Compatibility summary — Round 2 doc audit (Era 172).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_HARDWARE_COMPATIBILITY_ERA172_CANONICAL_SUMMARY_ARTIFACT,
  POS_HARDWARE_COMPATIBILITY_ERA172_CAPABILITIES,
  POS_HARDWARE_COMPATIBILITY_ERA172_POLICY_ID,
  POS_HARDWARE_COMPATIBILITY_ERA172_REQUIRED_VENDORS,
} from "@/lib/pos/pos-hardware-compatibility-era172-policy";
import { auditPosHardwareCompatibilitySmokeWiring } from "@/lib/pos/pos-hardware-compatibility-smoke-summary";

export const POS_HARDWARE_COMPATIBILITY_ERA172_SMOKE_SUMMARY_VERSION =
  POS_HARDWARE_COMPATIBILITY_ERA172_POLICY_ID;

export type PosHardwareCompatibilitySmokeEra172Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosHardwareCompatibilitySmokeEra172ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosHardwareCompatibilitySmokeEra172Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosHardwareCompatibilitySmokeEra172Summary = {
  version: typeof POS_HARDWARE_COMPATIBILITY_ERA172_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosHardwareCompatibilitySmokeEra172Overall;
  proofStatus: PosHardwareCompatibilitySmokeEra172ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  requiredVendors: readonly string[];
  capabilities: readonly string[];
  steps: PosHardwareCompatibilitySmokeEra172Step[];
  honestyNote: string;
};

export function auditPosHardwareCompatibilitySmokeEra172Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditPosHardwareCompatibilitySmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, POS_HARDWARE_COMPATIBILITY_ERA172_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolvePosHardwareCompatibilitySmokeEra172ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosHardwareCompatibilitySmokeEra172ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosHardwareCompatibilitySmokeEra172Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): PosHardwareCompatibilitySmokeEra172Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolvePosHardwareCompatibilitySmokeEra172ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosHardwareCompatibilitySmokeEra172Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosHardwareCompatibilitySmokeEra172Step[] = [
    {
      id: "wiring_audit",
      label:
        "hardware-compatibility.md ↔ pos-hardware-certification.ts ↔ in-app hardware matrix",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 172 POS Hardware Compatibility doc cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era97)",
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
          ? "Canonical era97 smoke PASSED"
          : liveSmokeOverall
            ? `era97 artifact overall: ${liveSmokeOverall}`
            : "No era97 artifact — run npm run smoke:pos-hardware-compatibility-era97",
    },
  ];

  return {
    version: POS_HARDWARE_COMPATIBILITY_ERA172_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    requiredVendors: POS_HARDWARE_COMPATIBILITY_ERA172_REQUIRED_VENDORS,
    capabilities: POS_HARDWARE_COMPATIBILITY_ERA172_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies doc ↔ code catalog alignment — physical device proof requires field deployment.",
  };
}

export function formatPosHardwareCompatibilitySmokeEra172ReportLines(
  summary: PosHardwareCompatibilitySmokeEra172Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era97): ${summary.liveSmokeOverall ?? "not run"}`,
    `Required vendors: ${summary.requiredVendors.join(", ")}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
