import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditWebhookReplayUi } from "@/lib/webhooks/webhook-replay-ui-audit";
import {
  WEBHOOK_REPLAY_UI_P3_74_HEALTH_PAGE,
  WEBHOOK_REPLAY_UI_P3_74_HEALTH_PANEL,
  WEBHOOK_REPLAY_UI_P3_74_HEALTH_ROUTE,
  WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_POLICY_ID,
} from "@/lib/webhooks/webhook-replay-ui-p3-74-policy";

export type WebhookReplayUiContractValidation = {
  passed: boolean;
  upstreamAuditOk: boolean;
  healthPanelWired: boolean;
  healthRouteWired: boolean;
  failures: string[];
};

export function validateWebhookReplayUiContract(
  root = process.cwd(),
): WebhookReplayUiContractValidation {
  const failures: string[] = [];

  const upstream = auditWebhookReplayUi(root);
  const upstreamAuditOk =
    upstream.passed && upstream.policyId === WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_POLICY_ID;
  if (!upstreamAuditOk) {
    failures.push("upstream webhook replay UI audit failed");
  }

  let healthPanelWired = false;
  const panelPath = join(root, WEBHOOK_REPLAY_UI_P3_74_HEALTH_PANEL);
  if (!existsSync(panelPath)) {
    failures.push(`missing health panel: ${WEBHOOK_REPLAY_UI_P3_74_HEALTH_PANEL}`);
  } else {
    const panelSource = readFileSync(panelPath, "utf8");
    healthPanelWired =
      panelSource.includes("WebhookReplayHealthPanel") &&
      panelSource.includes("WEBHOOK_QUEUE_ROUTE");
    if (!healthPanelWired) {
      failures.push("health panel missing replay route wiring");
    }
  }

  let healthRouteWired = false;
  const healthPagePath = join(root, WEBHOOK_REPLAY_UI_P3_74_HEALTH_PAGE);
  if (!existsSync(healthPagePath)) {
    failures.push(`missing health page: ${WEBHOOK_REPLAY_UI_P3_74_HEALTH_PAGE}`);
  } else {
    const pageSource = readFileSync(healthPagePath, "utf8");
    healthRouteWired =
      pageSource.includes("WebhookReplayHealthPanel") &&
      pageSource.includes("buildWebhookQueueFocusSnapshot");
    if (!healthRouteWired) {
      failures.push("integration health page missing replay health panel");
    }
  }

  if (WEBHOOK_REPLAY_UI_P3_74_HEALTH_ROUTE !== "/dashboard/integrations/health") {
    failures.push("health route drift");
  }

  return {
    passed: failures.length === 0,
    upstreamAuditOk,
    healthPanelWired,
    healthRouteWired,
    failures,
  };
}
