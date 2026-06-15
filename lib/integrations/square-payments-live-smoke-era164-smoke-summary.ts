/**
 * Square Payments LIVE integration summary — wiring audit (Era 164).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CANONICAL_SUMMARY_ARTIFACT,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CAPABILITIES,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_POLICY_ID,
} from "@/lib/integrations/square-payments-live-smoke-era164-policy";
import { auditSquarePaymentsLiveSmokeWiring } from "@/lib/integrations/square-payments-live-smoke-summary";

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_SMOKE_SUMMARY_VERSION =
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_POLICY_ID;

export type SquarePaymentsLiveSmokeEra164Overall = "PASSED" | "FAILED" | "SKIPPED";

export type SquarePaymentsLiveSmokeEra164ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type SquarePaymentsLiveSmokeEra164Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type SquarePaymentsLiveSmokeEra164Summary = {
  version: typeof SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: SquarePaymentsLiveSmokeEra164Overall;
  proofStatus: SquarePaymentsLiveSmokeEra164ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: SquarePaymentsLiveSmokeEra164Step[];
  honestyNote: string;
};

export function auditSquarePaymentsLiveSmokeEra164Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditSquarePaymentsLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveSquarePaymentsLiveSmokeEra164ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): SquarePaymentsLiveSmokeEra164ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildSquarePaymentsLiveSmokeEra164Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): SquarePaymentsLiveSmokeEra164Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveSquarePaymentsLiveSmokeEra164ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: SquarePaymentsLiveSmokeEra164Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: SquarePaymentsLiveSmokeEra164Step[] = [
    {
      id: "wiring_audit",
      label: "Square OAuth → payment processing → refund sync wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 164 Square Payments LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era87)",
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
            ? `era87 artifact overall: ${liveSmokeOverall} — run npm run smoke:square-payments-live with real token`
            : "No era87 artifact — run npm run smoke:square-payments-live-era87",
    },
  ];

  return {
    version: SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Square OAuth → payment processing → refund sync wiring — live proof requires sandbox merchant + DATABASE_URL.",
  };
}

export function formatSquarePaymentsLiveSmokeEra164ReportLines(
  summary: SquarePaymentsLiveSmokeEra164Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era87): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
