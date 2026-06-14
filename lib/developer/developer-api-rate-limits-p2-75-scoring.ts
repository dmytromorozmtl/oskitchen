import { DEVELOPER_API_RATE_LIMITS_P2_75_SCENARIO_COUNT } from "@/lib/developer/developer-api-rate-limits-p2-75-policy";
import {
  simulateDualBucketPublicApiLimit,
  simulatePerKeyBurstLimit,
  productionBurstMax,
  sandboxBurstMax,
} from "@/lib/developer/developer-api-rate-limits-p2-75-flow";
import { isSandboxDeveloperApiKey } from "@/lib/developer/developer-api-sandbox-p2-75";

export type DeveloperApiRateLimitsScenarioP275 = {
  id: string;
  label: string;
  run: () => { passed: boolean; message?: string };
};

function scenario(
  id: string,
  label: string,
  run: () => { passed: boolean; message?: string },
): DeveloperApiRateLimitsScenarioP275 {
  return { id, label, run };
}

export function buildDeveloperApiRateLimitsCorpusP275(): DeveloperApiRateLimitsScenarioP275[] {
  const prodKey = "kos_abc123productionkey";
  const sandboxKey = "kos_test_sandboxkey123";

  return [
    scenario("da-01-prod-burst-under", "Production key under burst limit passes", () => {
      const result = simulatePerKeyBurstLimit(prodKey, productionBurstMax() - 1);
      if (!result.ok) return { passed: false, message: result.error };
      return { passed: true };
    }),
    scenario("da-02-prod-burst-exceeded", "Production key at burst limit returns 429", () => {
      const result = simulatePerKeyBurstLimit(prodKey, productionBurstMax());
      if (result.ok) return { passed: false, message: "Expected rate limit block" };
      return { passed: true };
    }),
    scenario("da-03-sandbox-lower-burst", "Sandbox key has lower burst ceiling", () => {
      if (sandboxBurstMax() >= productionBurstMax()) {
        return { passed: false, message: "Sandbox burst must be lower than production" };
      }
      const result = simulatePerKeyBurstLimit(sandboxKey, sandboxBurstMax());
      if (result.ok) return { passed: false, message: "Expected sandbox block at max" };
      return { passed: true };
    }),
    scenario("da-04-sandbox-prefix-detect", "kos_test_ prefix detected as sandbox", () => {
      if (!isSandboxDeveloperApiKey(sandboxKey)) {
        return { passed: false, message: "Sandbox prefix not detected" };
      }
      if (isSandboxDeveloperApiKey(prodKey)) {
        return { passed: false, message: "Production key misclassified as sandbox" };
      }
      return { passed: true };
    }),
    scenario("da-05-dual-bucket-pass", "Dual-bucket key + route limits pass under ceiling", () => {
      const result = simulateDualBucketPublicApiLimit({
        apiKey: prodKey,
        routeKey: "public_api_products_get",
        keyCount: 10,
        routeCount: 10,
      });
      if (!result.ok) return { passed: false, message: result.error };
      return { passed: true };
    }),
    scenario("da-06-dual-bucket-key-block", "Key burst blocks before route limit", () => {
      const result = simulateDualBucketPublicApiLimit({
        apiKey: prodKey,
        routeKey: "public_api_products_get",
        keyCount: productionBurstMax(),
        routeCount: 0,
      });
      if (result.ok) return { passed: false, message: "Expected key burst block" };
      return { passed: true };
    }),
  ];
}

export type DeveloperApiRateLimitsBenchmarkP275Result = {
  scenarioCount: number;
  passedCount: number;
  passPct: number;
  passed: boolean;
  scenarioScores: Array<{ scenarioId: string; passed: boolean; message?: string }>;
};

export function runDeveloperApiRateLimitsBenchmarkP275(
  scenarios: DeveloperApiRateLimitsScenarioP275[] = buildDeveloperApiRateLimitsCorpusP275(),
): DeveloperApiRateLimitsBenchmarkP275Result {
  const scenarioScores = scenarios.map((scenarioItem) => {
    const outcome = scenarioItem.run();
    return {
      scenarioId: scenarioItem.id,
      passed: outcome.passed,
      message: outcome.message,
    };
  });
  const passedCount = scenarioScores.filter((score) => score.passed).length;
  const passPct =
    scenarios.length === 0 ? 0 : Math.round((passedCount / scenarios.length) * 100);

  return {
    scenarioCount: scenarios.length,
    passedCount,
    passPct,
    passed:
      scenarios.length === DEVELOPER_API_RATE_LIMITS_P2_75_SCENARIO_COUNT &&
      passedCount === scenarios.length,
    scenarioScores,
  };
}

export function buildDegradedDeveloperApiRateLimitsP275Scenarios(
  scenarios: DeveloperApiRateLimitsScenarioP275[] = buildDeveloperApiRateLimitsCorpusP275(),
): DeveloperApiRateLimitsScenarioP275[] {
  return scenarios.map((scenarioItem, index) =>
    index === 0
      ? {
          ...scenarioItem,
          run: () => ({ passed: false, message: "Degraded scenario" }),
        }
      : scenarioItem,
  );
}
