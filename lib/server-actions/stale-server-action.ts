/**
 * Detect stale Server Action IDs (post-deploy tabs, proxy origin mismatch, inline client form actions).
 * @see https://nextjs.org/docs/messages/failed-to-find-server-action
 */

const STALE_SERVER_ACTION_PATTERNS = [
  /failed to find server action/i,
  /server action .* was not found/i,
  /this request might be from an older or newer deployment/i,
] as const;

export function isStaleServerActionError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  if (!message) return false;
  return STALE_SERVER_ACTION_PATTERNS.some((re) => re.test(message));
}

/** Hard reload so the browser picks up the current Server Action manifest. */
export function reloadForStaleServerAction(): void {
  if (typeof window === "undefined") return;
  window.location.reload();
}

export const STALE_SERVER_ACTION_USER_MESSAGE =
  "The app was updated. Reload the page, then try again.";
