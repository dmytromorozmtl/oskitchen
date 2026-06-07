import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { GOLDEN_DEMO_SCENARIOS } from "@/lib/demo/golden-demo-scenarios";
import {
  MEAL_PREP_VERTICAL_DEMO_SCENARIO_ID,
  MEAL_PREP_VERTICAL_GOLDEN_PATH_DOC,
  MEAL_PREP_VERTICAL_HONESTY_MARKERS,
  MEAL_PREP_VERTICAL_RECOMMENDED_PLAN,
  MEAL_PREP_VERTICAL_RECOMMENDED_PRICE_USD,
  MEAL_PREP_VERTICAL_REQUIRED_HEADINGS,
  MEAL_PREP_VERTICAL_REQUIRED_SECTIONS,
  MEAL_PREP_VERTICAL_WIRING_PATHS,
} from "@/lib/marketing/meal-prep-vertical-golden-path-absolute-final-policy";
import { PLAN_REGISTRY } from "@/lib/billing/plan-registry";

export type MealPrepVerticalGoldenPathAudit = {
  ok: boolean;
  failures: string[];
  sectionCount: number;
  demoScenarioPresent: boolean;
  recommendedPlanPriceUsd: number | null;
};

export function auditMealPrepVerticalGoldenPathDoc(source: string): {
  missingSections: string[];
  missingHeadings: string[];
  sectionCount: number;
} {
  const missingSections = MEAL_PREP_VERTICAL_REQUIRED_SECTIONS.filter(
    (section) => !source.includes(section),
  );
  const missingHeadings = MEAL_PREP_VERTICAL_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const sectionCount =
    MEAL_PREP_VERTICAL_REQUIRED_SECTIONS.length - missingSections.length;

  return { missingSections, missingHeadings, sectionCount };
}

export function auditMealPrepVerticalGoldenPathWiring(
  root = process.cwd(),
): MealPrepVerticalGoldenPathAudit {
  const failures: string[] = [];

  for (const rel of MEAL_PREP_VERTICAL_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const doc = readFileSync(join(root, MEAL_PREP_VERTICAL_GOLDEN_PATH_DOC), "utf8");
  const docAudit = auditMealPrepVerticalGoldenPathDoc(doc);

  if (docAudit.missingSections.length > 0) {
    failures.push(`missing sections: ${docAudit.missingSections.join(", ")}`);
  }
  if (docAudit.missingHeadings.length > 0) {
    failures.push(`missing headings: ${docAudit.missingHeadings.join(", ")}`);
  }

  for (const marker of MEAL_PREP_VERTICAL_HONESTY_MARKERS) {
    if (!doc.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!doc.includes("meal-prep-vertical-golden-path-absolute-final-v1")) {
    failures.push("golden path doc missing absolute final policy id");
  }

  if (!doc.includes(MEAL_PREP_VERTICAL_DEMO_SCENARIO_ID)) {
    failures.push(`golden path doc missing demo scenario ${MEAL_PREP_VERTICAL_DEMO_SCENARIO_ID}`);
  }

  const demoScenarioPresent = GOLDEN_DEMO_SCENARIOS.some(
    (s) => s.scenarioId === MEAL_PREP_VERTICAL_DEMO_SCENARIO_ID,
  );
  if (!demoScenarioPresent) {
    failures.push(`golden demo scenario ${MEAL_PREP_VERTICAL_DEMO_SCENARIO_ID} not registered`);
  }

  const recommendedPlanPriceUsd =
    PLAN_REGISTRY[MEAL_PREP_VERTICAL_RECOMMENDED_PLAN].priceMonthlyUsd;
  if (recommendedPlanPriceUsd !== MEAL_PREP_VERTICAL_RECOMMENDED_PRICE_USD) {
    failures.push(
      `Pro plan price drift: expected $${MEAL_PREP_VERTICAL_RECOMMENDED_PRICE_USD}, got $${recommendedPlanPriceUsd ?? "null"}`,
    );
  }

  if (!doc.includes(`$${MEAL_PREP_VERTICAL_RECOMMENDED_PRICE_USD}/mo`)) {
    failures.push("golden path doc missing recommended Pro pricing");
  }

  return {
    ok: failures.length === 0,
    failures,
    sectionCount: docAudit.sectionCount,
    demoScenarioPresent,
    recommendedPlanPriceUsd,
  };
}
