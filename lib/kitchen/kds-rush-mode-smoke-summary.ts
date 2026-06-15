/**
 * KDS Rush Mode smoke summary — wiring audit (Era 103).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_RUSH_MODE_ERA103_COMPONENT,
  KDS_RUSH_MODE_ERA103_POLICY_ID,
  KDS_RUSH_MODE_ERA103_RUSH_LEVELS,
  KDS_RUSH_MODE_ERA103_WIRING_PATHS,
} from "@/lib/kitchen/kds-rush-mode-era103-policy";

export const KDS_RUSH_MODE_SMOKE_SUMMARY_VERSION = KDS_RUSH_MODE_ERA103_POLICY_ID;

export type KdsRushModeSmokeEra103Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KdsRushModeSmokeEra103ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KdsRushModeSmokeEra103Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KdsRushModeSmokeEra103Summary = {
  version: typeof KDS_RUSH_MODE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KdsRushModeSmokeEra103Overall;
  proofStatus: KdsRushModeSmokeEra103ProofStatus;
  wiringCertPassed: boolean;
  component: string;
  rushLevels: readonly string[];
  steps: KdsRushModeSmokeEra103Step[];
  honestyNote: string;
};

export function auditKdsRushModeSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of KDS_RUSH_MODE_ERA103_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === KDS_RUSH_MODE_ERA103_COMPONENT) {
      if (!src.includes("RushMode")) {
        failures.push("rush-mode.tsx missing RushMode export");
      }
      if (!src.includes("kds-rush-mode")) {
        failures.push("rush-mode.tsx missing root test id");
      }
      if (!src.includes("kds-rush-level")) {
        failures.push("rush-mode.tsx missing rush level badge");
      }
      if (!src.includes("kds-rush-peak-signals")) {
        failures.push("rush-mode.tsx missing peak signals");
      }
      if (!src.includes("kds-rush-route-")) {
        failures.push("rush-mode.tsx missing priority route cards");
      }
    }

    if (rel === "lib/kitchen/kds-rush-mode.ts") {
      if (!src.includes("buildKdsRushModeSnapshot")) {
        failures.push("kds-rush-mode.ts missing buildKdsRushModeSnapshot");
      }
      if (!src.includes("detectKdsRushLevel")) {
        failures.push("kds-rush-mode.ts missing detectKdsRushLevel");
      }
      if (!src.includes("buildKdsRushPriorityRoutes")) {
        failures.push("kds-rush-mode.ts missing priority routing");
      }
      if (!src.includes("isKdsRushSoundAlertLevel")) {
        failures.push("kds-rush-mode.ts missing sound alert level gate");
      }
    }

    if (rel === "lib/kitchen/kds-rush-mode-policy.ts") {
      if (!src.includes("KDS_RUSH_MODE_POLICY_ID")) {
        failures.push("kds-rush-mode-policy.ts missing policy id");
      }
      if (!src.includes("KDS_RUSH_PEAK_ACTIVE_MIN")) {
        failures.push("kds-rush-mode-policy.ts missing peak threshold");
      }
    }

    if (rel === "lib/kitchen/kds-realtime-sounds.ts") {
      if (!src.includes("playKdsRushModeAlert")) {
        failures.push("kds-realtime-sounds.ts missing playKdsRushModeAlert");
      }
    }

    if (rel === "components/kitchen/kds-daily-service.tsx") {
      if (!src.includes("RushMode")) {
        failures.push("kds-daily-service.tsx missing RushMode mount");
      }
      if (!src.includes("buildKdsRushModeSnapshot")) {
        failures.push("kds-daily-service.tsx missing rush snapshot builder");
      }
      if (!src.includes("playKdsRushModeAlert")) {
        failures.push("kds-daily-service.tsx missing rush sound alert");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveKdsRushModeSmokeEra103ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): KdsRushModeSmokeEra103ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildKdsRushModeSmokeEra103Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): KdsRushModeSmokeEra103Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveKdsRushModeSmokeEra103ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: KdsRushModeSmokeEra103Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: KdsRushModeSmokeEra103Step[] = [
    {
      id: "wiring_audit",
      label: "Peak detection → priority routing → RushMode UI → sound alerts",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 103 KDS Rush Mode cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: KDS_RUSH_MODE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    component: KDS_RUSH_MODE_ERA103_COMPONENT,
    rushLevels: KDS_RUSH_MODE_ERA103_RUSH_LEVELS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live rush proof requires staging tenant with 8+ concurrent tickets.",
  };
}

export function formatKdsRushModeSmokeEra103ReportLines(
  summary: KdsRushModeSmokeEra103Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Component: ${summary.component}`,
    `Rush levels: ${summary.rushLevels.join(" → ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
