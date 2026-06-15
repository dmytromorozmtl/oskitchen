import {
  canSubmitShiftCloseWithPreview,
  formatShiftCloseoutMoney,
  type ShiftCloseoutLivePreview,
  type ShiftVarianceTone,
} from "@/lib/pos/pos-shift-closeout-preview";
import { resolveShiftVarianceGuidance } from "@/lib/pos/pos-shift-close-focus-era18";
import { POS_SHIFT_CLOSE_CLARITY_ERA19_POLICY_ID } from "@/lib/pos/pos-shift-close-clarity-era19-policy";

export const POS_SHIFT_CLOSE_CLARITY_AGGREGATOR_ERA19_POLICY_ID =
  "era19-pos-shift-close-clarity-aggregator-v1" as const;

export type PosShiftCloseChecklistStepId =
  | "select_shift"
  | "count_drawer"
  | "review_variance"
  | "close_shift";

export type PosShiftCloseChecklistStepStatus = "pending" | "active" | "complete" | "blocked";

export type PosShiftCloseChecklistStep = {
  id: PosShiftCloseChecklistStepId;
  label: string;
  detail: string;
  status: PosShiftCloseChecklistStepStatus;
};

export type PosShiftCloseOpenShiftSummary = {
  shiftId: string;
  registerName: string;
  openedAtIso: string;
  expectedCash: number;
  cashSalesTotal: number;
  cashTransactionCount: number;
  openingCash: number;
};

export function formatPosShiftOpenedDuration(openedAtIso: string, now = new Date()): string {
  const openedAt = new Date(openedAtIso);
  if (Number.isNaN(openedAt.getTime())) return "—";

  const diffMs = Math.max(0, now.getTime() - openedAt.getTime());
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes}m open`;
  return `${hours}h ${minutes}m open`;
}

export function buildPosShiftCloseOpenShiftSummary(
  preview: PosShiftCloseOpenShiftSummary,
): {
  headline: string;
  subline: string;
  expectedCashLabel: string;
} {
  const duration = formatPosShiftOpenedDuration(preview.openedAtIso);
  return {
    headline: `${preview.registerName} — ${duration}`,
    subline: `${preview.cashTransactionCount} cash sale(s) · float ${formatShiftCloseoutMoney(preview.openingCash)}`,
    expectedCashLabel: formatShiftCloseoutMoney(preview.expectedCash),
  };
}

function isCountDrawerComplete(preview: ShiftCloseoutLivePreview | null): boolean {
  return preview?.closingCash != null;
}

function isVarianceReviewComplete(input: {
  preview: ShiftCloseoutLivePreview | null;
  varianceAcknowledged: boolean;
  notes: string;
}): boolean {
  if (!input.preview || input.preview.closingCash === null) return false;
  if (input.preview.tone === "balanced") return true;
  if (input.preview.tone === "pending") return false;
  return (
    input.varianceAcknowledged && input.notes.trim().length >= 3
  );
}

export function buildPosShiftCloseChecklist(input: {
  hasOpenShift: boolean;
  preview: ShiftCloseoutLivePreview | null;
  varianceAcknowledged: boolean;
  notes: string;
}): PosShiftCloseChecklistStep[] {
  const countComplete = isCountDrawerComplete(input.preview);
  const varianceComplete = isVarianceReviewComplete(input);
  const canClose = canSubmitShiftCloseWithPreview({
    preview: input.preview,
    varianceAcknowledged: input.varianceAcknowledged,
    notes: input.notes,
  });

  const varianceDetail = input.preview
    ? resolveShiftVarianceGuidance(input.preview.tone) ??
      "Enter counted cash to compare against expected drawer total."
    : "Select an open shift first.";

  const steps: PosShiftCloseChecklistStep[] = [
    {
      id: "select_shift",
      label: "Select open shift",
      detail: input.hasOpenShift
        ? "Choose the register drawer you are closing."
        : "No open shifts — open a shift before closeout.",
      status: input.hasOpenShift ? "complete" : "blocked",
    },
    {
      id: "count_drawer",
      label: "Count drawer cash",
      detail: countComplete
        ? `Counted ${formatShiftCloseoutMoney(input.preview!.closingCash!)} in the drawer.`
        : "Enter the physical cash total — card sales stay out of expected cash.",
      status: !input.hasOpenShift ? "blocked" : countComplete ? "complete" : "active",
    },
    {
      id: "review_variance",
      label: "Review variance",
      detail: varianceDetail,
      status: !input.hasOpenShift
        ? "blocked"
        : !countComplete
          ? "pending"
          : varianceComplete
            ? "complete"
            : "active",
    },
    {
      id: "close_shift",
      label: "Close shift",
      detail: canClose
        ? "Ready to submit — drawer count and variance checks are satisfied."
        : "Complete prior steps before closing the register shift.",
      status: canClose ? "active" : !input.hasOpenShift ? "blocked" : "pending",
    },
  ];

  if (canClose) {
    const closeIndex = steps.findIndex((step) => step.id === "close_shift");
    if (closeIndex >= 0) {
      steps[closeIndex] = { ...steps[closeIndex]!, status: "active" };
    }
  }

  return steps;
}

export function summarizePosShiftCloseChecklist(
  steps: readonly PosShiftCloseChecklistStep[],
): {
  completedCount: number;
  activeStepId: PosShiftCloseChecklistStepId | null;
  readyToClose: boolean;
} {
  const completedCount = steps.filter((step) => step.status === "complete").length;
  const active = steps.find((step) => step.status === "active") ?? null;
  const readyToClose = steps.find((step) => step.id === "close_shift")?.status === "active";

  return {
    completedCount,
    activeStepId: active?.id ?? null,
    readyToClose,
  };
}

export function posShiftCloseChecklistStepClassName(status: PosShiftCloseChecklistStepStatus): string {
  switch (status) {
    case "complete":
      return "border-green-200/80 bg-green-50/60 dark:border-green-900/50 dark:bg-green-950/20";
    case "active":
      return "border-primary/40 bg-primary/5";
    case "blocked":
      return "border-border/60 bg-muted/20 opacity-80";
    default:
      return "border-border/70 bg-background/80";
  }
}

export function posShiftCloseVarianceToneLabel(tone: ShiftVarianceTone): string | null {
  switch (tone) {
    case "balanced":
      return "Balanced — no variance note needed";
    case "short":
      return "Short — recount and document";
    case "over":
      return "Over — verify change fund";
    default:
      return null;
  }
}

export function shouldPrioritizePosShiftCloseSection(openShiftCount: number): boolean {
  return openShiftCount > 0;
}

export function posShiftCloseClarityPolicySnapshot(): {
  policyId: typeof POS_SHIFT_CLOSE_CLARITY_ERA19_POLICY_ID;
  checklistSteps: number;
} {
  return {
    policyId: POS_SHIFT_CLOSE_CLARITY_ERA19_POLICY_ID,
    checklistSteps: 4,
  };
}
