/**
 * Dark Mode Everywhere smoke summary — wiring audit (Era 134).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DARK_MODE_EVERYWHERE_ERA134_POLICY_ID,
  DARK_MODE_EVERYWHERE_ERA134_SERVICE,
  DARK_MODE_EVERYWHERE_ERA134_SURFACES,
  DARK_MODE_EVERYWHERE_ERA134_WIRING_PATHS,
} from "@/lib/design/dark-mode-everywhere-era134-policy";
import { DARK_MODE_EVERYWHERE_PATTERN_IMPORT } from "@/lib/design/dark-mode-everywhere-policy";

export const DARK_MODE_EVERYWHERE_SMOKE_SUMMARY_VERSION = DARK_MODE_EVERYWHERE_ERA134_POLICY_ID;

export type DarkModeEverywhereSmokeEra134Overall = "PASSED" | "FAILED" | "SKIPPED";

export type DarkModeEverywhereSmokeEra134ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type DarkModeEverywhereSmokeEra134Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type DarkModeEverywhereSmokeEra134Summary = {
  version: typeof DARK_MODE_EVERYWHERE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: DarkModeEverywhereSmokeEra134Overall;
  proofStatus: DarkModeEverywhereSmokeEra134ProofStatus;
  wiringCertPassed: boolean;
  surfaces: readonly string[];
  steps: DarkModeEverywhereSmokeEra134Step[];
  honestyNote: string;
};

export function auditDarkModeEverywhereSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of DARK_MODE_EVERYWHERE_ERA134_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === DARK_MODE_EVERYWHERE_ERA134_SERVICE) {
      if (!src.includes("loadDarkModeEverywhereSnapshot")) {
        failures.push("dark-mode-everywhere-service.ts missing loadDarkModeEverywhereSnapshot");
      }
      if (!src.includes("auditDarkModeEverywhere")) {
        failures.push("dark-mode-everywhere-service.ts missing auditDarkModeEverywhere");
      }
      if (!src.includes("healthScore")) {
        failures.push("dark-mode-everywhere-service.ts missing healthScore");
      }
      if (!src.includes("legacyDarkBridgePresent")) {
        failures.push("dark-mode-everywhere-service.ts missing legacy dark bridge check");
      }
    }

    if (rel === "lib/design/dark-mode-everywhere-policy.ts") {
      if (!src.includes("DARK_MODE_EVERYWHERE_POLICY_ID")) {
        failures.push("dark-mode-everywhere-policy.ts missing policy id");
      }
      if (!src.includes("DARK_MODE_EVERYWHERE_ROLE_MODULES")) {
        failures.push("dark-mode-everywhere-policy.ts missing role modules");
      }
      if (!src.includes("DARK_MODE_EVERYWHERE_LEADERSHIP_MODULES")) {
        failures.push("dark-mode-everywhere-policy.ts missing leadership modules");
      }
      if (!src.includes("DARK_MODE_EVERYWHERE_MODULES")) {
        failures.push("dark-mode-everywhere-policy.ts missing full module list");
      }
    }

    if (rel === "lib/design/dark-mode-everywhere-patterns.ts") {
      if (!src.includes("ROLE_HERO_CARD_CLASS")) {
        failures.push("dark-mode-everywhere-patterns.ts missing role hero card classes");
      }
      if (!src.includes("roleTileToneClass")) {
        failures.push("dark-mode-everywhere-patterns.ts missing roleTileToneClass");
      }
      if (!src.includes("dark:")) {
        failures.push("dark-mode-everywhere-patterns.ts missing dark: variants");
      }
      if (!src.includes("rolePageActionClass")) {
        failures.push("dark-mode-everywhere-patterns.ts missing rolePageActionClass");
      }
    }

    if (rel === "lib/design/dark-mode-everywhere-audit-policy.ts") {
      if (!src.includes("auditDarkModeEverywhere")) {
        failures.push("dark-mode-everywhere-audit-policy.ts missing auditDarkModeEverywhere");
      }
      if (!src.includes("findDarkModeLightOnlyViolations")) {
        failures.push("dark-mode-everywhere-audit-policy.ts missing light-only violation scan");
      }
      if (!src.includes("DARK_MODE_EVERYWHERE_MODULES")) {
        failures.push("dark-mode-everywhere-audit-policy.ts missing module audit list");
      }
      if (!src.includes("app/globals.css")) {
        failures.push("dark-mode-everywhere-audit-policy.ts missing globals.css bridge check");
      }
    }

    if (rel === "components/roles/owner-role-panel.tsx") {
      if (!src.includes(DARK_MODE_EVERYWHERE_PATTERN_IMPORT)) {
        failures.push("owner-role-panel.tsx missing dark-mode-everywhere pattern import");
      }
      if (!src.includes("ROLE_HERO_CARD_CLASS")) {
        failures.push("owner-role-panel.tsx missing role hero card class");
      }
      if (!src.includes("roleTileToneClass")) {
        failures.push("owner-role-panel.tsx missing roleTileToneClass");
      }
      if (!src.includes("owner-role-panel")) {
        failures.push("owner-role-panel.tsx missing root test id");
      }
    }
  }

  const globalsPath = join(root, "app/globals.css");
  if (!existsSync(globalsPath)) {
    failures.push("missing app/globals.css");
  } else {
    const globals = readFileSync(globalsPath, "utf8");
    if (!globals.includes(".dark")) {
      failures.push("app/globals.css missing .dark theme bridge");
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveDarkModeEverywhereSmokeEra134ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): DarkModeEverywhereSmokeEra134ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildDarkModeEverywhereSmokeEra134Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): DarkModeEverywhereSmokeEra134Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveDarkModeEverywhereSmokeEra134ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: DarkModeEverywhereSmokeEra134Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: DarkModeEverywhereSmokeEra134Step[] = [
    {
      id: "wiring_audit",
      label: "Shell consistency → all role UIs → leadership surfaces",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 134 Dark Mode Everywhere cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: DARK_MODE_EVERYWHERE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    surfaces: DARK_MODE_EVERYWHERE_ERA134_SURFACES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring and static module audit — live proof requires toggling system dark mode on device.",
  };
}

export function formatDarkModeEverywhereSmokeEra134ReportLines(
  summary: DarkModeEverywhereSmokeEra134Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Surfaces: ${summary.surfaces.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
