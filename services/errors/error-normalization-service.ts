import type { UserFacingErrorCode } from "@/lib/errors/user-facing-errors";
import { USER_FACING_MESSAGES } from "@/lib/errors/user-facing-errors";

export function normalizeUnknownError(err: unknown): {
  code: UserFacingErrorCode;
  title: string;
  body: string;
  /** Never include secrets — safe for UI. */
  debugHint?: string;
} {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  const lower = msg.toLowerCase();
  if (lower.includes("fetch") || lower.includes("network")) {
    return { code: "NETWORK", ...USER_FACING_MESSAGES.NETWORK };
  }
  if (lower.includes("not found") || lower.includes("404")) {
    return { code: "NOT_FOUND", ...USER_FACING_MESSAGES.NOT_FOUND };
  }
  if (lower.includes("forbidden") || lower.includes("403")) {
    return { code: "PERMISSION", ...USER_FACING_MESSAGES.PERMISSION };
  }
  if (lower.includes("rate limit") || lower.includes("429")) {
    return { code: "RATE_LIMIT", ...USER_FACING_MESSAGES.RATE_LIMIT };
  }
  return {
    code: "GENERIC",
    ...USER_FACING_MESSAGES.GENERIC,
    debugHint: process.env.NODE_ENV === "development" ? truncate(msg) : undefined,
  };
}

function truncate(s: string, max = 160) {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}
