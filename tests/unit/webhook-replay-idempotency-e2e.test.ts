import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditWebhookReplayIdempotencyE2E,
  buildWebhookReplayIdempotencyAuditReport,
} from "@/lib/qa/webhook-replay-idempotency-e2e-audit";
import {
  WEBHOOK_ALL_INGRESS_ROUTE_COUNT,
  WEBHOOK_REPLAY_IDEMPOTENCY_AUDIT_SCRIPT,
  WEBHOOK_REPLAY_IDEMPOTENCY_CI_WORKFLOW,
  WEBHOOK_REPLAY_IDEMPOTENCY_DETECTORS,
  WEBHOOK_REPLAY_IDEMPOTENCY_E2E_POLICY_ID,
  WEBHOOK_REPLAY_IDEMPOTENCY_E2E_SPEC,
  WEBHOOK_REPLAY_IDEMPOTENCY_EXPECTED_ROUTE_COUNT,
  WEBHOOK_REPLAY_IDEMPOTENCY_FLOW_STEPS,
  WEBHOOK_REPLAY_IDEMPOTENCY_NPM_SCRIPT,
  WEBHOOK_REPLAY_IDEMPOTENCY_UNIT_TEST,
  WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT,
  hasWebhookReplayIdempotencyConnection,
  hasWebhookReplayIdempotencyDb,
  isWebhookReplayIdempotencyE2EEnabled,
} from "@/lib/qa/webhook-replay-idempotency-e2e-policy";

const ROOT = process.cwd();

describe("Webhook replay idempotency E2E (P1-54)", () => {
  it("locks policy id and 59 webhook ingress routes", () => {
    expect(WEBHOOK_REPLAY_IDEMPOTENCY_E2E_POLICY_ID).toBe(
      "webhook-replay-idempotency-e2e-v1",
    );
    expect(WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT).toBe(55);
    expect(WEBHOOK_ALL_INGRESS_ROUTE_COUNT).toBe(59);
    expect(WEBHOOK_REPLAY_IDEMPOTENCY_EXPECTED_ROUTE_COUNT).toBe(59);
    expect(WEBHOOK_REPLAY_IDEMPOTENCY_FLOW_STEPS).toEqual([
      "validate_matrix_59",
      "simulate_duplicate_ingest",
      "assert_idempotent_replay",
    ]);
  });

  it("defines replay idempotency detectors for each strategy", () => {
    expect(WEBHOOK_REPLAY_IDEMPOTENCY_DETECTORS.webhook_event_store.length).toBeGreaterThan(0);
    expect(WEBHOOK_REPLAY_IDEMPOTENCY_DETECTORS.ingress_dedupe.length).toBeGreaterThan(0);
    expect(WEBHOOK_REPLAY_IDEMPOTENCY_DETECTORS.billing_event_id.length).toBeGreaterThan(0);
    expect(WEBHOOK_REPLAY_IDEMPOTENCY_DETECTORS.none).toEqual([]);
  });

  it("audits all 59 routes with idempotency wiring", () => {
    const report = buildWebhookReplayIdempotencyAuditReport(ROOT);
    expect(report.totalRoutes).toBe(59);
    expect(report.overall).toBe("PASSED");
    expect(report.missingIdempotencyCount).toBe(0);
    expect(report.commerceMissingReplayCount).toBe(0);
  });

  it("audits E2E spec, flow helper, event store, and ingress guard", () => {
    const summary = auditWebhookReplayIdempotencyE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.webhookEventStoreWired).toBe(true);
    expect(summary.ingressReplayGuardWired).toBe(true);
    expect(summary.auditPassed).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, WEBHOOK_REPLAY_IDEMPOTENCY_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, WEBHOOK_REPLAY_IDEMPOTENCY_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, WEBHOOK_REPLAY_IDEMPOTENCY_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[WEBHOOK_REPLAY_IDEMPOTENCY_NPM_SCRIPT]).toContain(
      "audit-webhook-replay-idempotency-e2e.ts",
    );
    expect(pkg.scripts?.["test:ci:webhook-replay-idempotency-e2e"]).toContain(
      WEBHOOK_REPLAY_IDEMPOTENCY_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, WEBHOOK_REPLAY_IDEMPOTENCY_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:webhook-replay-idempotency-e2e");
  });

  it("E2E gate requires E2E_WEBHOOK_REPLAY_IDEMPOTENCY flag", () => {
    const original = process.env.E2E_WEBHOOK_REPLAY_IDEMPOTENCY;
    delete process.env.E2E_WEBHOOK_REPLAY_IDEMPOTENCY;
    expect(isWebhookReplayIdempotencyE2EEnabled()).toBe(false);
    process.env.E2E_WEBHOOK_REPLAY_IDEMPOTENCY = "true";
    expect(isWebhookReplayIdempotencyE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_WEBHOOK_REPLAY_IDEMPOTENCY = original;
    else delete process.env.E2E_WEBHOOK_REPLAY_IDEMPOTENCY;
  });

  it("credentials gate requires DATABASE_URL and connection id", () => {
    const originalDb = process.env.DATABASE_URL;
    const originalConn = process.env.CHANNEL_SMOKE_CONNECTION_ID;
    delete process.env.DATABASE_URL;
    delete process.env.CHANNEL_SMOKE_CONNECTION_ID;
    expect(hasWebhookReplayIdempotencyDb()).toBe(false);
    expect(hasWebhookReplayIdempotencyConnection()).toBe(false);
    if (originalDb !== undefined) process.env.DATABASE_URL = originalDb;
    if (originalConn !== undefined) process.env.CHANNEL_SMOKE_CONNECTION_ID = originalConn;
  });
});
