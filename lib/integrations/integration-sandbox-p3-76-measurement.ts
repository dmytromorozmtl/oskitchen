import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditIntegrationSandboxReadiness } from "@/lib/integrations/integration-sandbox-service";
import { buildIntegrationSandboxModeSnapshot } from "@/lib/integrations/integration-sandbox-mode-snapshot";
import {
  INTEGRATION_SANDBOX_P3_76_HEALTH_PAGE,
  INTEGRATION_SANDBOX_P3_76_LIVE_COUNT,
  INTEGRATION_SANDBOX_P3_76_MODE_PANEL,
  INTEGRATION_SANDBOX_P3_76_UPSTREAM_POLICY_ID,
} from "@/lib/integrations/integration-sandbox-p3-76-policy";

export type IntegrationSandboxContractValidation = {
  passed: boolean;
  upstreamFleetOk: boolean;
  modePanelWired: boolean;
  healthPageWired: boolean;
  snapshotRowsOk: boolean;
  failures: string[];
};

export function validateIntegrationSandboxContract(
  root = process.cwd(),
): IntegrationSandboxContractValidation {
  const failures: string[] = [];

  const upstream = auditIntegrationSandboxReadiness({});
  const upstreamFleetOk =
    upstream.policyId === INTEGRATION_SANDBOX_P3_76_UPSTREAM_POLICY_ID &&
    upstream.rows.length === INTEGRATION_SANDBOX_P3_76_LIVE_COUNT;
  if (!upstreamFleetOk) {
    failures.push(`upstream fleet expected ${INTEGRATION_SANDBOX_P3_76_LIVE_COUNT} surfaces`);
  }

  let modePanelWired = false;
  const panelPath = join(root, INTEGRATION_SANDBOX_P3_76_MODE_PANEL);
  if (!existsSync(panelPath)) {
    failures.push(`missing sandbox panel: ${INTEGRATION_SANDBOX_P3_76_MODE_PANEL}`);
  } else {
    const source = readFileSync(panelPath, "utf8");
    modePanelWired =
      source.includes("IntegrationSandboxModePanel") &&
      source.includes("integration-sandbox-row-");
    if (!modePanelWired) {
      failures.push("sandbox mode panel incomplete");
    }
  }

  let healthPageWired = false;
  const healthPath = join(root, INTEGRATION_SANDBOX_P3_76_HEALTH_PAGE);
  if (!existsSync(healthPath)) {
    failures.push(`missing health page: ${INTEGRATION_SANDBOX_P3_76_HEALTH_PAGE}`);
  } else {
    const source = readFileSync(healthPath, "utf8");
    healthPageWired =
      source.includes("IntegrationSandboxModePanel") &&
      source.includes("buildIntegrationSandboxModeSnapshot");
    if (!healthPageWired) {
      failures.push("integration health page missing sandbox mode panel");
    }
  }

  const snapshot = buildIntegrationSandboxModeSnapshot({});
  const snapshotRowsOk = snapshot.rows.length === INTEGRATION_SANDBOX_P3_76_LIVE_COUNT;
  if (!snapshotRowsOk) {
    failures.push("sandbox mode snapshot row count drift");
  }

  return {
    passed: failures.length === 0,
    upstreamFleetOk,
    modePanelWired,
    healthPageWired,
    snapshotRowsOk,
    failures,
  };
}
