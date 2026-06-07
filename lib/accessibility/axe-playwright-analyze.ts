import AxeBuilder from "@axe-core/playwright";

import {
  E2E_ACCESSIBILITY_AXE_WCAG_TAGS,
  filterSeriousAxeViolations,
} from "@/lib/accessibility/e2e-accessibility-axe-policy";

type PlaywrightPageForAxe = ConstructorParameters<typeof AxeBuilder>[0]["page"];

export async function analyzeSeriousA11yViolations(page: PlaywrightPageForAxe) {
  const results = await new AxeBuilder({ page })
    .withTags([...E2E_ACCESSIBILITY_AXE_WCAG_TAGS])
    .analyze();
  return filterSeriousAxeViolations(results.violations);
}
