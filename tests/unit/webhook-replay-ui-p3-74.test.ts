import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditWebhookReplayUiP3_74,
  formatWebhookReplayUiP3_74AuditLines,
} from "@/lib/webhooks/webhook-replay-ui-p3-74-audit";
import { validateWebhookReplayUiContract } from "@/lib/webhooks/webhook-replay-ui-p3-74-measurement";
import {
  WEBHOOK_REPLAY_UI_P3_74_AUDIT_SCRIPT,
  WEBHOOK_REPLAY_UI_P3_74_CHECK_NPM_SCRIPT,
  WEBHOOK_REPLAY_UI_P3_74_DOC,
  WEBHOOK_REPLAY_UI_P3_74_HEALTH_ROUTE,
  WEBHOOK_REPLAY_UI_P3_74_NPM_SCRIPT,
  WEBHOOK_REPLAY_UI_P3_74_NPM_SCRIPTS,
  WEBHOOK_REPLAY_UI_P3_74_POLICY_ID,
  WEBHOOK_REPLAY_UI_P3_74_UNIT_TEST,
  WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_POLICY_ID,
  WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_TEST,
} from "@/lib/webhooks/webhook-replay-ui-p3-74-policy";

const ROOT = process.cwd();

describe("Webhook replay UI (P3-74)", () => {
  it("locks P3-74 policy and integration health bridge route", () => {
    expect(WEBHOOK_REPLAY_UI_P3_74_POLICY_ID).toBe("webhook-replay-ui-p3-74-v1");
    expect(WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_POLICY_ID).toBe("webhook-replay-ui-p1-37-v1");
    expect(WEBHOOK_REPLAY_UI_P3_74_HEALTH_ROUTE).toBe("/dashboard/integrations/health");
  });

  it("validates upstream replay UI + integration health bridge", () => {
    const validation = validateWebhookReplayUiContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.upstreamAuditOk).toBe(true);
    expect(validation.healthPanelWired).toBe(true);
    expect(validation.healthRouteWired).toBe(true);
  });

  it("passes full webhook replay UI P3-74 audit", () => {
    const summary = auditWebhookReplayUiP3_74(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatWebhookReplayUiP3_74AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script, upstream test, and npm wiring", () => {
    expect(existsSync(join(ROOT, WEBHOOK_REPLAY_UI_P3_74_DOC))).toBe(true);
    expect(existsSync(join(ROOT, WEBHOOK_REPLAY_UI_P3_74_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, WEBHOOK_REPLAY_UI_P3_74_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, WEBHOOK_REPLAY_UI_P3_74_UPSTREAM_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[WEBHOOK_REPLAY_UI_P3_74_NPM_SCRIPT]).toContain(
      "audit-webhook-replay-ui-p3-74.ts",
    );
    expect(pkg.scripts?.[WEBHOOK_REPLAY_UI_P3_74_CHECK_NPM_SCRIPT]).toContain(
      WEBHOOK_REPLAY_UI_P3_74_UNIT_TEST,
    );
    for (const script of WEBHOOK_REPLAY_UI_P3_74_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
