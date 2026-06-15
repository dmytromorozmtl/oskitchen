/**
 * Copilot void server-action form deny UX — Evolution Era 5 Cycle 4.
 *
 * HTML form actions cannot return JSON errors; denied mutations redirect back
 * with a bounded query param instead of silent no-ops.
 */

import { redirect } from "next/navigation";

export const COPILOT_FORM_DENY_POLICY_ID = "era5-copilot-form-deny-v1" as const;

export const COPILOT_FORM_ERROR_PARAM = "copilot_error" as const;

const MAX_ERROR_LENGTH = 200;

export function copilotFormReturnUrl(returnPath: string, error?: string): string {
  if (!error?.trim()) return returnPath;
  const separator = returnPath.includes("?") ? "&" : "?";
  return `${returnPath}${separator}${COPILOT_FORM_ERROR_PARAM}=${encodeURIComponent(
    error.trim().slice(0, MAX_ERROR_LENGTH),
  )}`;
}

export function assertCopilotFormGate<T extends { ok: boolean; error?: string }>(
  gate: T,
  returnPath: string,
): asserts gate is T & { ok: true } {
  if (!gate.ok) {
    redirect(copilotFormReturnUrl(returnPath, gate.error ?? "You do not have permission to use Copilot."));
  }
}

export function readCopilotFormError(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): string | null {
  const raw = searchParams?.[COPILOT_FORM_ERROR_PARAM];
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (Array.isArray(raw) && typeof raw[0] === "string" && raw[0].trim()) return raw[0].trim();
  return null;
}
