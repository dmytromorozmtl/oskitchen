/**
 * Blueprint P1-60 — Error template design tokens (illustration + title + description + actions + dark mode).
 *
 * @see components/dashboard/error-boundary-template.tsx
 * @see components/feedback/error-state.tsx
 * @see components/feedback/error-state-illustration.tsx
 */

export const ERROR_TEMPLATE_DESIGN_TOKENS_POLICY_ID =
  "error-template-design-tokens-p1-60-v1" as const;

export const ERROR_TEMPLATE_REQUIRED_ELEMENTS = [
  "illustration",
  "title",
  "description",
  "actions",
  "dark_mode",
] as const;

export type ErrorTemplateDesignElement = (typeof ERROR_TEMPLATE_REQUIRED_ELEMENTS)[number];

export const ERROR_TEMPLATE_BOUNDARY_MODULE =
  "components/dashboard/error-boundary-template.tsx" as const;

export const ERROR_TEMPLATE_STATE_MODULE = "components/feedback/error-state.tsx" as const;

export const ERROR_TEMPLATE_ILLUSTRATION_MODULE =
  "components/feedback/error-state-illustration.tsx" as const;

export const ERROR_TEMPLATE_TEST_ID = "error-template" as const;

export const ERROR_TEMPLATE_CARD_CLASS =
  "border-destructive/30 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10" as const;

export const ERROR_TEMPLATE_WRAPPER_CLASS =
  "flex min-h-[400px] flex-col items-center justify-center gap-4 px-4" as const;

export const ERROR_TEMPLATE_ILLUSTRATION_CLASS =
  "mx-auto h-24 w-[7.5rem] text-destructive/70 dark:text-destructive/80" as const;

export const ERROR_TEMPLATE_TITLE_CLASS = "text-lg" as const;

export const ERROR_TEMPLATE_DESCRIPTION_CLASS = "text-base leading-relaxed" as const;

export const ERROR_TEMPLATE_ACTIONS_CLASS =
  "flex flex-wrap justify-center gap-2 sm:justify-start" as const;

export const ERROR_TEMPLATE_RETRY_BUTTON_CLASS = "rounded-full" as const;

export const ERROR_TEMPLATE_HOME_BUTTON_CLASS = "rounded-full" as const;

export const ERROR_TEMPLATE_DARK_MODE_TOKENS = [
  "dark:border-destructive/40",
  "dark:bg-destructive/10",
  "dark:text-destructive/80",
  "dark:text-destructive/90",
] as const;

export const ERROR_TEMPLATE_AUDIT_SCRIPT =
  "scripts/audit-error-template-design-tokens.ts" as const;

export const ERROR_TEMPLATE_NPM_SCRIPT = "audit:error-template-design-tokens" as const;

export const ERROR_TEMPLATE_UNIT_TEST =
  "tests/unit/error-template-design-tokens.test.ts" as const;

export const ERROR_TEMPLATE_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export {
  ERROR_STATE_ILLUSTRATION_TEST_ID,
  ERROR_STATE_TEST_ID,
} from "@/lib/design/error-state-patterns";
