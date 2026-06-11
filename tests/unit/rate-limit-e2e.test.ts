import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { policyMaxRequests } from "@/lib/api-public/public-api-rate-limit-e2e-policy";
import { auditRateLimitE2E } from "@/lib/qa/rate-limit-e2e-audit";
import {
  RATE_LIMIT_E2E_AUDIT_SCRIPT,
  RATE_LIMIT_E2E_BURST_MIN_REQUESTS,
  RATE_LIMIT_E2E_BURST_POLICY_KEY,
  RATE_LIMIT_E2E_BURST_TARGET_COUNT,
  RATE_LIMIT_E2E_CI_WORKFLOW,
  RATE_LIMIT_E2E_E2E_SPEC,
  RATE_LIMIT_E2E_FLOW_STEPS,
  RATE_LIMIT_E2E_NPM_SCRIPT,
  RATE_LIMIT_E2E_POLICY_ID,
  RATE_LIMIT_E2E_UNIT_TEST,
  hasRateLimitE2ECredentials,
  hasRateLimitHttpBaseUrl,
  isRateLimit429Status,
  isRateLimitE2EEnabled,
  resolveRateLimitBurstTargetCount,
} from "@/lib/qa/rate-limit-e2e-policy";

const ROOT = process.cwd();

describe("Rate limit E2E (P1-53)", () => {
  it("locks policy id and 101+ burst thresholds", () => {
    expect(RATE_LIMIT_E2E_POLICY_ID).toBe("rate-limit-e2e-v1");
    expect(RATE_LIMIT_E2E_BURST_MIN_REQUESTS).toBe(101);
    expect(RATE_LIMIT_E2E_BURST_POLICY_KEY).toBe("public_api_orders_get");
    expect(policyMaxRequests(RATE_LIMIT_E2E_BURST_POLICY_KEY)).toBe(120);
    expect(RATE_LIMIT_E2E_BURST_TARGET_COUNT).toBe(121);
    expect(resolveRateLimitBurstTargetCount(120)).toBe(121);
    expect(RATE_LIMIT_E2E_FLOW_STEPS).toEqual([
      "seed_api_key",
      "burst_requests",
      "assert_429_response",
    ]);
  });

  it("recognizes 429 status", () => {
    expect(isRateLimit429Status(429)).toBe(true);
    expect(isRateLimit429Status(200)).toBe(false);
  });

  it("audits E2E spec, burst loop, and guard wiring", () => {
    const summary = auditRateLimitE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.publicApiGuardWired).toBe(true);
    expect(summary.burstLoopWired).toBe(true);
    expect(summary.assert429Wired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, RATE_LIMIT_E2E_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, RATE_LIMIT_E2E_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, RATE_LIMIT_E2E_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[RATE_LIMIT_E2E_NPM_SCRIPT]).toContain("audit-rate-limit-e2e.ts");
    expect(pkg.scripts?.["test:ci:rate-limit-e2e"]).toContain(RATE_LIMIT_E2E_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, RATE_LIMIT_E2E_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:rate-limit-e2e");
  });

  it("E2E gate requires E2E_RATE_LIMIT flag", () => {
    const original = process.env.E2E_RATE_LIMIT;
    delete process.env.E2E_RATE_LIMIT;
    expect(isRateLimitE2EEnabled()).toBe(false);
    process.env.E2E_RATE_LIMIT = "true";
    expect(isRateLimitE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_RATE_LIMIT = original;
    else delete process.env.E2E_RATE_LIMIT;
  });

  it("credentials gate is false without DATABASE_URL", () => {
    const original = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    expect(hasRateLimitE2ECredentials()).toBe(false);
    if (original !== undefined) process.env.DATABASE_URL = original;
  });

  it("HTTP burst gate requires base URL env", () => {
    const originalPlaywright = process.env.PLAYWRIGHT_BASE_URL;
    const originalE2e = process.env.E2E_BASE_URL;
    const originalSmoke = process.env.SMOKE_BASE_URL;
    delete process.env.PLAYWRIGHT_BASE_URL;
    delete process.env.E2E_BASE_URL;
    delete process.env.SMOKE_BASE_URL;
    expect(hasRateLimitHttpBaseUrl()).toBe(false);
    process.env.PLAYWRIGHT_BASE_URL = "https://staging.example.com";
    expect(hasRateLimitHttpBaseUrl()).toBe(true);
    if (originalPlaywright !== undefined) process.env.PLAYWRIGHT_BASE_URL = originalPlaywright;
    else delete process.env.PLAYWRIGHT_BASE_URL;
    if (originalE2e !== undefined) process.env.E2E_BASE_URL = originalE2e;
    else delete process.env.E2E_BASE_URL;
    if (originalSmoke !== undefined) process.env.SMOKE_BASE_URL = originalSmoke;
    else delete process.env.SMOKE_BASE_URL;
  });
});
