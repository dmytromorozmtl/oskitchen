/**
 * KDS Multi-Station smoke summary — wiring audit (Era 104).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_MULTI_STATION_ERA104_FOOD_TYPES,
  KDS_MULTI_STATION_ERA104_MIN_STATIONS,
  KDS_MULTI_STATION_ERA104_POLICY_ID,
  KDS_MULTI_STATION_ERA104_WIRING_PATHS,
} from "@/lib/kitchen/kds-multi-station-era104-policy";

export const KDS_MULTI_STATION_SMOKE_SUMMARY_VERSION = KDS_MULTI_STATION_ERA104_POLICY_ID;

export type KdsMultiStationSmokeEra104Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KdsMultiStationSmokeEra104ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KdsMultiStationSmokeEra104Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KdsMultiStationSmokeEra104Summary = {
  version: typeof KDS_MULTI_STATION_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KdsMultiStationSmokeEra104Overall;
  proofStatus: KdsMultiStationSmokeEra104ProofStatus;
  wiringCertPassed: boolean;
  minStations: number;
  foodTypes: readonly string[];
  steps: KdsMultiStationSmokeEra104Step[];
  honestyNote: string;
};

export function auditKdsMultiStationSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of KDS_MULTI_STATION_ERA104_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === "services/kitchen/multi-station-service.ts") {
      if (!src.includes("loadKdsStationRegistry")) {
        failures.push("multi-station-service.ts missing loadKdsStationRegistry");
      }
      if (!src.includes("loadKdsMultiStationSnapshot")) {
        failures.push("multi-station-service.ts missing loadKdsMultiStationSnapshot");
      }
      if (!src.includes("loadKdsProductionViewWithRouting")) {
        failures.push("multi-station-service.ts missing loadKdsProductionViewWithRouting");
      }
      if (!src.includes("routeKdsWorkItemsForUser")) {
        failures.push("multi-station-service.ts missing routeKdsWorkItemsForUser");
      }
    }

    if (rel === "lib/kitchen/kds-multi-station.ts") {
      if (!src.includes("routeKdsWorkItemToStation")) {
        failures.push("kds-multi-station.ts missing routeKdsWorkItemToStation");
      }
      if (!src.includes("buildKdsMultiStationSnapshot")) {
        failures.push("kds-multi-station.ts missing buildKdsMultiStationSnapshot");
      }
      if (!src.includes("applyKdsMultiStationRouting")) {
        failures.push("kds-multi-station.ts missing applyKdsMultiStationRouting");
      }
      if (!src.includes("mergeStationRegistry")) {
        failures.push("kds-multi-station.ts missing mergeStationRegistry");
      }
    }

    if (rel === "lib/kitchen/kds-multi-station-policy.ts") {
      if (!src.includes("KDS_MULTI_STATION_MIN_STATIONS")) {
        failures.push("kds-multi-station-policy.ts missing min stations constant");
      }
      if (!src.includes("DEFAULT_KDS_STATIONS")) {
        failures.push("kds-multi-station-policy.ts missing DEFAULT_KDS_STATIONS");
      }
      if (!src.includes("KDS_CATEGORY_FOOD_TYPE_MAP")) {
        failures.push("kds-multi-station-policy.ts missing category food type map");
      }
    }

    if (rel === "components/kitchen/production-view-client.tsx") {
      if (!src.includes("kds-multi-station-count")) {
        failures.push("production-view-client.tsx missing multi-station count badge");
      }
      if (!src.includes("KDS_MULTI_STATION_MIN_STATIONS")) {
        failures.push("production-view-client.tsx missing min stations gate");
      }
    }

    if (rel === "services/kitchen/expo-view-service.ts") {
      if (!src.includes("routeKdsWorkItemToStation")) {
        failures.push("expo-view-service.ts missing food-type routing");
      }
      if (!src.includes("loadKdsStationRegistry")) {
        failures.push("expo-view-service.ts missing station registry loader");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveKdsMultiStationSmokeEra104ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): KdsMultiStationSmokeEra104ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildKdsMultiStationSmokeEra104Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): KdsMultiStationSmokeEra104Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveKdsMultiStationSmokeEra104ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: KdsMultiStationSmokeEra104Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: KdsMultiStationSmokeEra104Step[] = [
    {
      id: "wiring_audit",
      label: "12-station registry → food-type routing → production + expo views",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 104 KDS Multi-Station cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: KDS_MULTI_STATION_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    minStations: KDS_MULTI_STATION_ERA104_MIN_STATIONS,
    foodTypes: KDS_MULTI_STATION_ERA104_FOOD_TYPES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live multi-station proof requires staging tenant with configured production stations.",
  };
}

export function formatKdsMultiStationSmokeEra104ReportLines(
  summary: KdsMultiStationSmokeEra104Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Min stations: ${summary.minStations}+`,
    `Food types: ${summary.foodTypes.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
