import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  LOAD_TEST_SUITE_P3_56_MODULE_COUNT,
  LOAD_TEST_SUITE_P3_56_MODULES,
  type LoadTestSuiteModuleId,
} from "@/lib/qa/load-test-suite-p3-56-policy";
import {
  loadTestBurstPassed,
  loadTestConcurrencyPassed,
  simulateKdsRefreshSamples,
  simulatePosCheckoutConcurrencySamples,
  simulateWebhookBurstSamples,
} from "@/lib/qa/load-test-suite-p3-56-scoring";

export type LoadTestSuiteModuleStatus = {
  moduleId: LoadTestSuiteModuleId;
  k6ScriptPresent: boolean;
  npmScript: string;
};

export function buildLoadTestSuiteModuleStatuses(
  root = process.cwd(),
): LoadTestSuiteModuleStatus[] {
  return LOAD_TEST_SUITE_P3_56_MODULES.map((module) => ({
    moduleId: module.id,
    k6ScriptPresent: existsSync(join(root, module.k6Script)),
    npmScript: module.npmScript,
  }));
}

export function validateLoadTestSuiteContract(root = process.cwd()): {
  passed: boolean;
  moduleCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  const statuses = buildLoadTestSuiteModuleStatuses(root);

  if (statuses.length !== LOAD_TEST_SUITE_P3_56_MODULE_COUNT) {
    errors.push(`Expected ${LOAD_TEST_SUITE_P3_56_MODULE_COUNT} modules, got ${statuses.length}`);
  }

  for (const status of statuses) {
    if (!status.k6ScriptPresent) {
      errors.push(`${status.moduleId}: missing k6 script`);
    }
  }

  const required: LoadTestSuiteModuleId[] = [
    "webhook_burst",
    "kds_refresh",
    "pos_checkout_concurrency",
  ];
  for (const moduleId of required) {
    if (!statuses.some((entry) => entry.moduleId === moduleId)) {
      errors.push(`Missing module: ${moduleId}`);
    }
  }

  const webhook = LOAD_TEST_SUITE_P3_56_MODULES.find((module) => module.id === "webhook_burst");
  const kds = LOAD_TEST_SUITE_P3_56_MODULES.find((module) => module.id === "kds_refresh");
  const pos = LOAD_TEST_SUITE_P3_56_MODULES.find(
    (module) => module.id === "pos_checkout_concurrency",
  );

  if (!webhook || !kds || !pos) {
    errors.push("Missing one or more load test modules");
  } else {
    const webhookSim = simulateWebhookBurstSamples(120);
    const kdsSim = simulateKdsRefreshSamples(180);
    const posSim = simulatePosCheckoutConcurrencySamples(96);

    if (
      !loadTestBurstPassed(
        {
          requestCount: webhookSim.length,
          errorRate: webhookSim.filter((value) => value < 0).length / webhookSim.length,
          p95Ms: Math.max(...webhookSim.map(Math.abs)),
          durationMs: webhookSim.reduce((sum, value) => sum + Math.abs(value), 0),
        },
        {
          maxErrorRate: webhook.maxErrorRate,
          maxP95Ms: webhook.maxP95Ms,
          minRequests: webhook.minRequests,
        },
      )
    ) {
      errors.push("webhook_burst simulated metrics failed contract");
    }

    if (
      !loadTestBurstPassed(
        {
          requestCount: kdsSim.length,
          errorRate: 0,
          p95Ms: Math.max(...kdsSim),
          durationMs: kdsSim.reduce((sum, value) => sum + value, 0),
        },
        {
          maxErrorRate: kds.maxErrorRate,
          maxP95Ms: kds.maxP95Ms,
          minRequests: kds.minRequests,
        },
      )
    ) {
      errors.push("kds_refresh simulated metrics failed contract");
    }

    if (
      !loadTestConcurrencyPassed(
        {
          requestCount: posSim.length,
          errorRate: 0,
          p95Ms: Math.max(...posSim),
          durationMs: posSim.reduce((sum, value) => sum + value, 0),
        },
        {
          maxErrorRate: pos.maxErrorRate,
          maxP95Ms: pos.maxP95Ms,
          minRequests: pos.minRequests,
        },
      )
    ) {
      errors.push("pos_checkout_concurrency simulated metrics failed contract");
    }
  }

  return {
    passed: errors.length === 0,
    moduleCount: statuses.length,
    errors,
  };
}

export function findLoadTestSuiteModule(moduleId: LoadTestSuiteModuleId) {
  return LOAD_TEST_SUITE_P3_56_MODULES.find((module) => module.id === moduleId);
}
