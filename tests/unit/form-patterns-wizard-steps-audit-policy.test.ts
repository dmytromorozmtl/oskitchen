import { describe, expect, it } from "vitest";

import {
  auditWizardFormPatterns,
  findWizardFormPatternViolations,
  WIZARD_FORM_PATTERN_AUDIT_POLICY_ID,
} from "@/lib/design/form-patterns-wizard-steps-audit-policy";
import {
  wizardStepActionsClass,
  wizardStepFieldClass,
} from "@/lib/design/form-patterns-wizard-steps";

describe("form patterns wizard steps audit policy (DES-26)", () => {
  it("locks DES-26 policy id and canonical wizard form classes", () => {
    expect(WIZARD_FORM_PATTERN_AUDIT_POLICY_ID).toBe("form-patterns-wizard-steps-des26-v1");
    expect(wizardStepFieldClass).toContain("space-y-2");
    expect(wizardStepActionsClass).toContain("border-t");
  });

  it("flags duplicated wizard layout strings", () => {
    const violations = findWizardFormPatternViolations(`
      <section className="space-y-4">
      <div className={wizardStepSectionClass}>
    `);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.pattern).toBe("space-y-4");
  });

  it("passes audit on migrated wizard surfaces", () => {
    const report = auditWizardFormPatterns();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.violations.length === 0)).toBe(true);
    expect(report.modules.some((m) => m.tokenReferences > 0)).toBe(true);
  });
});
