import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditWebhookIngestOrderCreationE2E } from "@/lib/qa/webhook-ingest-order-creation-e2e-audit";
import {
  ORDER_HUB_PATH,
  WEBHOOK_INGEST_ORDER_CREATION_AUDIT_SCRIPT,
  WEBHOOK_INGEST_ORDER_CREATION_CI_WORKFLOW,
  WEBHOOK_INGEST_ORDER_CREATION_E2E_POLICY_ID,
  WEBHOOK_INGEST_ORDER_CREATION_E2E_SPEC,
  WEBHOOK_INGEST_ORDER_CREATION_FLOW_STEPS,
  WEBHOOK_INGEST_ORDER_CREATION_NPM_SCRIPT,
  WEBHOOK_INGEST_ORDER_CREATION_UNIT_TEST,
  WOOCOMMERCE_WEBHOOK_PATH,
  hasWebhookIngestConnection,
  hasWebhookIngestOrderCreationCredentials,
  hasWebhookIngestOrderCreationDb,
  isWebhookIngestOrderCreationE2EEnabled,
  isWebhookIngestOrderCreationKdsGateEnabled,
  isWooCommerceOrderWebhookTopic,
  signWooWebhookBody,
  storefrontKdsTicketTestId,
} from "@/lib/qa/webhook-ingest-order-creation-e2e-policy";
import { verifyWebhookSignature } from "@/services/integrations/woocommerce";

const ROOT = process.cwd();

describe("Webhook ingest → order creation E2E (P1-48)", () => {
  it("locks policy id and webhook processing routes", () => {
    expect(WEBHOOK_INGEST_ORDER_CREATION_E2E_POLICY_ID).toBe(
      "webhook-ingest-order-creation-e2e-v1",
    );
    expect(WOOCOMMERCE_WEBHOOK_PATH).toBe("/api/webhooks/woocommerce");
    expect(ORDER_HUB_PATH).toBe("/dashboard/order-hub");
    expect(WEBHOOK_INGEST_ORDER_CREATION_FLOW_STEPS).toHaveLength(4);
  });

  it("builds KDS ticket test id from internal order id", () => {
    expect(storefrontKdsTicketTestId("abc-123")).toBe("kds-ticket-abc-123");
  });

  it("accepts Woo order webhook topics", () => {
    expect(isWooCommerceOrderWebhookTopic("order.created")).toBe(true);
    expect(isWooCommerceOrderWebhookTopic("product.updated")).toBe(false);
  });

  it("signs webhook bodies for ingest verification", () => {
    const body = '{"id":9001,"status":"processing"}';
    const sig = signWooWebhookBody(body, "secret");
    expect(verifyWebhookSignature(body, sig, "secret")).toBe(true);
  });

  it("audits E2E spec, flow helper, and order hub UI wiring", () => {
    const summary = auditWebhookIngestOrderCreationE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.wooWebhookFlowWired).toBe(true);
    expect(summary.orderHubUiWired).toBe(true);
    expect(summary.orderHubPagePresent).toBe(true);
    expect(summary.kitchenPagePresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, WEBHOOK_INGEST_ORDER_CREATION_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, WEBHOOK_INGEST_ORDER_CREATION_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, WEBHOOK_INGEST_ORDER_CREATION_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[WEBHOOK_INGEST_ORDER_CREATION_NPM_SCRIPT]).toContain(
      "audit-webhook-ingest-order-creation-e2e.ts",
    );
    expect(pkg.scripts?.["test:ci:webhook-ingest-order-creation-e2e"]).toContain(
      WEBHOOK_INGEST_ORDER_CREATION_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, WEBHOOK_INGEST_ORDER_CREATION_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:webhook-ingest-order-creation-e2e");
  });

  it("E2E gate requires E2E_WEBHOOK_INGEST_E2E flag", () => {
    const original = process.env.E2E_WEBHOOK_INGEST_E2E;
    delete process.env.E2E_WEBHOOK_INGEST_E2E;
    expect(isWebhookIngestOrderCreationE2EEnabled()).toBe(false);
    process.env.E2E_WEBHOOK_INGEST_E2E = "true";
    expect(isWebhookIngestOrderCreationE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_WEBHOOK_INGEST_E2E = original;
    else delete process.env.E2E_WEBHOOK_INGEST_E2E;
  });

  it("connection gate requires CHANNEL_SMOKE_CONNECTION_ID", () => {
    const original = process.env.CHANNEL_SMOKE_CONNECTION_ID;
    delete process.env.CHANNEL_SMOKE_CONNECTION_ID;
    expect(hasWebhookIngestConnection()).toBe(false);
    if (original !== undefined) process.env.CHANNEL_SMOKE_CONNECTION_ID = original;
  });

  it("credentials and DB gates are false without env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    const originalDb = process.env.DATABASE_URL;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    delete process.env.DATABASE_URL;
    expect(hasWebhookIngestOrderCreationCredentials()).toBe(false);
    expect(hasWebhookIngestOrderCreationDb()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
    if (originalDb !== undefined) process.env.DATABASE_URL = originalDb;
  });

  it("KDS gate requires production or ENABLE_KDS_V1_CERTIFIED", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalKds = process.env.ENABLE_KDS_V1_CERTIFIED;
    process.env.NODE_ENV = "development";
    delete process.env.ENABLE_KDS_V1_CERTIFIED;
    expect(isWebhookIngestOrderCreationKdsGateEnabled()).toBe(false);
    process.env.ENABLE_KDS_V1_CERTIFIED = "true";
    expect(isWebhookIngestOrderCreationKdsGateEnabled()).toBe(true);
    if (originalNodeEnv !== undefined) process.env.NODE_ENV = originalNodeEnv;
    else delete process.env.NODE_ENV;
    if (originalKds !== undefined) process.env.ENABLE_KDS_V1_CERTIFIED = originalKds;
    else delete process.env.ENABLE_KDS_V1_CERTIFIED;
  });
});
