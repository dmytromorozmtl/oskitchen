import type { User } from "@supabase/supabase-js";

/**
 * Use in server actions after loading a row — confirms the row belongs to the session user.
 */
export function assertOwner<T extends { userId: string }>(
  row: T | null,
  sessionUserId: string,
): asserts row is T {
  if (!row || row.userId !== sessionUserId) {
    throw new Error("FORBIDDEN");
  }
}

export function safeError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === "FORBIDDEN") return "You do not have access to this resource.";
    if (process.env.NODE_ENV === "production") {
      return "Something went wrong. Please try again.";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export function assertSupabaseUserMatches(
  sessionUser: User | null,
  claimedUserId: string,
): asserts sessionUser is User {
  if (!sessionUser || sessionUser.id !== claimedUserId) {
    throw new Error("FORBIDDEN");
  }
}

export { safeInternalNextPath } from "@/lib/auth/safe-redirect";
