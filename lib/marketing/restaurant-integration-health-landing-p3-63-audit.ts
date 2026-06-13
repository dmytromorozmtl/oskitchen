import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_CANONICAL_PATH,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_DOC,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_NPM_SCRIPTS,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_POLICY_ID,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_PRIMARY_KEYWORD,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_WIRING_PATHS,
} from "@/lib/marketing/restaurant-integration-health-landing-p3-63-policy";
import { validateRestaurantIntegrationHealthLandingContract } from "@/lib/marketing/restaurant-integration-health-landing-p3-63-measurement";

export type RestaurantIntegrationHealthLandingP3_63AuditSummary = {
  policyId: typeof RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  canonicalPathWired: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditRestaurantIntegrationHealthLandingP3_63(
  root = process.cwd(),
): RestaurantIntegrationHealthLandingP3_63AuditSummary {
  const wiringComplete = RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_DOC))) {
    const source = readFileSync(join(root, RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_DOC), "utf8");
    docWired =
      source.includes(RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_POLICY_ID) &&
      source.includes(RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_CANONICAL_PATH) &&
      source.includes(RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_PRIMARY_KEYWORD);
  }

  const contract = validateRestaurantIntegrationHealthLandingContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed =
    wiringComplete &&
    docWired &&
    contract.passed &&
    contract.pathsAligned &&
    npmScriptsWired;

  return {
    policyId: RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    canonicalPathWired: contract.pathsAligned,
    npmScriptsWired,
    passed,
  };
}

export function formatRestaurantIntegrationHealthLandingP3_63AuditLines(
  summary: RestaurantIntegrationHealthLandingP3_63AuditSummary,
): string[] {
  return [
    `Restaurant integration health landing audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Canonical /restaurant-integration-health: ${summary.canonicalPathWired ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
