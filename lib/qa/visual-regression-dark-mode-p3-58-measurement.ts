import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  VISUAL_REGRESSION_DARK_MODE_P3_58_SNAPSHOT_PAIR_COUNT,
  VISUAL_REGRESSION_DARK_MODE_P3_58_TARGET_COUNT,
  VISUAL_REGRESSION_DARK_MODE_P3_58_TARGETS,
  VISUAL_REGRESSION_DARK_MODE_P3_58_THEME_MODES,
  visualRegressionDarkModeSnapshotName,
} from "@/lib/qa/visual-regression-dark-mode-p3-58-policy";

export type VisualRegressionTargetStatus = {
  id: string;
  path: string;
  fixturePresent: boolean;
  lightSnapshotName: string;
  darkSnapshotName: string;
};

export type VisualRegressionDarkModeContractValidation = {
  passed: boolean;
  targetCount: number;
  snapshotPairCount: number;
  failures: string[];
};

export function buildVisualRegressionTargetStatuses(
  root = process.cwd(),
): VisualRegressionTargetStatus[] {
  return VISUAL_REGRESSION_DARK_MODE_P3_58_TARGETS.map((target) => {
    const fixturePath = join(root, "app", "visual-test", target.snapshotStem, "page.tsx");
    return {
      id: target.id,
      path: target.path,
      fixturePresent: existsSync(fixturePath),
      lightSnapshotName: visualRegressionDarkModeSnapshotName(target.snapshotStem, "light"),
      darkSnapshotName: visualRegressionDarkModeSnapshotName(target.snapshotStem, "dark"),
    };
  });
}

export function validateVisualRegressionDarkModeContract(
  root = process.cwd(),
): VisualRegressionDarkModeContractValidation {
  const failures: string[] = [];
  const statuses = buildVisualRegressionTargetStatuses(root);

  for (const [index, status] of statuses.entries()) {
    if (!status.fixturePresent) {
      const target = VISUAL_REGRESSION_DARK_MODE_P3_58_TARGETS[index]!;
      failures.push(
        `missing fixture for ${status.id}: app/visual-test/${target.snapshotStem}/page.tsx`,
      );
    }
  }

  const specPath = join(root, "tests/visual/dark-mode-parity.spec.ts");
  if (!existsSync(specPath)) {
    failures.push("missing Playwright spec: tests/visual/dark-mode-parity.spec.ts");
  } else {
    const spec = readFileSync(specPath, "utf8");
    if (!spec.includes("visual: dark mode parity")) {
      failures.push("dark-mode-parity.spec.ts missing describe block");
    }
    if (!spec.includes("assertVisualThemeApplied")) {
      failures.push("dark-mode-parity.spec.ts missing theme assertion helper");
    }
  }

  const workflowPath = join(root, ".github/workflows/chromatic-visual.yml");
  if (!existsSync(workflowPath)) {
    failures.push("missing chromatic-visual.yml workflow");
  } else {
    const workflow = readFileSync(workflowPath, "utf8");
    if (!workflow.includes("dark-mode-parity")) {
      failures.push("chromatic-visual.yml missing dark-mode-parity reference");
    }
  }

  const targetCount = statuses.filter((status) => status.fixturePresent).length;
  const snapshotPairCount =
    targetCount * VISUAL_REGRESSION_DARK_MODE_P3_58_THEME_MODES.length;

  return {
    passed:
      failures.length === 0 &&
      targetCount === VISUAL_REGRESSION_DARK_MODE_P3_58_TARGET_COUNT &&
      snapshotPairCount === VISUAL_REGRESSION_DARK_MODE_P3_58_SNAPSHOT_PAIR_COUNT,
    targetCount,
    snapshotPairCount,
    failures,
  };
}
