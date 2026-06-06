/**
 * OpenTable live smoke summary — wiring audit + reservation/availability proof (Era 89).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID,
  OPENTABLE_LIVE_SMOKE_ERA89_WIRING_PATHS,
} from "@/lib/integrations/opentable-live-smoke-era89-policy";

export const OPENTABLE_LIVE_SMOKE_SUMMARY_VERSION = OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID;

export type OpenTableLiveSmokeEra89Overall = "PASSED" | "FAILED" | "SKIPPED";

export type OpenTableLiveSmokeEra89ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_token"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type OpenTableLiveSmokeEra89Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type OpenTableLiveSmokeEra89Summary = {
  version: typeof OPENTABLE_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: OpenTableLiveSmokeEra89Overall;
  proofStatus: OpenTableLiveSmokeEra89ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: OpenTableLiveSmokeEra89Overall | null;
  missingEnvVars: string[];
  steps: OpenTableLiveSmokeEra89Step[];
  honestyNote: string;
};

export function isPlaceholderOpenTableAccessToken(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized.endsWith(".local")
  );
}

export function isPlaceholderOpenTableRestaurantId(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized === "rid000" ||
    normalized === "0"
  );
}

export function auditOpenTableLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of OPENTABLE_LIVE_SMOKE_ERA89_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/opentable/reservation-webhook.service.ts") {
      if (!src.includes("processOpenTableReservationWebhook")) {
        failures.push("reservation-webhook.service.ts missing processOpenTableReservationWebhook");
      }
    }
    if (rel === "services/integrations/opentable/table-availability.service.ts") {
      if (!src.includes("syncOpenTableAvailability")) {
        failures.push("table-availability.service.ts missing syncOpenTableAvailability");
      }
    }
    if (rel === "scripts/smoke-opentable-live.ts") {
      if (!src.includes("reservation_webhook_wiring")) {
        failures.push("smoke-opentable-live.ts missing reservation_webhook_wiring step");
      }
      if (!src.includes("table_availability_wiring")) {
        failures.push("smoke-opentable-live.ts missing table_availability_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveOpenTableLiveSmokeEra89ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: OpenTableLiveSmokeEra89Overall | null;
  liveProofStatus?: string;
}): OpenTableLiveSmokeEra89ProofStatus {
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

export function resolveOpenTableLiveSmokeEra89Overall(
  proofStatus: OpenTableLiveSmokeEra89ProofStatus,
): OpenTableLiveSmokeEra89Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_token"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildOpenTableLiveSmokeEra89Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: OpenTableLiveSmokeEra89Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: OpenTableLiveSmokeEra89Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): OpenTableLiveSmokeEra89Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveOpenTableLiveSmokeEra89ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveOpenTableLiveSmokeEra89Overall(proofStatus);

  const steps: OpenTableLiveSmokeEra89Step[] = [
    {
      id: "wiring_audit",
      label: "OpenTable → reservation webhook → table availability wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 89 OpenTable live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_reservation_availability",
      label: "Live OAuth → reservation webhook → table availability",
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
    version: OPENTABLE_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live OpenTable OAuth + availability API ping — live reservation webhook delivery requires sandbox webhook secret.",
  };
}

export function formatOpenTableLiveSmokeEra89ReportLines(
  summary: OpenTableLiveSmokeEra89Summary,
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
