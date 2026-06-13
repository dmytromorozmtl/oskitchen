import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  coreWebVitalsPass,
  evaluateCoreWebVitals,
  type CoreWebVitalsMetrics,
} from "@/lib/performance/lighthouse-core-web-vitals-policy";
import {
  LIGHTHOUSE_CI_GATE_P3_60_CLS_MAX,
  LIGHTHOUSE_CI_GATE_P3_60_CONFIG,
  LIGHTHOUSE_CI_GATE_P3_60_FCP_MAX_MS,
  LIGHTHOUSE_CI_GATE_P3_60_LCP_MAX_MS,
  LIGHTHOUSE_CI_GATE_P3_60_PATHS,
  LIGHTHOUSE_CI_GATE_P3_60_WORKFLOW,
} from "@/lib/qa/lighthouse-ci-gate-p3-60-policy";

export type LighthouseCiGateContractValidation = {
  passed: boolean;
  configPresent: boolean;
  workflowWired: boolean;
  pathCount: number;
  fcpMaxMs: number;
  lcpMaxMs: number;
  clsMax: number;
  failures: string[];
};

export function validateLighthouseCiGateContract(
  root = process.cwd(),
): LighthouseCiGateContractValidation {
  const failures: string[] = [];

  const configPath = join(root, LIGHTHOUSE_CI_GATE_P3_60_CONFIG);
  if (!existsSync(configPath)) {
    failures.push(`missing LHCI config: ${LIGHTHOUSE_CI_GATE_P3_60_CONFIG}`);
  } else {
    const config = readFileSync(configPath, "utf8");
    if (!config.includes("maxNumericValue: 2000")) {
      failures.push("LHCI config missing FCP 2000ms threshold");
    }
    if (!config.includes("maxNumericValue: 3500")) {
      failures.push("LHCI config missing LCP 3500ms threshold");
    }
    if (!config.includes("maxNumericValue: 0.1")) {
      failures.push("LHCI config missing CLS 0.1 threshold");
    }
  }

  let workflowWired = false;
  const workflowPath = join(root, LIGHTHOUSE_CI_GATE_P3_60_WORKFLOW);
  if (!existsSync(workflowPath)) {
    failures.push(`missing workflow: ${LIGHTHOUSE_CI_GATE_P3_60_WORKFLOW}`);
  } else {
    const workflow = readFileSync(workflowPath, "utf8");
    workflowWired =
      workflow.includes("Core Web Vitals") &&
      workflow.includes("lighthouserc.core-web-vitals.cjs");
    if (!workflowWired) {
      failures.push("lighthouse.yml missing Core Web Vitals gate");
    }
  }

  return {
    passed: failures.length === 0,
    configPresent: existsSync(configPath),
    workflowWired,
    pathCount: LIGHTHOUSE_CI_GATE_P3_60_PATHS.length,
    fcpMaxMs: LIGHTHOUSE_CI_GATE_P3_60_FCP_MAX_MS,
    lcpMaxMs: LIGHTHOUSE_CI_GATE_P3_60_LCP_MAX_MS,
    clsMax: LIGHTHOUSE_CI_GATE_P3_60_CLS_MAX,
    failures,
  };
}

export function evaluateLighthouseCiGateMetrics(metrics: CoreWebVitalsMetrics): {
  passed: boolean;
  violations: ReturnType<typeof evaluateCoreWebVitals>;
} {
  const violations = evaluateCoreWebVitals(metrics);
  return { passed: coreWebVitalsPass(metrics), violations };
}
