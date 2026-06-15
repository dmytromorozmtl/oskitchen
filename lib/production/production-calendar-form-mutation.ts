/**
 * Production calendar void server-action form deny UX — Evolution Era 6 Cycle 4.
 *
 * Mirrors `era5-copilot-form-deny-v1`: HTML form actions redirect with a bounded
 * query param instead of silent no-ops on permission deny.
 */

import { redirect } from "next/navigation";

export const PRODUCTION_CALENDAR_FORM_DENY_POLICY_ID =
  "era6-production-calendar-form-deny-v1" as const;

export const PRODUCTION_CALENDAR_FORM_ERROR_PARAM = "production_calendar_error" as const;

export const PRODUCTION_CALENDAR_PAGE_PATH = "/dashboard/production/calendar" as const;

const MAX_ERROR_LENGTH = 200;

export function productionCalendarFormReturnUrl(
  returnPath: string,
  error?: string,
): string {
  if (!error?.trim()) return returnPath;
  const separator = returnPath.includes("?") ? "&" : "?";
  return `${returnPath}${separator}${PRODUCTION_CALENDAR_FORM_ERROR_PARAM}=${encodeURIComponent(
    error.trim().slice(0, MAX_ERROR_LENGTH),
  )}`;
}

export function assertProductionCalendarFormGate<T extends { ok: boolean; error?: string }>(
  gate: T,
  returnPath: string = PRODUCTION_CALENDAR_PAGE_PATH,
): asserts gate is T & { ok: true } {
  if (!gate.ok) {
    redirect(
      productionCalendarFormReturnUrl(
        returnPath,
        gate.error ?? "You do not have permission to manage the production calendar.",
      ),
    );
  }
}

export function readProductionCalendarFormError(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): string | null {
  const raw = searchParams?.[PRODUCTION_CALENDAR_FORM_ERROR_PARAM];
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (Array.isArray(raw) && typeof raw[0] === "string" && raw[0].trim()) return raw[0].trim();
  return null;
}
