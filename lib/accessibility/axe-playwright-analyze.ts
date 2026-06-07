import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import {
  E2E_ACCESSIBILITY_AXE_WCAG_TAGS,
  filterSeriousAxeViolations,
} from "@/lib/accessibility/e2e-accessibility-axe-policy";

export async function analyzeSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags([...E2E_ACCESSIBILITY_AXE_WCAG_TAGS])
    .analyze();
  return filterSeriousAxeViolations(results.violations);
}
