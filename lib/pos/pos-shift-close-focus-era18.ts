import { classifyShiftVariance, type ShiftVarianceTone } from "@/lib/pos/pos-shift-closeout-preview";

export type PosShiftCloseOpenPreviewFocus = {
  shiftId: string;
  registerName: string;
  openedAtIso: string;
  expectedCash: number;
};

export type PosShiftCloseHistoryFocus = {
  shiftId: string;
  variance: number;
  notes: string | null;
  registerName: string;
};

export type PosShiftCloseFocusSnapshot = {
  openShiftCount: number;
  recentVarianceCount: number;
  recentShortCount: number;
  recentOverCount: number;
};

export type PosShiftCloseAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type PosShiftCloseHistoryRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

export function buildPosShiftCloseFocusSnapshot(input: {
  openPreviews: readonly PosShiftCloseOpenPreviewFocus[];
  closedHistory: readonly { variance: number }[];
}): PosShiftCloseFocusSnapshot {
  let recentShortCount = 0;
  let recentOverCount = 0;

  for (const shift of input.closedHistory) {
    const tone = classifyShiftVariance(shift.variance);
    if (tone === "short") recentShortCount += 1;
    if (tone === "over") recentOverCount += 1;
  }

  return {
    openShiftCount: input.openPreviews.length,
    recentVarianceCount: recentShortCount + recentOverCount,
    recentShortCount,
    recentOverCount,
  };
}

export function summarizePosShiftCloseFocus(
  focus: PosShiftCloseFocusSnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals = focus.openShiftCount + focus.recentVarianceCount;
  const hasUrgent = focus.openShiftCount > 0 || focus.recentShortCount > 0;

  return { totalSignals, hasUrgent };
}

/** Prioritized shift close guidance — open drawers and recent variance first. */
export function pickPosShiftCloseAttentionItems(
  focus: PosShiftCloseFocusSnapshot,
): PosShiftCloseAttentionItem[] {
  const items: PosShiftCloseAttentionItem[] = [];

  if (focus.openShiftCount > 0) {
    items.push({
      id: "open-shifts",
      title: `${focus.openShiftCount} open shift${focus.openShiftCount === 1 ? "" : "s"} need closeout`,
      detail:
        focus.openShiftCount === 1
          ? "Count the drawer, compare to expected cash, then close the shift."
          : "Close each register before end of day — card sales stay out of expected cash.",
      href: "#pos-shift-close",
      priority: 1,
      tone: "urgent",
    });
  }

  if (focus.recentShortCount > 0) {
    items.push({
      id: "recent-short",
      title: `${focus.recentShortCount} recent closeout${focus.recentShortCount === 1 ? "" : "s"} short cash`,
      detail: "Recount guidance applies — review variance notes in history before the next shift.",
      href: "#pos-shift-close-history",
      priority: 2,
      tone: "urgent",
    });
  }

  if (focus.recentOverCount > 0) {
    items.push({
      id: "recent-over",
      title: `${focus.recentOverCount} recent closeout${focus.recentOverCount === 1 ? "" : "s"} over expected`,
      detail: "Verify change fund and paid-outs — notes should explain each overage.",
      href: "#pos-shift-close-history",
      priority: 3,
      tone: focus.recentShortCount > 0 ? "normal" : "urgent",
    });
  }

  if (focus.recentVarianceCount > 0 && focus.openShiftCount === 0 && items.length < 4) {
    items.push({
      id: "variance-review",
      title: `${focus.recentVarianceCount} variance in selected range`,
      detail: "Use history notes for bookkeeper handoff — export CSV when ready.",
      href: "#pos-shift-close-history",
      priority: 4,
      tone: "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/** Operator-facing variance guidance during live closeout. */
export function resolveShiftVarianceGuidance(tone: ShiftVarianceTone): string | null {
  switch (tone) {
    case "short":
      return "Drawer is short — recount bills and coins, then check paid-outs, drops, and voids.";
    case "over":
      return "Drawer is over — verify change fund, duplicate drops, and orders marked cash incorrectly.";
    case "balanced":
      return "Counted cash matches expected — close without a variance note.";
    default:
      return null;
  }
}

/** History row next action for variance closeouts. */
export function resolvePosShiftCloseHistoryRowNextAction(
  shift: PosShiftCloseHistoryFocus,
): PosShiftCloseHistoryRowNextAction | null {
  const tone = classifyShiftVariance(shift.variance);
  if (tone === "balanced" || tone === "pending") return null;

  const href = shift.notes
    ? `#pos-shift-history-note-${shift.shiftId}`
    : "#pos-shift-close-history";

  if (tone === "short") {
    return {
      label: shift.notes ? "Review short note" : "Investigate short",
      href,
      tone: "urgent",
    };
  }

  return {
    label: shift.notes ? "Review over note" : "Investigate over",
    href,
    tone: "normal",
  };
}
