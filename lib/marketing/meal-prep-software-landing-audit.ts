import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MEAL_PREP_SOFTWARE_GOLDEN_PATH_DOC,
  MEAL_PREP_SOFTWARE_HONESTY_MARKERS,
  MEAL_PREP_SOFTWARE_LANDING_ABSOLUTE_FINAL_POLICY_ID,
  MEAL_PREP_SOFTWARE_LANDING_COMPONENT_PATH,
  MEAL_PREP_SOFTWARE_LANDING_CONTENT_PATH,
  MEAL_PREP_SOFTWARE_LANDING_PAGE_PATH,
  MEAL_PREP_SOFTWARE_LANDING_ROUTE,
  MEAL_PREP_SOFTWARE_PRIMARY_KEYWORD,
  MEAL_PREP_SOFTWARE_REQUIRED_SECTIONS,
  MEAL_PREP_SOFTWARE_WIRING_PATHS,
} from "@/lib/marketing/meal-prep-software-landing-absolute-final-policy";

export type MealPrepSoftwareLandingAudit = {
  ok: boolean;
  failures: string[];
};

export function auditMealPrepSoftwareLandingWiring(root = process.cwd()): MealPrepSoftwareLandingAudit {
  const failures: string[] = [];

  for (const rel of MEAL_PREP_SOFTWARE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(
    join(root, MEAL_PREP_SOFTWARE_LANDING_COMPONENT_PATH),
    "utf8",
  );
  const contentSource = readFileSync(
    join(root, MEAL_PREP_SOFTWARE_LANDING_CONTENT_PATH),
    "utf8",
  );
  const pageSource = readFileSync(join(root, MEAL_PREP_SOFTWARE_LANDING_PAGE_PATH), "utf8");

  for (const section of MEAL_PREP_SOFTWARE_REQUIRED_SECTIONS) {
    if (!componentSource.includes(section)) {
      failures.push(`landing component missing section marker: ${section}`);
    }
  }

  for (const marker of MEAL_PREP_SOFTWARE_HONESTY_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`landing component missing honesty marker: ${marker}`);
    }
  }

  if (!contentSource.includes(MEAL_PREP_SOFTWARE_LANDING_ROUTE)) {
    failures.push("content missing landing route constant");
  }

  if (!contentSource.includes(MEAL_PREP_SOFTWARE_PRIMARY_KEYWORD)) {
    failures.push("content missing primary SEO keyword");
  }

  if (!pageSource.includes("MealPrepSoftwareLanding")) {
    failures.push("page missing MealPrepSoftwareLanding component");
  }

  const goldenPathDoc = readFileSync(join(root, MEAL_PREP_SOFTWARE_GOLDEN_PATH_DOC), "utf8");
  if (!goldenPathDoc.includes(MEAL_PREP_SOFTWARE_LANDING_ROUTE)) {
    failures.push("golden path doc missing link to /meal-prep-software");
  }

  if (!goldenPathDoc.includes(MEAL_PREP_SOFTWARE_LANDING_ABSOLUTE_FINAL_POLICY_ID)) {
    // optional - add link in golden path doc update
  }

  return { ok: failures.length === 0, failures };
}
