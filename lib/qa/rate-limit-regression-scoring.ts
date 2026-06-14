import {
  enforceApiMutationRateLimitMiddleware,
  enforceApiRateLimitOrNull,
  enforceWebhookMutationRateLimitOrNull,
} from "@/lib/api/middleware-api-rate-limit";
import {
  RATE_LIMIT_REGRESSION_BURST_COUNT,
  RATE_LIMIT_REGRESSION_MUTATION_TARGETS,
  RATE_LIMIT_REGRESSION_SIMULATED_MAX,
  isRateLimitRegression429,
  type RateLimitRegressionTarget,
} from "@/lib/qa/rate-limit-regression-policy";

export type RateLimitRegressionScenarioResult = {
  id: string;
  method: string;
  pathname: string;
  burstCount: number;
  first429AtRequest: number | null;
  passed: boolean;
  detail: string;
};

export type RateLimitRegressionBenchmarkResult = {
  scenarioCount: number;
  passedCount: number;
  passPct: number;
  passed: boolean;
  scenarios: RateLimitRegressionScenarioResult[];
};

export type TokenConsumer = (
  bucketKey: string,
  policyKey: string,
) => Promise<{ ok: true } | { ok: false; retryAfterMs: number; reason?: string }>;

/** In-memory token consumer — returns limited after simulatedMax requests per bucket. */
export function createSimulatedTokenConsumer(simulatedMax: number): {
  consume: TokenConsumer;
  getCount: (bucketKey: string) => number;
} {
  const counts = new Map<string, number>();

  return {
    consume: async (bucketKey: string) => {
      const next = (counts.get(bucketKey) ?? 0) + 1;
      counts.set(bucketKey, next);
      if (next > simulatedMax) {
        return {
          ok: false as const,
          retryAfterMs: 60_000,
          reason: "limited",
        };
      }
      return { ok: true as const };
    },
    getCount: (bucketKey: string) => counts.get(bucketKey) ?? 0,
  };
}

async function invokeMutationGate(
  target: RateLimitRegressionTarget,
): Promise<Response | null> {
  const url = `https://example.com${target.pathname}`;
  const request = new Request(url, { method: target.method });

  if (target.kind === "webhook") {
    const blocked = await enforceWebhookMutationRateLimitOrNull(request, target.pathname);
    return blocked;
  }

  if (target.kind === "exempt_dedicated") {
    const blocked = await enforceApiRateLimitOrNull(
      request,
      `mutation:${target.pathname.replace(/^\/api\//, "").replace(/\//g, ".")}`,
    );
    return blocked;
  }

  const { NextRequest } = await import("next/server");
  const nextRequest = new NextRequest(url, { method: target.method });
  const blocked = await enforceApiMutationRateLimitMiddleware(nextRequest);
  return blocked;
}

export async function runRateLimitRegressionScenario(
  target: RateLimitRegressionTarget,
  burstCount: number,
  simulatedMax: number = RATE_LIMIT_REGRESSION_SIMULATED_MAX,
): Promise<RateLimitRegressionScenarioResult> {
  let first429AtRequest: number | null = null;

  for (let i = 1; i <= burstCount; i += 1) {
    const response = await invokeMutationGate(target);
    if (response && isRateLimitRegression429(response.status)) {
      first429AtRequest = i;
      break;
    }
  }

  const expected429At = simulatedMax + 1;
  const passed = first429AtRequest !== null && first429AtRequest === expected429At;

  return {
    id: target.id,
    method: target.method,
    pathname: target.pathname,
    burstCount,
    first429AtRequest,
    passed,
    detail: passed
      ? `${target.method} ${target.pathname} → 429 at request ${first429AtRequest}`
      : first429AtRequest
        ? `${target.method} ${target.pathname} → 429 at ${first429AtRequest}, expected ${expected429At}`
        : `${target.method} ${target.pathname} → no 429 in ${burstCount} requests`,
  };
}

export async function runRateLimitRegressionBenchmark(
  targets: readonly RateLimitRegressionTarget[] = RATE_LIMIT_REGRESSION_MUTATION_TARGETS,
  burstCount: number = RATE_LIMIT_REGRESSION_BURST_COUNT,
): Promise<RateLimitRegressionBenchmarkResult> {
  const scenarios: RateLimitRegressionScenarioResult[] = [];

  for (const target of targets) {
    scenarios.push(await runRateLimitRegressionScenario(target, burstCount));
  }

  const passedCount = scenarios.filter((row) => row.passed).length;
  const scenarioCount = scenarios.length;
  const passPct =
    scenarioCount === 0 ? 0 : Math.round((passedCount / scenarioCount) * 100);

  return {
    scenarioCount,
    passedCount,
    passPct,
    passed: passedCount === scenarioCount && scenarioCount > 0,
    scenarios,
  };
}
