import { describe, expect, it } from "vitest";

import {
  POS_SHIFT_CLOSE_FOCUS_ERA18_BACKLOG_ID,
  POS_SHIFT_CLOSE_FOCUS_ERA18_POLICY_ID,
  POS_SHIFT_CLOSE_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/pos/pos-shift-close-focus-era18-policy";
import {
  buildPosShiftCloseFocusSnapshot,
  pickPosShiftCloseAttentionItems,
  resolvePosShiftCloseHistoryRowNextAction,
  resolveShiftVarianceGuidance,
  summarizePosShiftCloseFocus,
} from "@/lib/pos/pos-shift-close-focus-era18";

describe("pos-shift-close-focus-era18 policy", () => {
  it("registers era18 shift close focus proof", () => {
    expect(POS_SHIFT_CLOSE_FOCUS_ERA18_POLICY_ID).toBe("era18-pos-shift-close-focus-v1");
    expect(POS_SHIFT_CLOSE_FOCUS_ERA18_PROOF_STATUS).toBe("pos_shift_close_focus_attention_wired");
    expect(POS_SHIFT_CLOSE_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-027");
  });
});

describe("pickPosShiftCloseAttentionItems", () => {
  it("prioritizes open shifts and recent short variance", () => {
    const focus = buildPosShiftCloseFocusSnapshot({
      openPreviews: [
        {
          shiftId: "1",
          registerName: "Front",
          openedAtIso: "2026-05-28T08:00:00.000Z",
          expectedCash: 120,
        },
      ],
      closedHistory: [{ variance: -5 }, { variance: 0 }],
    });

    const items = pickPosShiftCloseAttentionItems(focus);
    expect(items[0]?.id).toBe("open-shifts");
    expect(items.some((item) => item.id === "recent-short")).toBe(true);
    expect(items[0]?.href).toBe("#pos-shift-close");
  });

  it("returns empty when no open shifts or variance", () => {
    const focus = buildPosShiftCloseFocusSnapshot({
      openPreviews: [],
      closedHistory: [{ variance: 0 }],
    });
    expect(pickPosShiftCloseAttentionItems(focus)).toEqual([]);
  });
});

describe("resolveShiftVarianceGuidance", () => {
  it("gives short and over operator hints", () => {
    expect(resolveShiftVarianceGuidance("short")).toMatch(/recount/i);
    expect(resolveShiftVarianceGuidance("over")).toMatch(/change fund/i);
    expect(resolveShiftVarianceGuidance("balanced")).toMatch(/matches expected/i);
  });
});

describe("resolvePosShiftCloseHistoryRowNextAction", () => {
  it("routes variance rows to note anchors", () => {
    const action = resolvePosShiftCloseHistoryRowNextAction({
      shiftId: "shift-1",
      variance: -3,
      notes: "Paid out tips",
      registerName: "Front",
    });
    expect(action?.label).toBe("Review short note");
    expect(action?.href).toBe("#pos-shift-history-note-shift-1");
  });

  it("returns null for balanced closeouts", () => {
    expect(
      resolvePosShiftCloseHistoryRowNextAction({
        shiftId: "shift-2",
        variance: 0,
        notes: null,
        registerName: "Front",
      }),
    ).toBeNull();
  });
});

describe("summarizePosShiftCloseFocus", () => {
  it("flags urgent when open shifts exist", () => {
    const focus = buildPosShiftCloseFocusSnapshot({
      openPreviews: [
        {
          shiftId: "1",
          registerName: "Front",
          openedAtIso: "2026-05-28T08:00:00.000Z",
          expectedCash: 80,
        },
      ],
      closedHistory: [],
    });
    expect(summarizePosShiftCloseFocus(focus).hasUrgent).toBe(true);
  });
});
