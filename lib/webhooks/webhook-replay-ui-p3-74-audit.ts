import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  WEBHOOK_REPLAY_UI_P3_74_DOC,
  WEBHOOK_REPLAY_UI_P3_74_HEALTH_ROUTE,
  WEBHOOK_REPLAY_UI_P3_74_NPM_SCRIPTS,
  WEBHOOK_REPLAY_UI_P3_74_POLICY_ID,
  WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_DOC,
  WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_POLICY_ID,
  WEBHOOK_REPLAY_UI_P3_74_WIRING_PATHS,
} from "@/lib/webhooks/webhook-replay-ui-p3-74-policy";
import { validateWebhookReplayUiContract } from "@/lib/webhooks/webhook-replay-ui-p3-74-measurement";

export type WebhookReplayUiP3_74AuditSummary = {
  policyId: typeof WEBHOOK_REPLAY_UI_P3_74_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  healthRoute: typeof WEBHOOK_REPLAY_UI_P3_74_HEALTH_ROUTE;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditWebhookReplayUiP3_74(
  root = process.cwd(),
): WebhookReplayUiP3_74AuditSummary {
  const wiringComplete = WEBHOOK_REPLAY_UI_P3_74_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, WEBHOOK_REPLAY_UI_P3_74_DOC))) {
    const source = readFileSync(join(root, WEBHOOK_REPLAY_UI_P3_74_DOC), "utf8");
    docWired =
      source.includes(WEBHOOK_REPLAY_UI_P3_74_POLICY_ID) &&
      source.includes(WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_DOC) &&
      source.includes(WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_POLICY_ID) &&
      source.includes(WEBHOOK_REPLAY_UI_P3_74_HEALTH_ROUTE);
  }

  const contract = validateWebhookReplayUiContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = WEBHOOK_REPLAY_UI_P3_74_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed = wiringComplete && docWired && contract.passed && npmScriptsWired;

  return {
    policyId: WEBHOOK_REPLAY_UI_P3_74_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    healthRoute: WEBHOOK_REPLAY_UI_P3_74_HEALTH_ROUTE,
    npmScriptsWired,
    passed,
  };
}

export function formatWebhookReplayUiP3_74AuditLines(
  summary: WebhookReplayUiP3_74AuditSummary,
): string[] {
  return [
    `Webhook replay UI audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${WEBHOOK_REPLAY_UI_P3_74_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Integration health bridge: ${summary.healthRoute}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
