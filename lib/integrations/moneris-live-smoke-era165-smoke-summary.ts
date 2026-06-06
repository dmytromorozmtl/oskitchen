/**
 * Moneris LIVE integration summary — wiring audit (Era 165).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MONERIS_LIVE_SMOKE_ERA165_CANONICAL_SUMMARY_ARTIFACT,
  MONERIS_LIVE_SMOKE_ERA165_CAPABILITIES,
  MONERIS_LIVE_SMOKE_ERA165_POLICY_ID,
} from "@/lib/integrations/moneris-live-smoke-era165-policy";
import { auditMonerisLiveSmokeWiring } from "@/lib/integrations/moneris-live-smoke-summary";

export const MONERIS_LIVE_SMOKE_ERA165_SMOKE_SUMMARY_VERSION = MONERIS_LIVE_SMOKE_ERA165_POLICY_ID;

export type MonerisLiveSmokeEra165Overall = "PASSED" | "FAILED" | "SKIPPED";

export type MonerisLiveSmokeEra165ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type MonerisLiveSmokeEra165Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type MonerisLiveSmokeEra165Summary = {
  version: typeof MONERIS_LIVE_SMOKE_ERA165_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: MonerisLiveSmokeEra165Overall;
  proofStatus: MonerisLiveSmokeEra165ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: MonerisLiveSmokeEra165Step[];
  honestyNote: string;
};

export function auditMonerisLiveSmokeEra165Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditMonerisLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, MONERIS_LIVE_SMOKE_ERA165_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveMonerisLiveSmokeEra165ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): MonerisLiveSmokeEra165ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildMonerisLiveSmokeEra165Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): MonerisLiveSmokeEra165Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveMonerisLiveSmokeEra165ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: MonerisLiveSmokeEra165Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: MonerisLiveSmokeEra165Step[] = [
    {
      id: "wiring_audit",
      label: "Moneris OAuth → gateway verify → payment gateway wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 165 Moneris LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era88)",
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
          ? "Live sandbox OAuth path PASSED"
          : liveSmokeOverall
            ? `era88 artifact overall: ${liveSmokeOverall} — run npm run smoke:moneris-live with real credentials`
            : "No era88 artifact — run npm run smoke:moneris-live-era88",
    },
  ];

  return {
    version: MONERIS_LIVE_SMOKE_ERA165_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: MONERIS_LIVE_SMOKE_ERA165_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Moneris OAuth → payment gateway wiring — live proof requires sandbox store + DATABASE_URL.",
  };
}

export function formatMonerisLiveSmokeEra165ReportLines(
  summary: MonerisLiveSmokeEra165Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era88): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
