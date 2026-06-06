/**
 * Design System doc smoke summary — wiring audit (Era 135).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DESIGN_SYSTEM_DOC_ERA135_DOC_PATH,
  DESIGN_SYSTEM_DOC_ERA135_POLICY_ID,
  DESIGN_SYSTEM_DOC_ERA135_POLICY_MODULES,
  DESIGN_SYSTEM_DOC_ERA135_SECTIONS,
  DESIGN_SYSTEM_DOC_ERA135_SERVICE,
  DESIGN_SYSTEM_DOC_ERA135_WIRING_PATHS,
} from "@/lib/design/design-system-doc-era135-policy";

export const DESIGN_SYSTEM_DOC_SMOKE_SUMMARY_VERSION = DESIGN_SYSTEM_DOC_ERA135_POLICY_ID;

export type DesignSystemDocSmokeEra135Overall = "PASSED" | "FAILED" | "SKIPPED";

export type DesignSystemDocSmokeEra135ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type DesignSystemDocSmokeEra135Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type DesignSystemDocSmokeEra135Summary = {
  version: typeof DESIGN_SYSTEM_DOC_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: DesignSystemDocSmokeEra135Overall;
  proofStatus: DesignSystemDocSmokeEra135ProofStatus;
  wiringCertPassed: boolean;
  docPath: string;
  sectionCount: number;
  steps: DesignSystemDocSmokeEra135Step[];
  honestyNote: string;
};

export function auditDesignSystemDocSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of DESIGN_SYSTEM_DOC_ERA135_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === DESIGN_SYSTEM_DOC_ERA135_DOC_PATH) {
      if (!src.includes("design-system-doc-des39-v1")) {
        failures.push("design-system.md missing policy id");
      }
      for (const section of DESIGN_SYSTEM_DOC_ERA135_SECTIONS) {
        if (!src.includes(section)) {
          failures.push(`design-system.md missing section: ${section}`);
        }
      }
      if (!src.includes("mobile-first-redesign-des25-v1")) {
        failures.push("design-system.md missing mobile-first policy reference");
      }
      if (!src.includes("dark-mode-everywhere-des26-v1")) {
        failures.push("design-system.md missing dark mode everywhere reference");
      }
      if (!src.includes("page-layout-patterns-des27-v1")) {
        failures.push("design-system.md missing page layout patterns reference");
      }
    }

    if (rel === "lib/design/design-system-doc-policy.ts") {
      if (!src.includes("DESIGN_SYSTEM_DOC_POLICY_ID")) {
        failures.push("design-system-doc-policy.ts missing policy id");
      }
      if (!src.includes("DESIGN_SYSTEM_DOC_ANCHORS")) {
        failures.push("design-system-doc-policy.ts missing section anchors");
      }
      if (!src.includes("DESIGN_SYSTEM_POLICY_MODULES")) {
        failures.push("design-system-doc-policy.ts missing policy module registry");
      }
    }

    if (rel === DESIGN_SYSTEM_DOC_ERA135_SERVICE) {
      if (!src.includes("loadDesignSystemDocSnapshot")) {
        failures.push("design-system-doc-service.ts missing loadDesignSystemDocSnapshot");
      }
      if (!src.includes("validateDesignSystemDocSections")) {
        failures.push("design-system-doc-service.ts missing validateDesignSystemDocSections");
      }
      if (!src.includes("healthScore")) {
        failures.push("design-system-doc-service.ts missing healthScore");
      }
    }

    if (rel === "tests/unit/design-system-doc.test.ts") {
      if (!src.includes("loadDesignSystemDocSnapshot")) {
        failures.push("design-system-doc.test.ts missing snapshot test");
      }
      if (!src.includes("DESIGN_SYSTEM_DOC_ANCHORS")) {
        failures.push("design-system-doc.test.ts missing anchor coverage");
      }
    }
  }

  for (const modulePath of DESIGN_SYSTEM_DOC_ERA135_POLICY_MODULES) {
    if (!existsSync(join(root, modulePath))) {
      failures.push(`missing policy module ${modulePath}`);
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveDesignSystemDocSmokeEra135ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): DesignSystemDocSmokeEra135ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildDesignSystemDocSmokeEra135Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): DesignSystemDocSmokeEra135Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveDesignSystemDocSmokeEra135ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: DesignSystemDocSmokeEra135Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: DesignSystemDocSmokeEra135Step[] = [
    {
      id: "wiring_audit",
      label: "Canonical doc → policy registry → section validation",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 135 Design System doc cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: DESIGN_SYSTEM_DOC_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    docPath: DESIGN_SYSTEM_DOC_ERA135_DOC_PATH,
    sectionCount: DESIGN_SYSTEM_DOC_ERA135_SECTIONS.length,
    steps,
    honestyNote:
      "PASS certifies in-repo doc wiring and section anchors — live proof requires design review on new screens.",
  };
}

export function formatDesignSystemDocSmokeEra135ReportLines(
  summary: DesignSystemDocSmokeEra135Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Doc: ${summary.docPath}`,
    `Sections: ${summary.sectionCount}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
