import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FORM_PATTERNS_WIZARD_STEPS_POLICY_ID,
  WIZARD_FORM_PATTERN_MODULES,
} from "@/lib/design/form-patterns-wizard-steps";

/**
 * DES-26 — wizard step form pattern audit policy.
 *
 * @see lib/design/form-patterns-wizard-steps.ts
 */

export const WIZARD_FORM_PATTERN_AUDIT_POLICY_ID = FORM_PATTERNS_WIZARD_STEPS_POLICY_ID;

/** Duplicated layout strings — use `wizardStep*Class` tokens instead. */
export const WIZARD_FORM_FORBIDDEN_LAYOUT_PATTERN =
  /\bspace-y-4\b|\bflex flex-wrap items-center justify-between gap-3 border-t border-border\/60 pt-6\b|\bgrid gap-3 sm:grid-cols-2\b|\bscroll-mt-24 flex gap-3 rounded-lg border px-3 py-2 text-sm\b/g;

export const WIZARD_FORM_TOKEN_PATTERN =
  /\bwizardStep(?:Root|Intro|Progress|Section|Form|Field|Actions|Choice|Checklist|Stack|Heading|Description)\w*Class\b|\bWizardStep(?:Root|Section|Field|Actions|ChoiceGrid|ProgressHeader)\b/g;

export type WizardFormPatternViolation = {
  pattern: string;
  line: number;
  excerpt: string;
};

export type WizardFormPatternModuleAudit = {
  module: (typeof WIZARD_FORM_PATTERN_MODULES)[number];
  violations: WizardFormPatternViolation[];
  tokenReferences: number;
  passed: boolean;
};

export type WizardFormPatternAuditReport = {
  policyId: typeof WIZARD_FORM_PATTERN_AUDIT_POLICY_ID;
  modules: WizardFormPatternModuleAudit[];
  passed: boolean;
};

export function findWizardFormPatternViolations(source: string): WizardFormPatternViolation[] {
  const violations: WizardFormPatternViolation[] = [];
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const matches = line.match(WIZARD_FORM_FORBIDDEN_LAYOUT_PATTERN);
    if (!matches) continue;
    for (const pattern of matches) {
      violations.push({ pattern, line: i + 1, excerpt: line.trim() });
    }
  }

  return violations;
}

export function auditWizardFormPatternModule(
  modulePath: (typeof WIZARD_FORM_PATTERN_MODULES)[number],
  root = process.cwd(),
): WizardFormPatternModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const violations = findWizardFormPatternViolations(source);
  const tokenReferences = (source.match(WIZARD_FORM_TOKEN_PATTERN) ?? []).length;

  return {
    module: modulePath,
    violations,
    tokenReferences,
    passed: violations.length === 0,
  };
}

export function auditWizardFormPatterns(root = process.cwd()): WizardFormPatternAuditReport {
  const modules = WIZARD_FORM_PATTERN_MODULES.map((modulePath) =>
    auditWizardFormPatternModule(modulePath, root),
  );
  return {
    policyId: WIZARD_FORM_PATTERN_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
