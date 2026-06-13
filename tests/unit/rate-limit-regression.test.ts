import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  RATE_LIMIT_REGRESSION_BURST_COUNT,
  RATE_LIMIT_REGRESSION_MUTATION_METHODS,
  RATE_LIMIT_REGRESSION_MUTATION_TARGETS,
  RATE_LIMIT_REGRESSION_POLICY_ID,
  RATE_LIMIT_REGRESSION_SIMULATED_MAX,
  RATE_LIMIT_REGRESSION_UNIT_TEST,
  isRateLimitRegression429,
} from "@/lib/qa/rate-limit-regression-policy";
import {
  createSimulatedTokenConsumer,
  runRateLimitRegressionBenchmark,
  runRateLimitRegressionScenario,
} from "@/lib/qa/rate-limit-regression-scoring";

const consumeRateLimitToken = vi.hoisted(() => vi.fn());

vi.mock("@/services/security/rate-limit-service", () => ({
  consumeRateLimitToken,
}));

vi.mock("@/lib/rate-limit/client-ip", () => ({
  getClientIpFromRequest: () => "203.0.113.10",
}));

const ROOT = process.cwd();

describe("rate limit regression — mutation routes (P1-18)", () => {
  beforeEach(() => {
    consumeRateLimitToken.mockReset();
    const { consume } = createSimulatedTokenConsumer(RATE_LIMIT_REGRESSION_SIMULATED_MAX);
    consumeRateLimitToken.mockImplementation(async (bucketKey: string, policyKey: string) =>
      consume(bucketKey, policyKey),
    );
  });

  it("locks policy id and POST/PUT/DELETE burst targets", () => {
    expect(RATE_LIMIT_REGRESSION_POLICY_ID).toBe("rate-limit-regression-p1-18-v1");
    expect(RATE_LIMIT_REGRESSION_MUTATION_METHODS).toEqual(["POST", "PUT", "DELETE"]);
    expect(RATE_LIMIT_REGRESSION_BURST_COUNT).toBe(RATE_LIMIT_REGRESSION_SIMULATED_MAX + 1);
    expect(RATE_LIMIT_REGRESSION_MUTATION_TARGETS.length).toBeGreaterThanOrEqual(6);

    const kinds = new Set(RATE_LIMIT_REGRESSION_MUTATION_TARGETS.map((row) => row.kind));
    expect(kinds.has("middleware")).toBe(true);
    expect(kinds.has("webhook")).toBe(true);
  });

  it("returns 429 on N+1 POST to POS mutation route", async () => {
    const target = RATE_LIMIT_REGRESSION_MUTATION_TARGETS.find(
      (row) => row.id === "pos-terminal-post",
    )!;
    const result = await runRateLimitRegressionScenario(
      target,
      RATE_LIMIT_REGRESSION_BURST_COUNT,
    );
    expect(result.passed).toBe(true);
    expect(result.first429AtRequest).toBe(RATE_LIMIT_REGRESSION_BURST_COUNT);
    expect(isRateLimitRegression429(429)).toBe(true);
  });

  it("returns 429 on N+1 webhook POST", async () => {
    const target = RATE_LIMIT_REGRESSION_MUTATION_TARGETS.find(
      (row) => row.id === "webhook-shopify-orders-post",
    )!;
    const result = await runRateLimitRegressionScenario(
      target,
      RATE_LIMIT_REGRESSION_BURST_COUNT,
    );
    expect(result.passed).toBe(true);
  });

  it("passes full mutation regression benchmark across priority routes", async () => {
    const result = await runRateLimitRegressionBenchmark();
    expect(result.passed).toBe(true);
    expect(result.passPct).toBe(100);
    expect(result.scenarioCount).toBe(RATE_LIMIT_REGRESSION_MUTATION_TARGETS.length);
  });

  it("registers benchmark script and wiring paths", () => {
    expect(existsSync(join(ROOT, "scripts/run-rate-limit-regression-benchmark.ts"))).toBe(true);
    expect(RATE_LIMIT_REGRESSION_UNIT_TEST).toBe(
      "tests/unit/rate-limit-regression.test.ts",
    );

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["benchmark:rate-limit-regression"]).toContain(
      "run-rate-limit-regression-benchmark.ts",
    );
    expect(pkg.scripts?.["check:rate-limit-regression"]).toContain(
      "rate-limit-regression.test.ts",
    );
  });
});
