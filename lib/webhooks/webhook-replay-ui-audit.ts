import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  WEBHOOK_REPLAY_UI_ACTION,
  WEBHOOK_REPLAY_UI_POLICY_ID,
  WEBHOOK_REPLAY_UI_ROW_COMPONENT,
  WEBHOOK_REPLAY_UI_ROUTE_FILES,
  WEBHOOK_REPLAY_UI_SERVICE,
  WEBHOOK_REPLAY_UI_SURFACES,
} from "@/lib/webhooks/webhook-replay-ui-policy";

export type WebhookReplayUiAuditSummary = {
  policyId: typeof WEBHOOK_REPLAY_UI_POLICY_ID;
  surfaces: typeof WEBHOOK_REPLAY_UI_SURFACES;
  routeChecks: Array<{ file: string; hasReplayRow: boolean; hasReplayAction: boolean }>;
  coreFilesPresent: boolean;
  passed: boolean;
};

function readRootFile(root: string, rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

export function auditWebhookReplayUi(root = process.cwd()): WebhookReplayUiAuditSummary {
  const corePaths = [
    WEBHOOK_REPLAY_UI_ACTION,
    WEBHOOK_REPLAY_UI_SERVICE,
    WEBHOOK_REPLAY_UI_ROW_COMPONENT,
  ];
  const coreFilesPresent = corePaths.every((rel) => existsSync(join(root, rel)));

  const routeChecks = Object.values(WEBHOOK_REPLAY_UI_ROUTE_FILES).map((file) => {
    const path = join(root, file);
    if (!existsSync(path)) {
      return { file, hasReplayRow: false, hasReplayAction: false };
    }
    const source = readFileSync(path, "utf8");
    return {
      file,
      hasReplayRow: source.includes("WebhookReplayRow"),
      hasReplayAction: source.includes('surface="workspace"') || source.includes('surface="platform"'),
    };
  });

  const passed =
    coreFilesPresent &&
    routeChecks.every((row) => row.hasReplayRow && row.hasReplayAction);

  return {
    policyId: WEBHOOK_REPLAY_UI_POLICY_ID,
    surfaces: WEBHOOK_REPLAY_UI_SURFACES,
    routeChecks,
    coreFilesPresent,
    passed,
  };
}

export function formatWebhookReplayUiAuditLines(summary: WebhookReplayUiAuditSummary): string[] {
  const lines = [
    `Webhook replay UI audit (${summary.policyId})`,
    `Surfaces: ${summary.surfaces.join(", ")}`,
    `Core files: ${summary.coreFilesPresent ? "OK" : "MISSING"}`,
  ];

  for (const row of summary.routeChecks) {
    lines.push(
      `  ${row.file}: replayRow=${row.hasReplayRow ? "yes" : "no"} surface=${row.hasReplayAction ? "yes" : "no"}`,
    );
  }

  lines.push(`Passed: ${summary.passed ? "YES" : "NO"}`);
  return lines;
}
