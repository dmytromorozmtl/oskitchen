import type { ActionResult } from "@/lib/action-result";
import { failure } from "@/lib/action-result";
import { safeError } from "@/lib/errors";

/** Wrap async mutations that return ActionResult — catches thrown FORBIDDEN/network errors. */
export async function runSafeAction<T>(
  fn: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (e) {
    return failure(safeError(e));
  }
}
