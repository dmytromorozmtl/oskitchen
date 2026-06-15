/**
 * Central error helpers — keep user-visible strings boring in production.
 */
export { assertOwner, assertSupabaseUserMatches, safeError, safeInternalNextPath } from "./security";

/** Stable codes for logging/metrics — never shown raw to guests without copy mapping. */
export const ErrorCodes = {
  FORBIDDEN: "FORBIDDEN",
  VALIDATION: "VALIDATION",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMIT: "RATE_LIMIT",
  INTERNAL: "INTERNAL",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
