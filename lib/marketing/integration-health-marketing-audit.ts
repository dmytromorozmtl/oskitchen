import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INTEGRATION_HEALTH_MARKETING_DOC,
  INTEGRATION_HEALTH_MARKETING_EXPLAINER_COMPONENT,
  INTEGRATION_HEALTH_MARKETING_EXPLAINER_HEADLINE,
  INTEGRATION_HEALTH_MARKETING_EXPLAINER_TEST_ID,
  INTEGRATION_HEALTH_MARKETING_HOME_MOAT,
  INTEGRATION_HEALTH_MARKETING_HONESTY_MARKERS,
  INTEGRATION_HEALTH_MARKETING_LANDING_COMPONENT,
  INTEGRATION_HEALTH_MARKETING_POLICY_ID,
  INTEGRATION_HEALTH_MARKETING_ROUTE,
  INTEGRATION_HEALTH_MARKETING_WIRING_PATHS,
} from "@/lib/marketing/integration-health-marketing-policy";

export type IntegrationHealthMarketingAuditSummary = {
  policyId: typeof INTEGRATION_HEALTH_MARKETING_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  explainerWired: boolean;
  landingWired: boolean;
  homeMoatWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditIntegrationHealthMarketing(
  root = process.cwd(),
): IntegrationHealthMarketingAuditSummary {
  const wiringComplete = INTEGRATION_HEALTH_MARKETING_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let explainerWired = false;
  let landingWired = false;
  let homeMoatWired = false;

  if (existsSync(join(root, INTEGRATION_HEALTH_MARKETING_DOC))) {
    const source = readFileSync(join(root, INTEGRATION_HEALTH_MARKETING_DOC), "utf8");
    docWired =
      source.includes(INTEGRATION_HEALTH_MARKETING_EXPLAINER_HEADLINE) &&
      source.includes(INTEGRATION_HEALTH_MARKETING_ROUTE);
  }

  if (existsSync(join(root, INTEGRATION_HEALTH_MARKETING_EXPLAINER_COMPONENT))) {
    const source = readFileSync(join(root, INTEGRATION_HEALTH_MARKETING_EXPLAINER_COMPONENT), "utf8");
    explainerWired =
      source.includes("IntegrationHealthMarketingExplainerSection") &&
      source.includes("INTEGRATION_HEALTH_MARKETING_EXPLAINER_TEST_ID") &&
      source.includes("INTEGRATION_HEALTH_MARKETING_EXPLAINER_STEPS");
  }

  if (existsSync(join(root, INTEGRATION_HEALTH_MARKETING_LANDING_COMPONENT))) {
    const source = readFileSync(join(root, INTEGRATION_HEALTH_MARKETING_LANDING_COMPONENT), "utf8");
    landingWired =
      source.includes("IntegrationHealthMarketingExplainerSection") &&
      source.includes(INTEGRATION_HEALTH_MARKETING_EXPLAINER_TEST_ID);
  }

  if (existsSync(join(root, INTEGRATION_HEALTH_MARKETING_HOME_MOAT))) {
    const source = readFileSync(join(root, INTEGRATION_HEALTH_MARKETING_HOME_MOAT), "utf8");
    homeMoatWired = source.includes("IntegrationHealthMarketingExplainerSection");
  }

  const combinedSources = [
    INTEGRATION_HEALTH_MARKETING_DOC,
    INTEGRATION_HEALTH_MARKETING_EXPLAINER_COMPONENT,
    "lib/marketing/integration-health-marketing-content.ts",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = INTEGRATION_HEALTH_MARKETING_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    explainerWired &&
    landingWired &&
    homeMoatWired &&
    honestyMarkersPresent;

  return {
    policyId: INTEGRATION_HEALTH_MARKETING_POLICY_ID,
    wiringComplete,
    docWired,
    explainerWired,
    landingWired,
    homeMoatWired,
    honestyMarkersPresent,
    passed,
  };
}

export function formatIntegrationHealthMarketingAuditLines(
  summary: IntegrationHealthMarketingAuditSummary,
): string[] {
  return [
    `Integration Health marketing audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${INTEGRATION_HEALTH_MARKETING_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Explainer (${INTEGRATION_HEALTH_MARKETING_EXPLAINER_TEST_ID}): ${summary.explainerWired ? "yes" : "no"}`,
    `Landing page wired: ${summary.landingWired ? "yes" : "no"}`,
    `Home moat wired: ${summary.homeMoatWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
