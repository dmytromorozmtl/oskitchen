import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditWebhookReplayUi,
} from "@/lib/webhooks/webhook-replay-ui-audit";
import {
  WEBHOOK_REPLAY_UI_NPM_SCRIPT,
  WEBHOOK_REPLAY_UI_PLATFORM_ROUTE,
  WEBHOOK_REPLAY_UI_POLICY_ID,
  WEBHOOK_REPLAY_UI_ROUTE_FILES,
  WEBHOOK_REPLAY_UI_SURFACES,
  WEBHOOK_REPLAY_UI_WORKSPACE_ROUTES,
} from "@/lib/webhooks/webhook-replay-ui-policy";

const ROOT = process.cwd();

describe("webhook replay UI (P1-37)", () => {
  it("locks policy id and operator surfaces", () => {
    expect(WEBHOOK_REPLAY_UI_POLICY_ID).toBe("webhook-replay-ui-p1-37-v1");
    expect(WEBHOOK_REPLAY_UI_SURFACES).toEqual(["workspace", "platform"]);
    expect(WEBHOOK_REPLAY_UI_WORKSPACE_ROUTES).toContain(
      "/dashboard/sales-channels/webhooks",
    );
    expect(WEBHOOK_REPLAY_UI_PLATFORM_ROUTE).toBe("/platform/webhooks");
  });

  it("audits workspace + platform replay routes", () => {
    const summary = auditWebhookReplayUi(ROOT);
    expect(summary.coreFilesPresent).toBe(true);
    expect(summary.routeChecks).toHaveLength(3);
    expect(summary.passed).toBe(true);
  });

  it("registers npm check script and replay action", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[WEBHOOK_REPLAY_UI_NPM_SCRIPT]).toContain(
      "check-webhook-replay-ui.ts",
    );
    expect(pkg.scripts?.["test:ci:webhook-replay-ui"]).toContain(
      "webhook-replay-ui.test.ts",
    );
    expect(existsSync(join(ROOT, WEBHOOK_REPLAY_UI_ROUTE_FILES.workspacePrimary))).toBe(
      true,
    );
    expect(existsSync(join(ROOT, WEBHOOK_REPLAY_UI_ROUTE_FILES.platform))).toBe(true);
  });
});
