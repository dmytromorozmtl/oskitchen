import type { DemandSourceType } from "./types";

export type DemandRunValidation = { ok: true } | { ok: false; message: string };

export function validateDemandDateWindow(dateFrom: Date, dateTo: Date): DemandRunValidation {
  if (!(dateFrom instanceof Date) || !(dateTo instanceof Date) || Number.isNaN(+dateFrom) || Number.isNaN(+dateTo)) {
    return { ok: false, message: "Invalid date range." };
  }
  if (dateFrom > dateTo) return { ok: false, message: "Start date must be on or before end date." };
  const spanDays = (+dateTo - +dateFrom) / 86400000;
  if (spanDays > 120) return { ok: false, message: "Date window is too wide (max 120 days)." };
  return { ok: true };
}

export function validateAtLeastOneSourceEnabled(
  enabled: Partial<Record<DemandSourceType, { enabled: boolean }>>,
): DemandRunValidation {
  const any = Object.values(enabled).some((v) => v?.enabled);
  if (!any) return { ok: false, message: "Enable at least one demand source." };
  return { ok: true };
}
