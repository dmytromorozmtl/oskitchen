/**
 * Handheld POS terminal smoke summary — wiring audit (Era 96).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_HANDHELD_TERMINAL_ERA96_KDS_ROUTE,
  POS_HANDHELD_TERMINAL_ERA96_MIN_TOUCH_PX,
  POS_HANDHELD_TERMINAL_ERA96_POLICY_ID,
  POS_HANDHELD_TERMINAL_ERA96_WIRING_PATHS,
} from "@/lib/pos/pos-handheld-terminal-era96-policy";

export const POS_HANDHELD_TERMINAL_SMOKE_SUMMARY_VERSION = POS_HANDHELD_TERMINAL_ERA96_POLICY_ID;

export type PosHandheldTerminalSmokeEra96Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosHandheldTerminalSmokeEra96ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosHandheldTerminalSmokeEra96Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosHandheldTerminalSmokeEra96Summary = {
  version: typeof POS_HANDHELD_TERMINAL_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosHandheldTerminalSmokeEra96Overall;
  proofStatus: PosHandheldTerminalSmokeEra96ProofStatus;
  wiringCertPassed: boolean;
  kdsRoute: string;
  minTouchPx: number;
  steps: PosHandheldTerminalSmokeEra96Step[];
  honestyNote: string;
};

export function auditPosHandheldTerminalSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of POS_HANDHELD_TERMINAL_ERA96_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === "components/pos/handheld-ordering-client.tsx") {
      if (!src.includes("fireHandheldToKdsAction")) {
        failures.push("handheld-ordering-client.tsx missing fireHandheldToKdsAction");
      }
      if (!src.includes("handheld-fire-kds")) {
        failures.push("handheld-ordering-client.tsx missing Fire to KDS button");
      }
      if (!src.includes("handheld-kds-link")) {
        failures.push("handheld-ordering-client.tsx missing KDS link");
      }
      if (!src.includes("handheld-table-tile")) {
        failures.push("handheld-ordering-client.tsx missing table selection tiles");
      }
    }

    if (rel === "services/pos/handheld-kds-fire-service.ts") {
      if (!src.includes("fireHandheldOrderToKds")) {
        failures.push("handheld-kds-fire-service.ts missing fireHandheldOrderToKds");
      }
      if (!src.includes("enqueueKitchenRoutingForPosOrder")) {
        failures.push("handheld-kds-fire-service.ts missing kitchen routing");
      }
    }

    if (rel === "actions/pos/handheld.ts") {
      if (!src.includes("fireHandheldToKdsAction")) {
        failures.push("actions/pos/handheld.ts missing fireHandheldToKdsAction");
      }
    }

    if (rel === "lib/pos/handheld-ordering.ts") {
      if (!src.includes("HANDHELD_KDS_ROUTE")) {
        failures.push("handheld-ordering.ts missing HANDHELD_KDS_ROUTE");
      }
      if (!src.includes("findOpenTabForTable")) {
        failures.push("handheld-ordering.ts missing findOpenTabForTable");
      }
    }

    if (rel === "app/dashboard/pos/handheld/manifest.webmanifest/route.ts") {
      if (!src.includes("standalone")) {
        failures.push("handheld manifest missing standalone display mode");
      }
    }

    if (rel === "app/dashboard/pos/handheld/page.tsx") {
      if (!src.includes("HandheldOrderingClient")) {
        failures.push("handheld page missing HandheldOrderingClient");
      }
    }

    if (rel === "services/pos/handheld-ordering-service.ts") {
      if (!src.includes("loadHandheldOrderingBootstrap")) {
        failures.push("handheld-ordering-service.ts missing bootstrap loader");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolvePosHandheldTerminalSmokeEra96ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosHandheldTerminalSmokeEra96ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosHandheldTerminalSmokeEra96Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): PosHandheldTerminalSmokeEra96Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolvePosHandheldTerminalSmokeEra96ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosHandheldTerminalSmokeEra96Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosHandheldTerminalSmokeEra96Step[] = [
    {
      id: "wiring_audit",
      label: "Table select → cart build → fire to KDS → tab sync → offline cash checkout",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 96 Handheld POS terminal cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: POS_HANDHELD_TERMINAL_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    kdsRoute: POS_HANDHELD_TERMINAL_ERA96_KDS_ROUTE,
    minTouchPx: POS_HANDHELD_TERMINAL_ERA96_MIN_TOUCH_PX,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live tableside proof requires physical handheld device on floor.",
  };
}

export function formatPosHandheldTerminalSmokeEra96ReportLines(
  summary: PosHandheldTerminalSmokeEra96Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `KDS route: ${summary.kdsRoute}`,
    `Min touch target: ${summary.minTouchPx}px`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
