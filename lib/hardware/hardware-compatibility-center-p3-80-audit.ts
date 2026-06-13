import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  HARDWARE_COMPATIBILITY_CENTER_P3_80_DIAGNOSTIC_COUNT,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_DOC,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_NPM_SCRIPTS,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_POLICY_ID,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_ROUTE,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_TAGLINE,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_UPSTREAM_POLICY_ID,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_WIRING_PATHS,
} from "@/lib/hardware/hardware-compatibility-center-p3-80-policy";
import { validateHardwareCompatibilityCenterContract } from "@/lib/hardware/hardware-compatibility-center-p3-80-measurement";

export type HardwareCompatibilityCenterP3_80AuditSummary = {
  policyId: typeof HARDWARE_COMPATIBILITY_CENTER_P3_80_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  diagnosticCount: number;
  route: typeof HARDWARE_COMPATIBILITY_CENTER_P3_80_ROUTE;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditHardwareCompatibilityCenterP3_80(
  root = process.cwd(),
): HardwareCompatibilityCenterP3_80AuditSummary {
  const wiringComplete = HARDWARE_COMPATIBILITY_CENTER_P3_80_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, HARDWARE_COMPATIBILITY_CENTER_P3_80_DOC))) {
    const source = readFileSync(join(root, HARDWARE_COMPATIBILITY_CENTER_P3_80_DOC), "utf8");
    docWired =
      source.includes(HARDWARE_COMPATIBILITY_CENTER_P3_80_POLICY_ID) &&
      source.includes(HARDWARE_COMPATIBILITY_CENTER_P3_80_UPSTREAM_POLICY_ID) &&
      source.includes(HARDWARE_COMPATIBILITY_CENTER_P3_80_TAGLINE);
  }

  const contract = validateHardwareCompatibilityCenterContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = HARDWARE_COMPATIBILITY_CENTER_P3_80_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed = wiringComplete && docWired && contract.passed && npmScriptsWired;

  return {
    policyId: HARDWARE_COMPATIBILITY_CENTER_P3_80_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    diagnosticCount: HARDWARE_COMPATIBILITY_CENTER_P3_80_DIAGNOSTIC_COUNT,
    route: HARDWARE_COMPATIBILITY_CENTER_P3_80_ROUTE,
    npmScriptsWired,
    passed,
  };
}

export function formatHardwareCompatibilityCenterP3_80AuditLines(
  summary: HardwareCompatibilityCenterP3_80AuditSummary,
): string[] {
  return [
    `Hardware compatibility center audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${HARDWARE_COMPATIBILITY_CENTER_P3_80_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Route: ${summary.route}`,
    `Diagnostics: ${summary.diagnosticCount}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
