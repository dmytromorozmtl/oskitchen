import { toast } from "sonner";

import { getActionError, isActionSuccess } from "@/lib/action-result";

export type NotifyActionResultOptions = {
  successMessage?: string;
  errorMessage?: string;
  /** When true, skip success toast if result is void/undefined success. Default: only toast when successMessage set. */
  silentSuccess?: boolean;
};

/**
 * Standard toast feedback for client-side server action calls (DES-32).
 * Returns true when the action succeeded.
 */
export function notifyActionResult(
  result: unknown,
  options?: NotifyActionResultOptions,
): boolean {
  const err = getActionError(result);
  if (err) {
    toast.error(options?.errorMessage ?? err);
    return false;
  }

  if (isActionSuccess(result) || result === undefined || result === null) {
    if (options?.successMessage && !options.silentSuccess) {
      toast.success(options.successMessage);
    }
    return true;
  }

  return true;
}
