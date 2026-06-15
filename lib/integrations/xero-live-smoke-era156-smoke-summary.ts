/**
 * Xero LIVE integration summary — wiring audit (Era 156).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  XERO_LIVE_SMOKE_ERA156_CANONICAL_SUMMARY_ARTIFACT,
  XERO_LIVE_SMOKE_ERA156_CAPABILITIES,
  XERO_LIVE_SMOKE_ERA156_POLICY_ID,
} from "@/lib/integrations/xero-live-smoke-era156-policy";
import { auditXeroLiveSmokeWiring } from "@/lib/integrations/xero-live-smoke-summary";

export const XERO_LIVE_SMOKE_ERA156_SMOKE_SUMMARY_VERSION = XERO_LIVE_SMOKE_ERA156_POLICY_ID;

export type XeroLiveSmokeEra156Overall = "PASSED" | "FAILED" | "SKIPPED";

export type XeroLiveSmokeEra156ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type XeroLiveSmokeEra156Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type XeroLiveSmokeEra156Summary = {
  version: typeof XERO_LIVE_SMOKE_ERA156_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: XeroLiveSmokeEra156Overall;
  proofStatus: XeroLiveSmokeEra156ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: XeroLiveSmokeEra156Step[];
  honestyNote: string;
};

export function auditXeroLiveSmokeEra156Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditXeroLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, XERO_LIVE_SMOKE_ERA156_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveXeroLiveSmokeEra156ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): XeroLiveSmokeEra156ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildXeroLiveSmokeEra156Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): XeroLiveSmokeEra156Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveXeroLiveSmokeEra156ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: XeroLiveSmokeEra156Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: XeroLiveSmokeEra156Step[] = [
    {
      id: "wiring_audit",
      label: "Xero OAuth → invoice sync → bank reconciliation wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 156 Xero LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era81)",
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
          ? "Live demo org OAuth path PASSED"
          : liveSmokeOverall
            ? `era81 artifact overall: ${liveSmokeOverall} — run npm run smoke:xero-live with real tenant`
            : "No era81 artifact — run npm run smoke:xero-live-era81",
    },
  ];

  return {
    version: XERO_LIVE_SMOKE_ERA156_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: XERO_LIVE_SMOKE_ERA156_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Xero OAuth → invoice sync → bank reconciliation wiring — live proof requires Xero demo org + DATABASE_URL.",
  };
}

export function formatXeroLiveSmokeEra156ReportLines(
  summary: XeroLiveSmokeEra156Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era81): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
