import { describe, expect, it } from "vitest";

import {
  validateEra25FirstProductSliceStagingChecklist,
  validateEra25FirstProductSliceStagingChecklistSections,
} from "@/lib/commercial/validate-era25-first-product-slice-staging-checklist-era24";

describe("validate-era25-first-product-slice-staging-checklist-era24", () => {
  it("validates staging checklist sections in repo doc", () => {
    const result = validateEra25FirstProductSliceStagingChecklist(process.cwd());
    expect(result.checklistPresent).toBe(true);
    expect(result.sectionsValid).toBe(true);
  });

  it("detects missing sections in incomplete content", () => {
    const result = validateEra25FirstProductSliceStagingChecklistSections("## Purpose\nonly");
    expect(result.sectionsValid).toBe(false);
    expect(result.missingSectionIds.length).toBeGreaterThan(0);
  });
});
