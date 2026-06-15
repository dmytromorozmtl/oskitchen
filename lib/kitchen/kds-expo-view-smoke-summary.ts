/**
 * KDS Expo View smoke summary — wiring audit (Era 101).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_EXPO_VIEW_ERA101_LANES,
  KDS_EXPO_VIEW_ERA101_POLICY_ID,
  KDS_EXPO_VIEW_ERA101_ROUTE,
  KDS_EXPO_VIEW_ERA101_WIRING_PATHS,
} from "@/lib/kitchen/kds-expo-view-era101-policy";

export const KDS_EXPO_VIEW_SMOKE_SUMMARY_VERSION = KDS_EXPO_VIEW_ERA101_POLICY_ID;

export type KdsExpoViewSmokeEra101Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KdsExpoViewSmokeEra101ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KdsExpoViewSmokeEra101Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KdsExpoViewSmokeEra101Summary = {
  version: typeof KDS_EXPO_VIEW_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KdsExpoViewSmokeEra101Overall;
  proofStatus: KdsExpoViewSmokeEra101ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  lanes: readonly string[];
  steps: KdsExpoViewSmokeEra101Step[];
  honestyNote: string;
};

export function auditKdsExpoViewSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of KDS_EXPO_VIEW_ERA101_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === "lib/kitchen/kds-expo-view.ts") {
      if (!src.includes("buildExpoViewSnapshot")) {
        failures.push("kds-expo-view.ts missing buildExpoViewSnapshot");
      }
      if (!src.includes("resolveExpoLane")) {
        failures.push("kds-expo-view.ts missing resolveExpoLane");
      }
      for (const lane of KDS_EXPO_VIEW_ERA101_LANES) {
        if (!src.includes(`"${lane}"`)) {
          failures.push(`kds-expo-view.ts missing lane ${lane}`);
        }
      }
    }

    if (rel === "components/kitchen/expo-view-client.tsx") {
      if (!src.includes("kds-expo-view-root")) {
        failures.push("expo-view-client.tsx missing root test id");
      }
      if (!src.includes("kds-expo-lane-${")) {
        failures.push("expo-view-client.tsx missing lane test id template");
      }
      for (const lane of KDS_EXPO_VIEW_ERA101_LANES) {
        if (!src.includes(`${lane}:`)) {
          failures.push(`expo-view-client.tsx missing lane meta for ${lane}`);
        }
      }
      if (!src.includes("kds-expo-ticket")) {
        failures.push("expo-view-client.tsx missing ticket cards");
      }
    }

    if (rel === "app/dashboard/kitchen/expo/page.tsx") {
      if (!src.includes("ExpoViewClient")) {
        failures.push("expo page missing ExpoViewClient");
      }
      if (!src.includes("loadKdsExpoView")) {
        failures.push("expo page missing loadKdsExpoView");
      }
    }

    if (rel === "lib/kitchen/kds-expo-view-policy.ts") {
      if (!src.includes(KDS_EXPO_VIEW_ERA101_ROUTE)) {
        failures.push("kds-expo-view-policy.ts missing expo route");
      }
    }

    if (rel === "services/kitchen/expo-view-service.ts") {
      if (!src.includes("loadKdsExpoView")) {
        failures.push("expo-view-service.ts missing loadKdsExpoView");
      }
      if (!src.includes("buildExpoViewSnapshot")) {
        failures.push("expo-view-service.ts missing buildExpoViewSnapshot");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveKdsExpoViewSmokeEra101ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): KdsExpoViewSmokeEra101ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildKdsExpoViewSmokeEra101Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): KdsExpoViewSmokeEra101Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveKdsExpoViewSmokeEra101ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: KdsExpoViewSmokeEra101Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: KdsExpoViewSmokeEra101Step[] = [
    {
      id: "wiring_audit",
      label: "Order tickets → ready / waiting / delayed lanes → expo handoff UI",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 101 KDS Expo View cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: KDS_EXPO_VIEW_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: KDS_EXPO_VIEW_ERA101_ROUTE,
    lanes: KDS_EXPO_VIEW_ERA101_LANES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live expo proof requires staging tenant with bumped tickets.",
  };
}

export function formatKdsExpoViewSmokeEra101ReportLines(
  summary: KdsExpoViewSmokeEra101Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Lanes: ${summary.lanes.join(" · ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
