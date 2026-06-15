import { describe, expect, it } from "vitest";

import {
  validateEra25CharterDocSections,
  validateFirstEra25CharterDocSections,
} from "@/lib/commercial/validate-era25-charter-doc-sections-era24";

const COMPLETE_CHARTER = `# era25-enterprise-procurement charter

## Problem statement
Why era24 rhythms are insufficient.

## Success criteria
Measurable honest criteria.

## Policy IDs
era25-enterprise-procurement-v1

## Backlog ID
KOS-E25-001

## Ops scripts
ops:validate-enterprise-procurement
ops:run-enterprise-procurement-orchestrator

## CI scripts
test:ci:enterprise-procurement-era25:cert

## Briefing scheme
Separate from era21 priorities 0–8.

## Rollback / NO-GO
Explicit abort criteria.

## Leadership sign-off
Product + engineering leadership sign-off 2026-05-28.
`;

describe("validate-era25-charter-doc-sections-era24", () => {
  it("detects all sections in complete charter", () => {
    const result = validateEra25CharterDocSections(COMPLETE_CHARTER);
    expect(result.sectionsValid).toBe(true);
    expect(result.missingSectionIds).toEqual([]);
  });

  it("reports missing sections in incomplete charter", () => {
    const result = validateEra25CharterDocSections("# era25-test\n\n## Problem statement\n");
    expect(result.sectionsValid).toBe(false);
    expect(result.missingSectionIds.length).toBeGreaterThan(0);
  });

  it("validates first charter doc when none exist", () => {
    const result = validateFirstEra25CharterDocSections();
    expect(result.charterDocPath).toBeNull();
    expect(result.sectionsValid).toBe(false);
    expect(result.missingSectionIds.length).toBe(10);
  });
});
