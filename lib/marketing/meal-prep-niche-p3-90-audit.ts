import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  mealPrepNicheHasAllPillars,
  MEAL_PREP_NICHE_P3_90_PILLARS,
  MEAL_PREP_NICHE_P3_90_TAGLINE,
} from "@/lib/marketing/meal-prep-niche-p3-90-content";
import {
  MEAL_PREP_NICHE_P3_90_BRAND,
  MEAL_PREP_NICHE_P3_90_CANONICAL_PATH,
  MEAL_PREP_NICHE_P3_90_COMPONENT,
  MEAL_PREP_NICHE_P3_90_DOC,
  MEAL_PREP_NICHE_P3_90_PILLAR_IDS,
  MEAL_PREP_NICHE_P3_90_POLICY_ID,
  MEAL_PREP_NICHE_P3_90_WIRING_PATHS,
} from "@/lib/marketing/meal-prep-niche-p3-90-policy";

export type MealPrepNicheP390AuditSummary = {
  policyId: typeof MEAL_PREP_NICHE_P3_90_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  allPillarsDefined: boolean;
  landingWired: boolean;
  componentWired: boolean;
  passed: boolean;
  failures: string[];
};

export function auditMealPrepNicheP390(root = process.cwd()): MealPrepNicheP390AuditSummary {
  const failures: string[] = [];

  const wiringComplete = MEAL_PREP_NICHE_P3_90_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );
  if (!wiringComplete) {
    failures.push("missing P3-90 wiring paths");
  }

  let docWired = false;
  if (existsSync(join(root, MEAL_PREP_NICHE_P3_90_DOC))) {
    const doc = readFileSync(join(root, MEAL_PREP_NICHE_P3_90_DOC), "utf8");
    docWired =
      doc.includes(MEAL_PREP_NICHE_P3_90_POLICY_ID) &&
      doc.includes(MEAL_PREP_NICHE_P3_90_BRAND) &&
      MEAL_PREP_NICHE_P3_90_PILLAR_IDS.every((id) => doc.includes(id));
  } else {
    failures.push(`missing doc: ${MEAL_PREP_NICHE_P3_90_DOC}`);
  }

  const allPillarsDefined =
    MEAL_PREP_NICHE_P3_90_PILLARS.length === 3 && mealPrepNicheHasAllPillars();
  if (!allPillarsDefined) {
    failures.push("missing subscription/production/storefront pillars");
  }

  let landingWired = false;
  const landingPath = join(root, "components/marketing/meal-prep-software-landing.tsx");
  if (existsSync(landingPath)) {
    const landing = readFileSync(landingPath, "utf8");
    landingWired =
      landing.includes("MealPrepOsNicheSection") &&
      landing.includes(MEAL_PREP_NICHE_P3_90_POLICY_ID);
  } else {
    failures.push("missing meal-prep-software-landing.tsx");
  }

  let componentWired = false;
  if (existsSync(join(root, MEAL_PREP_NICHE_P3_90_COMPONENT))) {
    const component = readFileSync(join(root, MEAL_PREP_NICHE_P3_90_COMPONENT), "utf8");
    componentWired =
      component.includes(MEAL_PREP_NICHE_P3_90_BRAND) &&
      component.includes("MEAL_PREP_NICHE_P3_90_TAGLINE") &&
      component.includes('data-testid="meal-prep-os-niche-section"') &&
      component.includes("meal-prep-os-pillar-") &&
      component.includes("MEAL_PREP_NICHE_P3_90_PILLARS");
  }

  const metaPath = join(root, "lib/marketing/meal-prep-software-landing-content.ts");
  if (existsSync(metaPath)) {
    const meta = readFileSync(metaPath, "utf8");
    if (!meta.includes(MEAL_PREP_NICHE_P3_90_BRAND)) {
      failures.push("landing meta must reference Meal Prep OS brand");
    }
    if (!meta.includes(MEAL_PREP_NICHE_P3_90_CANONICAL_PATH)) {
      failures.push("landing meta must reference canonical path");
    }
  }

  const passed =
    failures.length === 0 &&
    wiringComplete &&
    docWired &&
    allPillarsDefined &&
    landingWired &&
    componentWired;

  return {
    policyId: MEAL_PREP_NICHE_P3_90_POLICY_ID,
    wiringComplete,
    docWired,
    allPillarsDefined,
    landingWired,
    componentWired,
    passed,
    failures,
  };
}

export function formatMealPrepNicheP390AuditLines(
  summary: MealPrepNicheP390AuditSummary,
): string[] {
  return [
    `Meal Prep OS niche positioning (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `3 pillars (subscription/production/storefront): ${summary.allPillarsDefined ? "yes" : "no"}`,
    `Landing wired: ${summary.landingWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
    ...(summary.failures.length > 0 ? [`Failures: ${summary.failures.join("; ")}`] : []),
  ];
}
