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

const RSC_RENDER_ERROR_PATTERNS = [
  /An error occurred in the Server Components render/i,
  /Server Components render/i,
] as const;

export function isRscRenderError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  if (!message) return false;
  return RSC_RENDER_ERROR_PATTERNS.some((re) => re.test(message));
}

const CHUNK_LOAD_ERROR_PATTERNS = [
  /Loading chunk [\d]+ failed/i,
  /Loading CSS chunk [\d]+ failed/i,
  /ChunkLoadError/i,
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
] as const;

/** Stale JS chunk after deploy — browser still references removed `_next/static/chunks/*` files. */
export function isChunkLoadError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  if (!message) return false;
  return CHUNK_LOAD_ERROR_PATTERNS.some((re) => re.test(message));
}

export const CHUNK_LOAD_USER_TITLE = "New version available";

export const CHUNK_LOAD_USER_MESSAGE =
  "The app was updated. Reload the page to fetch the latest version.";

const CHUNK_AUTO_RELOAD_SESSION_KEY = "os-kitchen-chunk-auto-reload";

/** Hard reload so the browser picks up the current JS manifest. */
export function reloadForStaleDeployment(): void {
  if (typeof window === "undefined") return;
  window.location.reload();
}

/** One automatic reload per tab session to recover from stale chunks without looping. */
export function tryAutoReloadForChunkError(
  sessionKey = CHUNK_AUTO_RELOAD_SESSION_KEY,
): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(sessionKey)) return false;
  sessionStorage.setItem(sessionKey, "1");
  window.location.reload();
  return true;
}

export function clearChunkAutoReloadGuard(
  sessionKey = CHUNK_AUTO_RELOAD_SESSION_KEY,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(sessionKey);
}
