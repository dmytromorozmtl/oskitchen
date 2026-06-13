import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_NPM_SCRIPTS,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_PLAYBOOK_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_POLICY_ID,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_UPSTREAM_POLICY_ID,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_WIRING_PATHS,
} from "@/lib/marketing/product-hunt-launch-prep-p3-65-policy";
import { validateProductHuntLaunchPrepContract } from "@/lib/marketing/product-hunt-launch-prep-p3-65-measurement";

export type ProductHuntLaunchPrepP3_65AuditSummary = {
  policyId: typeof PRODUCT_HUNT_LAUNCH_PREP_P3_65_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  upstreamPolicyAligned: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditProductHuntLaunchPrepP3_65(
  root = process.cwd(),
): ProductHuntLaunchPrepP3_65AuditSummary {
  const wiringComplete = PRODUCT_HUNT_LAUNCH_PREP_P3_65_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, PRODUCT_HUNT_LAUNCH_PREP_P3_65_DOC))) {
    const source = readFileSync(join(root, PRODUCT_HUNT_LAUNCH_PREP_P3_65_DOC), "utf8");
    docWired =
      source.includes(PRODUCT_HUNT_LAUNCH_PREP_P3_65_POLICY_ID) &&
      source.includes(PRODUCT_HUNT_LAUNCH_PREP_P3_65_PLAYBOOK_DOC) &&
      source.includes(PRODUCT_HUNT_LAUNCH_PREP_P3_65_UPSTREAM_POLICY_ID);
  }

  const contract = validateProductHuntLaunchPrepContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = PRODUCT_HUNT_LAUNCH_PREP_P3_65_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed = wiringComplete && docWired && contract.passed && npmScriptsWired;

  return {
    policyId: PRODUCT_HUNT_LAUNCH_PREP_P3_65_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    upstreamPolicyAligned: contract.upstreamAuditOk,
    npmScriptsWired,
    passed,
  };
}

export function formatProductHuntLaunchPrepP3_65AuditLines(
  summary: ProductHuntLaunchPrepP3_65AuditSummary,
): string[] {
  return [
    `Product Hunt launch prep audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${PRODUCT_HUNT_LAUNCH_PREP_P3_65_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Upstream absolute-final: ${summary.upstreamPolicyAligned ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
