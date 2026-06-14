import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditDeveloperApiRateLimitsP275,
  formatDeveloperApiRateLimitsP275AuditLines,
} from "@/lib/developer/developer-api-rate-limits-p2-75-audit";
import {
  DEVELOPER_API_RATE_LIMITS_P2_75_ARTIFACT,
  DEVELOPER_API_RATE_LIMITS_P2_75_CHECK_NPM_SCRIPT,
  DEVELOPER_API_RATE_LIMITS_P2_75_CI_NPM_SCRIPT,
  DEVELOPER_API_RATE_LIMITS_P2_75_CI_WORKFLOW,
  DEVELOPER_API_RATE_LIMITS_P2_75_DOC,
  DEVELOPER_API_OPENAPI_PATH,
  DEVELOPER_API_RATE_LIMITS_P2_75_POLICY_ID,
  DEVELOPER_API_RATE_LIMITS_P2_75_SCENARIO_COUNT,
  DEVELOPER_API_SANDBOX_KEY_PREFIX,
  DEVELOPER_API_RATE_LIMITS_P2_75_UNIT_TEST,
  DEVELOPER_API_RATE_LIMITS_P2_75_WIRING_PATHS,
} from "@/lib/developer/developer-api-rate-limits-p2-75-policy";
import {
  buildDegradedDeveloperApiRateLimitsP275Scenarios,
  runDeveloperApiRateLimitsBenchmarkP275,
} from "@/lib/developer/developer-api-rate-limits-p2-75-scoring";
import {
  generateDeveloperApiKeySecret,
  isSandboxDeveloperApiKey,
} from "@/lib/developer/developer-api-sandbox-p2-75";

const ROOT = process.cwd();

describe("Developer API rate limits + OpenAPI + sandbox (P2-75)", () => {
  it("locks P2-75 policy and scenario count", () => {
    expect(DEVELOPER_API_RATE_LIMITS_P2_75_POLICY_ID).toBe(
      "developer-api-rate-limits-p2-75-v1",
    );
    expect(DEVELOPER_API_RATE_LIMITS_P2_75_SCENARIO_COUNT).toBe(6);
    expect(DEVELOPER_API_OPENAPI_PATH).toBe("/api/openapi.json");
  });

  it("generates sandbox and production API key secrets", () => {
    const sandbox = generateDeveloperApiKeySecret("sandbox");
    const production = generateDeveloperApiKeySecret("production");
    expect(isSandboxDeveloperApiKey(sandbox)).toBe(true);
    expect(sandbox.startsWith(DEVELOPER_API_SANDBOX_KEY_PREFIX)).toBe(true);
    expect(isSandboxDeveloperApiKey(production)).toBe(false);
  });

  it("passes full developer API rate limits flow benchmark", () => {
    const benchmark = runDeveloperApiRateLimitsBenchmarkP275();
    expect(benchmark.scenarioCount).toBe(6);
    expect(benchmark.passPct).toBe(100);
    expect(benchmark.passed).toBe(true);
  });

  it("detects degraded developer API rate limits scenarios", () => {
    const degraded = runDeveloperApiRateLimitsBenchmarkP275(
      buildDegradedDeveloperApiRateLimitsP275Scenarios(),
    );
    expect(degraded.passed).toBe(false);
    expect(degraded.passPct).toBeLessThan(100);
  });

  it("passes full P2-75 developer API rate limits audit", () => {
    const summary = auditDeveloperApiRateLimitsP275(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.panelWired).toBe(true);
    expect(summary.docsPageWired).toBe(true);
    expect(summary.perKeyLimitWired).toBe(true);
    expect(summary.openapiWired).toBe(true);
    expect(summary.sandboxWired).toBe(true);
    expect(summary.apiKeysPanelWired).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-75 wiring paths, CI gate, and artifact", () => {
    for (const path of DEVELOPER_API_RATE_LIMITS_P2_75_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[DEVELOPER_API_RATE_LIMITS_P2_75_CHECK_NPM_SCRIPT]).toContain(
      DEVELOPER_API_RATE_LIMITS_P2_75_UNIT_TEST,
    );
    expect(pkg.scripts?.[DEVELOPER_API_RATE_LIMITS_P2_75_CI_NPM_SCRIPT]).toContain(
      DEVELOPER_API_RATE_LIMITS_P2_75_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, DEVELOPER_API_RATE_LIMITS_P2_75_CI_WORKFLOW), "utf8");
    expect(ci).toContain(DEVELOPER_API_RATE_LIMITS_P2_75_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, DEVELOPER_API_RATE_LIMITS_P2_75_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(DEVELOPER_API_RATE_LIMITS_P2_75_POLICY_ID);
    expect(artifact.status).toBe("LIVE");
    expect(artifact.scenarioCount).toBe(6);

    const doc = readFileSync(join(ROOT, DEVELOPER_API_RATE_LIMITS_P2_75_DOC), "utf8");
    expect(doc).toContain(DEVELOPER_API_RATE_LIMITS_P2_75_POLICY_ID);
    expect(doc).toContain("kos_test_");
  });

  it("formats audit lines", () => {
    const summary = auditDeveloperApiRateLimitsP275(ROOT);
    const lines = formatDeveloperApiRateLimitsP275AuditLines(summary);
    expect(lines.some((line) => line.includes(DEVELOPER_API_RATE_LIMITS_P2_75_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
