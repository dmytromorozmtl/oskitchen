import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FORM_FEEDBACK_CRITICAL_MODULES,
  FORM_FEEDBACK_EXCEPTION_MARKER,
  FORM_FEEDBACK_EXCEPTION_MODULES,
  FORM_FEEDBACK_INLINE_IMPORT,
  FORM_FEEDBACK_PATTERNS_POLICY_ID,
  FORM_FEEDBACK_PRIMITIVE_PATTERN,
  FORM_FEEDBACK_TOAST_IMPORT,
} from "@/lib/design/form-feedback-patterns";

/**
 * DES-32 — form feedback consistency audit policy.
 */

export const FORM_FEEDBACK_AUDIT_POLICY_ID = FORM_FEEDBACK_PATTERNS_POLICY_ID;

export type FormFeedbackModuleAudit = {
  module: string;
  usesFormFeedbackPrimitive: boolean;
  isException: boolean;
  passed: boolean;
};

export type FormFeedbackAuditReport = {
  policyId: typeof FORM_FEEDBACK_AUDIT_POLICY_ID;
  modules: FormFeedbackModuleAudit[];
  passed: boolean;
};

export function auditFormFeedbackModule(
  modulePath: string,
  root = process.cwd(),
): FormFeedbackModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const isException =
    (FORM_FEEDBACK_EXCEPTION_MODULES as readonly string[]).includes(modulePath) ||
    source.includes(FORM_FEEDBACK_EXCEPTION_MARKER);
  const usesFormFeedbackPrimitive =
    FORM_FEEDBACK_PRIMITIVE_PATTERN.test(source) ||
    source.includes(FORM_FEEDBACK_TOAST_IMPORT) ||
    source.includes(FORM_FEEDBACK_INLINE_IMPORT);
  const passed = isException || usesFormFeedbackPrimitive;

  return {
    module: modulePath,
    usesFormFeedbackPrimitive,
    isException,
    passed,
  };
}

export function auditFormFeedback(root = process.cwd()): FormFeedbackAuditReport {
  const modules = FORM_FEEDBACK_CRITICAL_MODULES.map((modulePath) =>
    auditFormFeedbackModule(modulePath, root),
  );
  return {
    policyId: FORM_FEEDBACK_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
