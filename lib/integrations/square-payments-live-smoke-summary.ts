/**
 * Square Payments live smoke summary — wiring audit + payments proof (Era 87).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_WIRING_PATHS,
} from "@/lib/integrations/square-payments-live-smoke-era87-policy";

export const SQUARE_PAYMENTS_LIVE_SMOKE_SUMMARY_VERSION =
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID;

export type SquarePaymentsLiveSmokeEra87Overall = "PASSED" | "FAILED" | "SKIPPED";

export type SquarePaymentsLiveSmokeEra87ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_token"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type SquarePaymentsLiveSmokeEra87Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type SquarePaymentsLiveSmokeEra87Summary = {
  version: typeof SQUARE_PAYMENTS_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: SquarePaymentsLiveSmokeEra87Overall;
  proofStatus: SquarePaymentsLiveSmokeEra87ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: SquarePaymentsLiveSmokeEra87Overall | null;
  missingEnvVars: string[];
  steps: SquarePaymentsLiveSmokeEra87Step[];
  honestyNote: string;
};

export function isPlaceholderSquarePaymentsAccessToken(accessToken: string): boolean {
  const normalized = accessToken.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized.endsWith(".local")
  );
}

export function auditSquarePaymentsLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/square-payments/payment-processing.service.ts") {
      if (!src.includes("processSquarePayment")) {
        failures.push("payment-processing.service.ts missing processSquarePayment");
      }
    }
    if (rel === "services/integrations/square-payments/refund-sync.service.ts") {
      if (!src.includes("syncSquareRefunds")) {
        failures.push("refund-sync.service.ts missing syncSquareRefunds");
      }
    }
    if (rel === "services/integrations/square-payments/square-payments-api.ts") {
      if (!src.includes("createSquarePaymentApi")) {
        failures.push("square-payments-api.ts missing createSquarePaymentApi");
      }
      if (!src.includes("listSquareRefundsApi")) {
        failures.push("square-payments-api.ts missing listSquareRefundsApi");
      }
    }
    if (rel === "scripts/smoke-square-payments-live.ts") {
      if (!src.includes("payment_processing_wiring")) {
        failures.push("smoke-square-payments-live.ts missing payment_processing_wiring step");
      }
      if (!src.includes("refund_sync_wiring")) {
        failures.push("smoke-square-payments-live.ts missing refund_sync_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveSquarePaymentsLiveSmokeEra87ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: SquarePaymentsLiveSmokeEra87Overall | null;
  liveProofStatus?: string;
}): SquarePaymentsLiveSmokeEra87ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  if (input.liveProofStatus === "proof_skipped_missing_prerequisites") {
    return "proof_skipped_missing_prerequisites";
  }
  if (input.liveProofStatus === "proof_skipped_placeholder_token") {
    return "proof_skipped_placeholder_token";
  }
  if (input.liveOverall === "PASSED") return "proof_passed";
  if (input.liveOverall === "SKIPPED") return "proof_skipped_missing_prerequisites";
  if (input.liveOverall === "FAILED") return "proof_failed";
  return "proof_skipped_placeholder_token";
}

export function resolveSquarePaymentsLiveSmokeEra87Overall(
  proofStatus: SquarePaymentsLiveSmokeEra87ProofStatus,
): SquarePaymentsLiveSmokeEra87Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_token"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildSquarePaymentsLiveSmokeEra87Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: SquarePaymentsLiveSmokeEra87Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: SquarePaymentsLiveSmokeEra87Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): SquarePaymentsLiveSmokeEra87Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveSquarePaymentsLiveSmokeEra87ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveSquarePaymentsLiveSmokeEra87Overall(proofStatus);

  const steps: SquarePaymentsLiveSmokeEra87Step[] = [
    {
      id: "wiring_audit",
      label: "Square Payments → payment processing → refund sync wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 87 Square Payments live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_oauth_payment_refund",
      label: "Live OAuth → payment processing → refund sync",
      status:
        input.liveSmoke.overall === "PASSED"
          ? "PASSED"
          : input.liveSmoke.overall === "SKIPPED"
            ? "SKIPPED"
            : "FAILED",
      reason:
        input.liveSmoke.steps.find((s) => s.status === "FAILED")?.reason ??
        input.liveSmoke.steps.find((s) => s.status === "SKIPPED")?.reason,
    });
  }

  return {
    version: SQUARE_PAYMENTS_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live Square OAuth + locations list + refund sync wiring — payment charge skipped without sandbox source_id.",
  };
}

export function formatSquarePaymentsLiveSmokeEra87ReportLines(
  summary: SquarePaymentsLiveSmokeEra87Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke: ${summary.liveSmokeOverall ?? "not run"}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
