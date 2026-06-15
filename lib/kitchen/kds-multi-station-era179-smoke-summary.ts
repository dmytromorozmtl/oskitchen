/**
 * KDS Multi-Station summary — Round 2 wiring audit (Era 179).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_MULTI_STATION_ERA179_CANONICAL_SUMMARY_ARTIFACT,
  KDS_MULTI_STATION_ERA179_CAPABILITIES,
  KDS_MULTI_STATION_ERA179_FOOD_TYPES,
  KDS_MULTI_STATION_ERA179_MIN_STATIONS,
  KDS_MULTI_STATION_ERA179_POLICY_ID,
} from "@/lib/kitchen/kds-multi-station-era179-policy";
import { auditKdsMultiStationSmokeWiring } from "@/lib/kitchen/kds-multi-station-smoke-summary";

export const KDS_MULTI_STATION_ERA179_SMOKE_SUMMARY_VERSION = KDS_MULTI_STATION_ERA179_POLICY_ID;

export type KdsMultiStationSmokeEra179Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KdsMultiStationSmokeEra179ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KdsMultiStationSmokeEra179Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KdsMultiStationSmokeEra179Summary = {
  version: typeof KDS_MULTI_STATION_ERA179_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KdsMultiStationSmokeEra179Overall;
  proofStatus: KdsMultiStationSmokeEra179ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  minStations: number;
  foodTypes: readonly string[];
  capabilities: readonly string[];
  steps: KdsMultiStationSmokeEra179Step[];
  honestyNote: string;
};

export function auditKdsMultiStationSmokeEra179Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditKdsMultiStationSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, KDS_MULTI_STATION_ERA179_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveKdsMultiStationSmokeEra179ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): KdsMultiStationSmokeEra179ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildKdsMultiStationSmokeEra179Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): KdsMultiStationSmokeEra179Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveKdsMultiStationSmokeEra179ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: KdsMultiStationSmokeEra179Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: KdsMultiStationSmokeEra179Step[] = [
    {
      id: "wiring_audit",
      label: "12-station registry → food-type routing → production + expo views",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 179 KDS Multi-Station cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era104)",
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
          ? "Canonical era104 smoke PASSED"
          : liveSmokeOverall
            ? `era104 artifact overall: ${liveSmokeOverall}`
            : "No era104 artifact — run npm run smoke:kds-multi-station-era104",
    },
  ];

  return {
    version: KDS_MULTI_STATION_ERA179_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    minStations: KDS_MULTI_STATION_ERA179_MIN_STATIONS,
    foodTypes: KDS_MULTI_STATION_ERA179_FOOD_TYPES,
    capabilities: KDS_MULTI_STATION_ERA179_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live multi-station proof requires staging tenant with configured production stations.",
  };
}

export function formatKdsMultiStationSmokeEra179ReportLines(
  summary: KdsMultiStationSmokeEra179Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era104): ${summary.liveSmokeOverall ?? "not run"}`,
    `Min stations: ${summary.minStations}+`,
    `Food types: ${summary.foodTypes.join(", ")}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
