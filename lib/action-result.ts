export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | {
      ok: false;
      error: string;
      code?: string;
      fieldErrors?: Record<string, string[]>;
    };

export function success<T>(data?: T): ActionResult<T> {
  if (data === undefined) return { ok: true };
  return { ok: true, data };
}

/** Alias for master execution / new actions */
export const ok = success;

export function failure(
  error: string,
  code?: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> {
  return {
    ok: false,
    error,
    ...(code ? { code } : {}),
    ...(fieldErrors ? { fieldErrors } : {}),
  };
}

/** Alias for master execution / new actions */
export const fail = failure;

/** Client-side: read error message from ActionResult without narrowing `ok` manually. */
export function actionErrorMessage(
  result: ActionResult<unknown> | null | undefined,
): string | null {
  if (!result) return null;
  return result.ok ? null : result.error;
}

/** Alias used by client forms — supports legacy `{ error: string }` unions. */
export function getActionError(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  const r = result as { ok?: boolean; error?: string };
  if (typeof r.ok === "boolean") {
    return r.ok ? undefined : r.error;
  }
  return typeof r.error === "string" ? r.error : undefined;
}

export function isActionSuccess<T = unknown>(
  result: unknown,
): result is { ok: true; data?: T } {
  return Boolean(result && typeof result === "object" && "ok" in result && (result as { ok?: boolean }).ok === true);
}

/** Bridge legacy `{ ok, error }` server actions to ActionResult. */
export function fromLegacyResult(
  result: { ok?: boolean; error?: string },
): ActionResult<void> {
  if (result.ok) return success();
  return failure(result.error ?? "Something went wrong.");
}
