/**
 * Resy live smoke summary — wiring audit + reservation/waitlist proof (Era 90).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  RESY_LIVE_SMOKE_ERA90_POLICY_ID,
  RESY_LIVE_SMOKE_ERA90_WIRING_PATHS,
} from "@/lib/integrations/resy-live-smoke-era90-policy";

export const RESY_LIVE_SMOKE_SUMMARY_VERSION = RESY_LIVE_SMOKE_ERA90_POLICY_ID;

export type ResyLiveSmokeEra90Overall = "PASSED" | "FAILED" | "SKIPPED";

export type ResyLiveSmokeEra90ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_token"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type ResyLiveSmokeEra90Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type ResyLiveSmokeEra90Summary = {
  version: typeof RESY_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: ResyLiveSmokeEra90Overall;
  proofStatus: ResyLiveSmokeEra90ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: ResyLiveSmokeEra90Overall | null;
  missingEnvVars: string[];
  steps: ResyLiveSmokeEra90Step[];
  honestyNote: string;
};

export function isPlaceholderResyAccessToken(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized.endsWith(".local")
  );
}

export function isPlaceholderResyVenueId(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized === "venue000" ||
    normalized === "0"
  );
}

export function auditResyLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of RESY_LIVE_SMOKE_ERA90_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/resy/reservation-sync.service.ts") {
      if (!src.includes("syncResyReservations")) {
        failures.push("reservation-sync.service.ts missing syncResyReservations");
      }
    }
    if (rel === "services/integrations/resy/waitlist-sync.service.ts") {
      if (!src.includes("syncResyWaitlist")) {
        failures.push("waitlist-sync.service.ts missing syncResyWaitlist");
      }
    }
    if (rel === "scripts/smoke-resy-live.ts") {
      if (!src.includes("reservation_webhook_wiring")) {
        failures.push("smoke-resy-live.ts missing reservation_webhook_wiring step");
      }
      if (!src.includes("waitlist_sync_wiring")) {
        failures.push("smoke-resy-live.ts missing waitlist_sync_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveResyLiveSmokeEra90ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: ResyLiveSmokeEra90Overall | null;
  liveProofStatus?: string;
}): ResyLiveSmokeEra90ProofStatus {
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

export function resolveResyLiveSmokeEra90Overall(
  proofStatus: ResyLiveSmokeEra90ProofStatus,
): ResyLiveSmokeEra90Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_token"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildResyLiveSmokeEra90Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: ResyLiveSmokeEra90Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: ResyLiveSmokeEra90Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): ResyLiveSmokeEra90Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveResyLiveSmokeEra90ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveResyLiveSmokeEra90Overall(proofStatus);

  const steps: ResyLiveSmokeEra90Step[] = [
    {
      id: "wiring_audit",
      label: "Resy → reservation sync → waitlist wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 90 Resy live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_reservation_waitlist",
      label: "Live OAuth → reservation webhook → waitlist sync",
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
    version: RESY_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live Resy OAuth + waitlist API ping — full reservation import requires linked storefront.",
  };
}

export function formatResyLiveSmokeEra90ReportLines(
  summary: ResyLiveSmokeEra90Summary,
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
