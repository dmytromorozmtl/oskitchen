import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditIntegrationTestPackP3_53,
  formatIntegrationTestPackP3_53AuditLines,
} from "@/lib/qa/integration-test-pack-p3-53-audit";
import {
  buildIntegrationTestPackModuleStatuses,
  uniqueIntegrationTestPackSpecs,
  validateIntegrationTestPackContract,
} from "@/lib/qa/integration-test-pack-p3-53-measurement";
import {
  INTEGRATION_TEST_PACK_P3_53_AUDIT_SCRIPT,
  INTEGRATION_TEST_PACK_P3_53_CHECK_NPM_SCRIPT,
  INTEGRATION_TEST_PACK_P3_53_CI_WORKFLOW,
  INTEGRATION_TEST_PACK_P3_53_DOC,
  INTEGRATION_TEST_PACK_P3_53_E2E_NPM_SCRIPT,
  INTEGRATION_TEST_PACK_P3_53_FLOW_STEPS,
  INTEGRATION_TEST_PACK_P3_53_MODULE_COUNT,
  INTEGRATION_TEST_PACK_P3_53_NPM_SCRIPT,
  INTEGRATION_TEST_PACK_P3_53_POLICY_ID,
  INTEGRATION_TEST_PACK_P3_53_SPEC,
  INTEGRATION_TEST_PACK_P3_53_UNIT_TEST,
  hasIntegrationTestPackP3_53Credentials,
  integrationTestPackModuleIds,
  isIntegrationTestPackP3_53Enabled,
} from "@/lib/qa/integration-test-pack-p3-53-policy";

const ROOT = process.cwd();

describe("Integration test pack (P3-53)", () => {
  it("locks policy id and seven-module pack", () => {
    expect(INTEGRATION_TEST_PACK_P3_53_POLICY_ID).toBe("integration-test-pack-p3-53-v1");
    expect(integrationTestPackModuleIds()).toHaveLength(INTEGRATION_TEST_PACK_P3_53_MODULE_COUNT);
    expect(INTEGRATION_TEST_PACK_P3_53_FLOW_STEPS).toHaveLength(8);
    expect(integrationTestPackModuleIds()).toEqual([
      "shopify_webhook",
      "woocommerce_webhook",
      "kds",
      "pos",
      "refund",
      "void",
      "shift",
    ]);
  });

  it("validates integration pack contract", () => {
    const validation = validateIntegrationTestPackContract(ROOT);
    expect(validation.passed).toBe(true);
    expect(validation.moduleCount).toBe(7);
    expect(validation.specCount).toBeGreaterThanOrEqual(4);
    expect(buildIntegrationTestPackModuleStatuses(ROOT).every((status) => status.specPresent)).toBe(
      true,
    );
    expect(uniqueIntegrationTestPackSpecs().length).toBeGreaterThanOrEqual(4);
  });

  it("passes full integration test pack audit", () => {
    const summary = auditIntegrationTestPackP3_53(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.specWired).toBe(true);
    expect(summary.flowWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.sevenModulesPresent).toBe(true);
    expect(summary.shopifyWebhookWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatIntegrationTestPackP3_53AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, INTEGRATION_TEST_PACK_P3_53_DOC))).toBe(true);
    expect(existsSync(join(ROOT, INTEGRATION_TEST_PACK_P3_53_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, INTEGRATION_TEST_PACK_P3_53_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, INTEGRATION_TEST_PACK_P3_53_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[INTEGRATION_TEST_PACK_P3_53_NPM_SCRIPT]).toContain(
      "audit-integration-test-pack-p3-53.ts",
    );
    expect(pkg.scripts?.[INTEGRATION_TEST_PACK_P3_53_CHECK_NPM_SCRIPT]).toContain(
      INTEGRATION_TEST_PACK_P3_53_UNIT_TEST,
    );
    expect(pkg.scripts?.[INTEGRATION_TEST_PACK_P3_53_E2E_NPM_SCRIPT]).toContain(
      "integration-test-pack-p3-53",
    );

    const workflow = readFileSync(join(ROOT, INTEGRATION_TEST_PACK_P3_53_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("integration-test-pack-p3-53");
  });

  it("E2E gate requires E2E_INTEGRATION_TEST_PACK flag", () => {
    const original = process.env.E2E_INTEGRATION_TEST_PACK;
    delete process.env.E2E_INTEGRATION_TEST_PACK;
    expect(isIntegrationTestPackP3_53Enabled()).toBe(false);
    process.env.E2E_INTEGRATION_TEST_PACK = "true";
    expect(isIntegrationTestPackP3_53Enabled()).toBe(true);
    if (original !== undefined) process.env.E2E_INTEGRATION_TEST_PACK = original;
    else delete process.env.E2E_INTEGRATION_TEST_PACK;
  });

  it("owner credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasIntegrationTestPackP3_53Credentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
