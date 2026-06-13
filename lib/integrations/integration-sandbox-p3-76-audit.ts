import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INTEGRATION_SANDBOX_P3_76_DOC,
  INTEGRATION_SANDBOX_P3_76_LIVE_COUNT,
  INTEGRATION_SANDBOX_P3_76_NPM_SCRIPTS,
  INTEGRATION_SANDBOX_P3_76_POLICY_ID,
  INTEGRATION_SANDBOX_P3_76_UPSTREAM_POLICY_ID,
  INTEGRATION_SANDBOX_P3_76_WIRING_PATHS,
} from "@/lib/integrations/integration-sandbox-p3-76-policy";
import { validateIntegrationSandboxContract } from "@/lib/integrations/integration-sandbox-p3-76-measurement";

export type IntegrationSandboxP3_76AuditSummary = {
  policyId: typeof INTEGRATION_SANDBOX_P3_76_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  liveCount: number;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditIntegrationSandboxP3_76(
  root = process.cwd(),
): IntegrationSandboxP3_76AuditSummary {
  const wiringComplete = INTEGRATION_SANDBOX_P3_76_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, INTEGRATION_SANDBOX_P3_76_DOC))) {
    const source = readFileSync(join(root, INTEGRATION_SANDBOX_P3_76_DOC), "utf8");
    docWired =
      source.includes(INTEGRATION_SANDBOX_P3_76_POLICY_ID) &&
      source.includes(INTEGRATION_SANDBOX_P3_76_UPSTREAM_POLICY_ID) &&
      source.includes("18 LIVE");
  }

  const contract = validateIntegrationSandboxContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = INTEGRATION_SANDBOX_P3_76_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed = wiringComplete && docWired && contract.passed && npmScriptsWired;

  return {
    policyId: INTEGRATION_SANDBOX_P3_76_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    liveCount: INTEGRATION_SANDBOX_P3_76_LIVE_COUNT,
    npmScriptsWired,
    passed,
  };
}

export function formatIntegrationSandboxP3_76AuditLines(
  summary: IntegrationSandboxP3_76AuditSummary,
): string[] {
  return [
    `Integration sandbox audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${INTEGRATION_SANDBOX_P3_76_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `LIVE surfaces: ${summary.liveCount}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
