import {
  isStaleServerActionError,
  reloadForStaleServerAction,
} from "@/lib/server-actions/stale-server-action";

/**
 * Call a Server Action from the client; reload once when the action ID is from an old build.
 */
export async function invokeServerAction<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (isStaleServerActionError(error)) {
      reloadForStaleServerAction();
    }
    throw error;
  }
}
