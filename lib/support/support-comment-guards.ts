/**
 * Pure policy for who may post a support ticket comment with a given visibility.
 * Mirrors the intent of `addSupportTicketComment` in `actions/support-tickets.ts` — keep in sync.
 */
export type SupportCommentVisibility = "INTERNAL" | "CUSTOMER" | "PARTNER";

export type SupportCommentPostResolution =
  | { ok: true }
  | { ok: false; error: "FORBIDDEN" | "INTERNAL_NOT_ALLOWED" };

export function resolveSupportCommentPostPermission(input: {
  visibility: SupportCommentVisibility;
  canTriage: boolean;
  canViewTicket: boolean;
}): SupportCommentPostResolution {
  if (input.visibility === "INTERNAL" && !input.canTriage) {
    return { ok: false, error: "INTERNAL_NOT_ALLOWED" };
  }
  if (!input.canTriage && !input.canViewTicket) {
    return { ok: false, error: "FORBIDDEN" };
  }
  return { ok: true };
}
