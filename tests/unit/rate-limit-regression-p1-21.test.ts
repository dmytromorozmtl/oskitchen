import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  RATE_LIMIT_REGRESSION_P1_21_ARTIFACT,
  RATE_LIMIT_REGRESSION_P1_21_CHECK_NPM_SCRIPT,
  RATE_LIMIT_REGRESSION_P1_21_CI_NPM_SCRIPT,
  RATE_LIMIT_REGRESSION_P1_21_CI_WORKFLOW,
  RATE_LIMIT_REGRESSION_P1_21_DOC,
  RATE_LIMIT_REGRESSION_P1_21_HIGH_VOLUME_BURST,
  RATE_LIMIT_REGRESSION_P1_21_MUTATION_TARGETS,
  RATE_LIMIT_REGRESSION_P1_21_POLICY_ID,
  RATE_LIMIT_REGRESSION_P1_21_POLICY_KEY,
  RATE_LIMIT_REGRESSION_P1_21_PRIMARY_TARGET_ID,
  RATE_LIMIT_REGRESSION_P1_21_PRODUCTION_MAX,
  RATE_LIMIT_REGRESSION_P1_21_RATE_POLICIES_FILE,
  RATE_LIMIT_REGRESSION_P1_21_WINDOW_MS,
  RATE_LIMIT_REGRESSION_P1_21_WIRING_PATHS,
} from "@/lib/qa/rate-limit-regression-p1-21-policy";
import {
  createSimulatedTokenConsumer,
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

describe("Rate limit regression — 200+ requests / 60s → 429 (P1-21)", () => {
  beforeEach(() => {
    consumeRateLimitToken.mockReset();
    const { consume } = createSimulatedTokenConsumer(
      RATE_LIMIT_REGRESSION_P1_21_PRODUCTION_MAX,
    );
    consumeRateLimitToken.mockImplementation(async (bucketKey: string, policyKey: string) =>
      consume(bucketKey, policyKey),
    );
  });

  it("locks P1-21 production-scale regression constants", () => {
    expect(RATE_LIMIT_REGRESSION_P1_21_POLICY_ID).toBe("rate-limit-regression-p1-21-v1");
    expect(RATE_LIMIT_REGRESSION_P1_21_HIGH_VOLUME_BURST).toBeGreaterThan(200);
    expect(RATE_LIMIT_REGRESSION_P1_21_PRODUCTION_MAX + 1).toBe(121);
  });

  it("documents api_mutation as 120 requests per 60s window", () => {
    const policies = readFileSync(
      join(ROOT, RATE_LIMIT_REGRESSION_P1_21_RATE_POLICIES_FILE),
      "utf8",
    );
    expect(policies).toContain(`${RATE_LIMIT_REGRESSION_P1_21_POLICY_KEY}:`);
    expect(policies).toMatch(/api_mutation:\s*\{\s*windowMs:\s*60_000,\s*max:\s*120\s*\}/);
  });

  it("returns 429 after 200+ POST requests within the 60s api_mutation window", async () => {
    const target = RATE_LIMIT_REGRESSION_P1_21_MUTATION_TARGETS.find(
      (row) => row.id === RATE_LIMIT_REGRESSION_P1_21_PRIMARY_TARGET_ID,
    )!;
    const result = await runRateLimitRegressionScenario(
      target,
      RATE_LIMIT_REGRESSION_P1_21_HIGH_VOLUME_BURST,
      RATE_LIMIT_REGRESSION_P1_21_PRODUCTION_MAX,
    );

    expect(result.passed).toBe(true);
    expect(result.first429AtRequest).toBe(RATE_LIMIT_REGRESSION_P1_21_PRODUCTION_MAX + 1);
    expect(result.burstCount).toBe(201);
  });

  it("documents P1-21 and wires npm scripts + CI workflow", () => {
    for (const rel of RATE_LIMIT_REGRESSION_P1_21_WIRING_PATHS) {
      if (rel.endsWith(".json")) continue;
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }

    const doc = readFileSync(join(ROOT, RATE_LIMIT_REGRESSION_P1_21_DOC), "utf8");
    expect(doc).toContain(RATE_LIMIT_REGRESSION_P1_21_POLICY_ID);
    expect(doc).toContain("201");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[RATE_LIMIT_REGRESSION_P1_21_CHECK_NPM_SCRIPT]).toContain(
      "rate-limit-regression-p1-21.test.ts",
    );
    expect(pkg.scripts?.[RATE_LIMIT_REGRESSION_P1_21_CI_NPM_SCRIPT]).toContain(
      "rate-limit-regression-p1-21.test.ts",
    );

    const workflow = readFileSync(join(ROOT, RATE_LIMIT_REGRESSION_P1_21_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("rate-limit-regression-p1-21");

    const artifact = JSON.parse(
      readFileSync(join(ROOT, RATE_LIMIT_REGRESSION_P1_21_ARTIFACT), "utf8"),
    ) as {
      policyId: string;
      windowMs: number;
      productionMax: number;
      highVolumeBurst: number;
    };
    expect(artifact.policyId).toBe(RATE_LIMIT_REGRESSION_P1_21_POLICY_ID);
    expect(artifact.windowMs).toBe(RATE_LIMIT_REGRESSION_P1_21_WINDOW_MS);
    expect(artifact.productionMax).toBe(RATE_LIMIT_REGRESSION_P1_21_PRODUCTION_MAX);
    expect(artifact.highVolumeBurst).toBe(RATE_LIMIT_REGRESSION_P1_21_HIGH_VOLUME_BURST);
  });
});
