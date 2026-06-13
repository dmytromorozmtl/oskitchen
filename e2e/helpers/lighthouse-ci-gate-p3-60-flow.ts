import {
  LIGHTHOUSE_CI_GATE_P3_60_CLS_MAX,
  LIGHTHOUSE_CI_GATE_P3_60_FCP_MAX_MS,
  LIGHTHOUSE_CI_GATE_P3_60_FLOW_STEPS,
  LIGHTHOUSE_CI_GATE_P3_60_LCP_MAX_MS,
  LIGHTHOUSE_CI_GATE_P3_60_PATHS,
} from "@/lib/qa/lighthouse-ci-gate-p3-60-policy";
import { validateLighthouseCiGateContract } from "@/lib/qa/lighthouse-ci-gate-p3-60-measurement";

export function listLighthouseCiGatePaths() {
  return [...LIGHTHOUSE_CI_GATE_P3_60_PATHS];
}

export function runLighthouseCiGateContractStep() {
  const validation = validateLighthouseCiGateContract();
  return {
    step: LIGHTHOUSE_CI_GATE_P3_60_FLOW_STEPS[0],
    passed: validation.passed,
    paths: listLighthouseCiGatePaths(),
    fcpMaxMs: LIGHTHOUSE_CI_GATE_P3_60_FCP_MAX_MS,
    lcpMaxMs: LIGHTHOUSE_CI_GATE_P3_60_LCP_MAX_MS,
    clsMax: LIGHTHOUSE_CI_GATE_P3_60_CLS_MAX,
    failures: validation.failures,
  };
}

export function runLighthouseCiGatePolicyFlow() {
  return {
    steps: [...LIGHTHOUSE_CI_GATE_P3_60_FLOW_STEPS],
    contract: runLighthouseCiGateContractStep(),
  };
}
