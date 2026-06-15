/**
 * DES-32 — canonical form mutation feedback patterns (toast + inline).
 *
 * @see lib/design/form-feedback-audit-policy.ts
 * @see lib/feedback/notify-action-result.ts
 * @see components/feedback/form-action-inline-feedback.tsx
 */

export const FORM_FEEDBACK_PATTERNS_POLICY_ID = "form-feedback-patterns-des32-v1" as const;

export const FORM_FEEDBACK_SUCCESS_TEST_ID = "form-action-feedback-success" as const;

export const FORM_FEEDBACK_ERROR_TEST_ID = "form-action-feedback-error" as const;

/** Client forms audited for shared mutation feedback (DES-32). */
export const FORM_FEEDBACK_CRITICAL_MODULES = [
  "components/purchasing/po-approval-buttons.tsx",
  "components/dashboard/staff/archive-button.tsx",
  "components/integrations/webhook-replay-row.tsx",
  "components/dashboard/disconnect-integration-button.tsx",
] as const;

/**
 * Read-only surfaces with no mutation — exempt when documented.
 * Must include FORM_FEEDBACK_EXCEPTION in source.
 */
export const FORM_FEEDBACK_EXCEPTION_MODULES = [] as const;

export const FORM_FEEDBACK_EXCEPTION_MARKER = "FORM_FEEDBACK_EXCEPTION" as const;

export const FORM_FEEDBACK_TOAST_IMPORT = "@/lib/feedback/notify-action-result" as const;

export const FORM_FEEDBACK_INLINE_IMPORT =
  "@/components/feedback/form-action-inline-feedback" as const;

export const FORM_FEEDBACK_PRIMITIVE_PATTERN =
  /notifyActionResult|FormActionInlineFeedback/;

export type FormFeedbackCriticalModule = (typeof FORM_FEEDBACK_CRITICAL_MODULES)[number];
