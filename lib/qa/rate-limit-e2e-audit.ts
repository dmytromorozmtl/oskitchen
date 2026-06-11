import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  RATE_LIMIT_E2E_AUDIT_SCRIPT,
  RATE_LIMIT_E2E_BURST_MIN_REQUESTS,
  RATE_LIMIT_E2E_BURST_TARGET_COUNT,
  RATE_LIMIT_E2E_E2E_SPEC,
  RATE_LIMIT_E2E_FLOW_HELPER,
  RATE_LIMIT_E2E_FLOW_STEPS,
  RATE_LIMIT_E2E_NPM_SCRIPT,
  RATE_LIMIT_E2E_POLICY_ID,
  RATE_LIMIT_E2E_READY_HELPER,
  RATE_LIMIT_E2E_UNIT_TEST,
} from "@/lib/qa/rate-limit-e2e-policy";

export type RateLimitE2EAuditSummary = {
  policyId: typeof RATE_LIMIT_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  publicApiGuardWired: boolean;
  burstLoopWired: boolean;
  assert429Wired: boolean;
  burstMinRequests: number;
  burstTargetCount: number;
  flowStepCount: number;
  passed: boolean;
};

export function auditRateLimitE2E(root = process.cwd()): RateLimitE2EAuditSummary {
  const specPath = join(root, RATE_LIMIT_E2E_E2E_SPEC);
  const flowPath = join(root, RATE_LIMIT_E2E_FLOW_HELPER);
  const readyPath = join(root, RATE_LIMIT_E2E_READY_HELPER);
  const guardPath = join(root, "lib/api-public/guard.ts");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);

  let publicApiGuardWired = false;
  if (existsSync(guardPath)) {
    const source = readFileSync(guardPath, "utf8");
    publicApiGuardWired =
      source.includes("guardPublicApiV1Resource") &&
      (source.includes("enforcePublicApiRateLimits") ||
        source.includes("consumeRateLimitToken"));
  }

  let burstLoopWired = false;
  let assert429Wired = false;
  if (flowHelperPresent) {
    const source = readFileSync(flowPath, "utf8");
    burstLoopWired =
      source.includes("burst") &&
      (source.includes(RATE_LIMIT_E2E_BURST_MIN_REQUESTS.toString()) ||
        source.includes("RATE_LIMIT_E2E_BURST_MIN_REQUESTS"));
    assert429Wired =
      source.includes("429") &&
      (source.includes("assert_429") || source.includes("assertRateLimit429"));
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(RATE_LIMIT_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("RATE_LIMIT_E2E_POLICY_ID"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    publicApiGuardWired &&
    burstLoopWired &&
    assert429Wired &&
    specReferencesPolicy &&
    RATE_LIMIT_E2E_BURST_TARGET_COUNT > RATE_LIMIT_E2E_BURST_MIN_REQUESTS &&
    RATE_LIMIT_E2E_FLOW_STEPS.length === 3;

  return {
    policyId: RATE_LIMIT_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    publicApiGuardWired,
    burstLoopWired,
    assert429Wired,
    burstMinRequests: RATE_LIMIT_E2E_BURST_MIN_REQUESTS,
    burstTargetCount: RATE_LIMIT_E2E_BURST_TARGET_COUNT,
    flowStepCount: RATE_LIMIT_E2E_FLOW_STEPS.length,
    passed,
  };
}

export function formatRateLimitE2EAuditLines(summary: RateLimitE2EAuditSummary): string[] {
  return [
    `Rate limit E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${RATE_LIMIT_E2E_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Public API guard wired: ${summary.publicApiGuardWired ? "yes" : "no"}`,
    `Burst loop wired: ${summary.burstLoopWired ? "yes" : "no"}`,
    `429 assertion wired: ${summary.assert429Wired ? "yes" : "no"}`,
    `Burst min requests: ${summary.burstMinRequests}`,
    `Burst target count: ${summary.burstTargetCount}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${RATE_LIMIT_E2E_UNIT_TEST}`,
    `Audit script: ${RATE_LIMIT_E2E_AUDIT_SCRIPT}`,
    `NPM script: ${RATE_LIMIT_E2E_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
