export type UserFacingErrorCode =
  | "GENERIC"
  | "NETWORK"
  | "NOT_FOUND"
  | "PERMISSION"
  | "VALIDATION"
  | "PROVIDER_MISSING"
  | "RATE_LIMIT";

export const USER_FACING_MESSAGES: Record<UserFacingErrorCode, { title: string; body: string }> = {
  GENERIC: {
    title: "Something went wrong",
    body: "Please try again. If this keeps happening, contact support from the Help menu.",
  },
  NETWORK: {
    title: "Connection issue",
    body: "Check your internet connection and try again.",
  },
  NOT_FOUND: {
    title: "Not found",
    body: "This page or record may have moved. Go back to the dashboard and reopen it from there.",
  },
  PERMISSION: {
    title: "You don’t have access",
    body: "Ask a workspace owner to adjust your role, or switch accounts.",
  },
  VALIDATION: {
    title: "Check the highlighted fields",
    body: "Fix the items marked in the form and submit again.",
  },
  PROVIDER_MISSING: {
    title: "Setup required",
    body: "This feature needs an external provider to be configured for your workspace.",
  },
  RATE_LIMIT: {
    title: "Too many requests",
    body: "Please wait a moment and try again.",
  },
};
