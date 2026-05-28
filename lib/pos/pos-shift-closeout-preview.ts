import { roundMoney } from "@/lib/pos/pos-shift-closeout-math";

export type ShiftVarianceTone = "balanced" | "short" | "over" | "pending";

export type ShiftCloseoutLivePreview = {
  closingCash: number | null;
  cashSalesTotal: number;
  expectedCash: number;
  variance: number | null;
  tone: ShiftVarianceTone;
};

const MONEY_EPSILON = 0.005;

export function formatShiftCloseoutMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseClosingCashInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return roundMoney(parsed);
}

export function classifyShiftVariance(variance: number | null): ShiftVarianceTone {
  if (variance === null) return "pending";
  if (Math.abs(variance) < MONEY_EPSILON) return "balanced";
  return variance < 0 ? "short" : "over";
}

export function shiftVarianceToneClassName(tone: ShiftVarianceTone): string {
  switch (tone) {
    case "balanced":
      return "text-green-600 dark:text-green-500";
    case "short":
      return "text-destructive";
    case "over":
      return "text-amber-600 dark:text-amber-500";
    default:
      return "text-muted-foreground";
  }
}

export function shiftVarianceLabel(tone: ShiftVarianceTone): string {
  switch (tone) {
    case "balanced":
      return "Balanced";
    case "short":
      return "Short";
    case "over":
      return "Over";
    default:
      return "Enter counted cash";
  }
}

/** Live closeout preview while manager enters closing cash — uses same math as closePosShift. */
export function computeShiftCloseoutLivePreview(input: {
  cashSalesTotal: number;
  expectedCash: number;
  closingCashInput: string;
}): ShiftCloseoutLivePreview {
  const closingCash = parseClosingCashInput(input.closingCashInput);
  const variance =
    closingCash === null
      ? null
      : roundMoney(closingCash - input.expectedCash);

  return {
    closingCash,
    cashSalesTotal: input.cashSalesTotal,
    expectedCash: input.expectedCash,
    variance,
    tone: classifyShiftVariance(variance),
  };
}

export function shiftCloseoutNeedsVarianceNote(preview: ShiftCloseoutLivePreview): boolean {
  return preview.tone === "short" || preview.tone === "over";
}

export const SHIFT_VARIANCE_NOTE_MIN_LENGTH = 3;

export function shiftCloseoutRequiresVarianceAck(variance: number | null): boolean {
  if (variance === null) return false;
  return Math.abs(variance) >= MONEY_EPSILON;
}

export function parseShiftVarianceAcknowledged(raw: FormDataEntryValue | null): boolean {
  return raw === "1" || raw === "on" || raw === "true";
}

/** Bounded manager acknowledgment — not automated approval. */
export function validateShiftVarianceCloseoutAck(input: {
  variance: number;
  varianceAcknowledged: boolean;
  notes: string;
}): string | null {
  if (!shiftCloseoutRequiresVarianceAck(input.variance)) {
    return null;
  }
  if (!input.varianceAcknowledged) {
    return "Acknowledge the cash variance before closing this shift.";
  }
  if (input.notes.trim().length < SHIFT_VARIANCE_NOTE_MIN_LENGTH) {
    return "Add a note explaining the variance for the audit trail.";
  }
  return null;
}

export function canSubmitShiftCloseWithPreview(input: {
  preview: ShiftCloseoutLivePreview | null;
  varianceAcknowledged: boolean;
  notes: string;
}): boolean {
  if (!input.preview || input.preview.closingCash === null) return false;
  if (!shiftCloseoutRequiresVarianceAck(input.preview.variance)) return true;
  return (
    input.varianceAcknowledged &&
    input.notes.trim().length >= SHIFT_VARIANCE_NOTE_MIN_LENGTH
  );
}
