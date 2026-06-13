import {
  VISUAL_REGRESSION_DARK_MODE_P3_58_FLOW_STEPS,
  VISUAL_REGRESSION_DARK_MODE_P3_58_SNAPSHOT_PAIR_COUNT,
  VISUAL_REGRESSION_DARK_MODE_P3_58_TARGETS,
  VISUAL_REGRESSION_DARK_MODE_P3_58_TARGET_COUNT,
  VISUAL_REGRESSION_DARK_MODE_P3_58_THEME_MODES,
  visualRegressionDarkModeTargetIds,
} from "@/lib/qa/visual-regression-dark-mode-p3-58-policy";
import {
  buildVisualRegressionTargetStatuses,
  validateVisualRegressionDarkModeContract,
} from "@/lib/qa/visual-regression-dark-mode-p3-58-measurement";

export function listVisualRegressionTargets() {
  return VISUAL_REGRESSION_DARK_MODE_P3_58_TARGETS;
}

export function visualRegressionTargetCount(): number {
  return VISUAL_REGRESSION_DARK_MODE_P3_58_TARGET_COUNT;
}

export function visualRegressionSnapshotPairCount(): number {
  return VISUAL_REGRESSION_DARK_MODE_P3_58_SNAPSHOT_PAIR_COUNT;
}

export function runVisualRegressionContractStep() {
  const validation = validateVisualRegressionDarkModeContract();
  const statuses = buildVisualRegressionTargetStatuses();
  return {
    step: VISUAL_REGRESSION_DARK_MODE_P3_58_FLOW_STEPS[0],
    passed: validation.passed,
    targetIds: visualRegressionDarkModeTargetIds(),
    themeModes: [...VISUAL_REGRESSION_DARK_MODE_P3_58_THEME_MODES],
    statuses,
    failures: validation.failures,
  };
}

export function runVisualRegressionPolicyFlow() {
  return {
    steps: [...VISUAL_REGRESSION_DARK_MODE_P3_58_FLOW_STEPS],
    contract: runVisualRegressionContractStep(),
    targetCount: visualRegressionTargetCount(),
    snapshotPairCount: visualRegressionSnapshotPairCount(),
  };
}
