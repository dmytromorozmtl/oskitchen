import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditLoadTestSuiteP3_56,
  formatLoadTestSuiteP3_56AuditLines,
} from "@/lib/qa/load-test-suite-p3-56-audit";
import {
  buildLoadTestSuiteModuleStatuses,
  validateLoadTestSuiteContract,
} from "@/lib/qa/load-test-suite-p3-56-measurement";
import {
  LOAD_TEST_SUITE_P3_56_AUDIT_SCRIPT,
  LOAD_TEST_SUITE_P3_56_CHECK_NPM_SCRIPT,
  LOAD_TEST_SUITE_P3_56_CI_WORKFLOW,
  LOAD_TEST_SUITE_P3_56_DOC,
  LOAD_TEST_SUITE_P3_56_FLOW_STEPS,
  LOAD_TEST_SUITE_P3_56_MODULE_COUNT,
  LOAD_TEST_SUITE_P3_56_MODULES,
  LOAD_TEST_SUITE_P3_56_NPM_SCRIPT,
  LOAD_TEST_SUITE_P3_56_POLICY_ID,
  LOAD_TEST_SUITE_P3_56_SPEC,
  LOAD_TEST_SUITE_P3_56_UNIT_TEST,
  isLoadTestSuiteP3_56Enabled,
  loadTestSuiteModuleIds,
} from "@/lib/qa/load-test-suite-p3-56-policy";
import {
  loadTestBurstPassed,
  simulateKdsRefreshSamples,
  simulatePosCheckoutConcurrencySamples,
  simulateWebhookBurstSamples,
  summarizeLoadTestRun,
} from "@/lib/qa/load-test-suite-p3-56-scoring";

const ROOT = process.cwd();

describe("Load test suite (P3-56)", () => {
  it("locks policy id and three-module matrix", () => {
    expect(LOAD_TEST_SUITE_P3_56_POLICY_ID).toBe("load-test-suite-p3-56-v1");
    expect(loadTestSuiteModuleIds()).toHaveLength(LOAD_TEST_SUITE_P3_56_MODULE_COUNT);
    expect(LOAD_TEST_SUITE_P3_56_FLOW_STEPS).toHaveLength(4);
    expect(loadTestSuiteModuleIds()).toEqual([
      "webhook_burst",
      "kds_refresh",
      "pos_checkout_concurrency",
    ]);
  });

  it("validates load test suite contract", () => {
    const validation = validateLoadTestSuiteContract(ROOT);
    expect(validation.passed).toBe(true);
    expect(validation.moduleCount).toBe(3);
    expect(buildLoadTestSuiteModuleStatuses(ROOT).every((status) => status.k6ScriptPresent)).toBe(
      true,
    );
  });

  it("scores simulated webhook burst within SLA", () => {
    const webhook = LOAD_TEST_SUITE_P3_56_MODULES.find((module) => module.id === "webhook_burst")!;
    const metrics = summarizeLoadTestRun(simulateWebhookBurstSamples(120));
    expect(
      loadTestBurstPassed(metrics, {
        maxErrorRate: webhook.maxErrorRate,
        maxP95Ms: webhook.maxP95Ms,
        minRequests: webhook.minRequests,
      }),
    ).toBe(true);
  });

  it("scores simulated kds refresh and pos concurrency within SLA", () => {
    const kds = LOAD_TEST_SUITE_P3_56_MODULES.find((module) => module.id === "kds_refresh")!;
    const pos = LOAD_TEST_SUITE_P3_56_MODULES.find(
      (module) => module.id === "pos_checkout_concurrency",
    )!;

    const kdsMetrics = summarizeLoadTestRun(simulateKdsRefreshSamples(180));
    const posMetrics = summarizeLoadTestRun(simulatePosCheckoutConcurrencySamples(96));

    expect(
      loadTestBurstPassed(kdsMetrics, {
        maxErrorRate: kds.maxErrorRate,
        maxP95Ms: kds.maxP95Ms,
        minRequests: kds.minRequests,
      }),
    ).toBe(true);
    expect(
      loadTestBurstPassed(posMetrics, {
        maxErrorRate: pos.maxErrorRate,
        maxP95Ms: pos.maxP95Ms,
        minRequests: pos.minRequests,
      }),
    ).toBe(true);
  });

  it("passes full load test suite audit", () => {
    const summary = auditLoadTestSuiteP3_56(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.specWired).toBe(true);
    expect(summary.flowWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.threeModulesPresent).toBe(true);
    expect(summary.k6ScriptsPresent).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatLoadTestSuiteP3_56AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, LOAD_TEST_SUITE_P3_56_DOC))).toBe(true);
    expect(existsSync(join(ROOT, LOAD_TEST_SUITE_P3_56_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, LOAD_TEST_SUITE_P3_56_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, LOAD_TEST_SUITE_P3_56_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[LOAD_TEST_SUITE_P3_56_NPM_SCRIPT]).toContain(
      "audit-load-test-suite-p3-56.ts",
    );
    expect(pkg.scripts?.[LOAD_TEST_SUITE_P3_56_CHECK_NPM_SCRIPT]).toContain(
      LOAD_TEST_SUITE_P3_56_UNIT_TEST,
    );
    expect(pkg.scripts?.["test:k6:load-webhook-burst-p3-56"]).toContain("webhook-burst-p3-56");

    const workflow = readFileSync(join(ROOT, LOAD_TEST_SUITE_P3_56_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("load-test-suite-p3-56");
  });

  it("E2E gate requires E2E_LOAD_TEST_SUITE flag", () => {
    const original = process.env.E2E_LOAD_TEST_SUITE;
    delete process.env.E2E_LOAD_TEST_SUITE;
    expect(isLoadTestSuiteP3_56Enabled()).toBe(false);
    process.env.E2E_LOAD_TEST_SUITE = "true";
    expect(isLoadTestSuiteP3_56Enabled()).toBe(true);
    if (original !== undefined) process.env.E2E_LOAD_TEST_SUITE = original;
    else delete process.env.E2E_LOAD_TEST_SUITE;
  });
});
