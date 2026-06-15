import { describe, expect, it, vi } from "vitest";

import {
  auditFormFeedback,
  auditFormFeedbackModule,
  FORM_FEEDBACK_AUDIT_POLICY_ID,
} from "@/lib/design/form-feedback-audit-policy";
import {
  FORM_FEEDBACK_CRITICAL_MODULES,
  FORM_FEEDBACK_ERROR_TEST_ID,
  FORM_FEEDBACK_PATTERNS_POLICY_ID,
  FORM_FEEDBACK_SUCCESS_TEST_ID,
} from "@/lib/design/form-feedback-patterns";
import { notifyActionResult } from "@/lib/feedback/notify-action-result";

const toastError = vi.fn();
const toastSuccess = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}));

describe("form feedback audit policy (DES-32)", () => {
  it("locks DES-32 policy id and critical module list", () => {
    expect(FORM_FEEDBACK_PATTERNS_POLICY_ID).toBe("form-feedback-patterns-des32-v1");
    expect(FORM_FEEDBACK_AUDIT_POLICY_ID).toBe(FORM_FEEDBACK_PATTERNS_POLICY_ID);
    expect(FORM_FEEDBACK_SUCCESS_TEST_ID).toBe("form-action-feedback-success");
    expect(FORM_FEEDBACK_ERROR_TEST_ID).toBe("form-action-feedback-error");
    expect(FORM_FEEDBACK_CRITICAL_MODULES).toContain("components/purchasing/po-approval-buttons.tsx");
  });

  it("passes PO approval buttons with notifyActionResult", () => {
    const audit = auditFormFeedbackModule("components/purchasing/po-approval-buttons.tsx");
    expect(audit.usesFormFeedbackPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes webhook replay row with inline + toast feedback", () => {
    const audit = auditFormFeedbackModule("components/integrations/webhook-replay-row.tsx");
    expect(audit.usesFormFeedbackPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes full critical module audit against repo", () => {
    const report = auditFormFeedback();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.passed)).toBe(true);
  });
});

describe("notifyActionResult (DES-32)", () => {
  it("toasts error and returns false on failed action", () => {
    toastError.mockClear();
    const ok = notifyActionResult({ ok: false, error: "Permission denied" });
    expect(ok).toBe(false);
    expect(toastError).toHaveBeenCalledWith("Permission denied");
  });

  it("toasts success and returns true on ok action", () => {
    toastSuccess.mockClear();
    const ok = notifyActionResult({ ok: true }, { successMessage: "Saved" });
    expect(ok).toBe(true);
    expect(toastSuccess).toHaveBeenCalledWith("Saved");
  });
});
