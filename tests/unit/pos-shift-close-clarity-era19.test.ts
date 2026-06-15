import { describe, expect, it } from "vitest";

import {
  POS_SHIFT_CLOSE_CLARITY_ERA19_BACKLOG_ID,
  POS_SHIFT_CLOSE_CLARITY_ERA19_POLICY_ID,
  POS_SHIFT_CLOSE_CLARITY_ERA19_PROOF_STATUS,
} from "@/lib/pos/pos-shift-close-clarity-era19-policy";
import {
  buildPosShiftCloseChecklist,
  buildPosShiftCloseOpenShiftSummary,
  formatPosShiftOpenedDuration,
  posShiftCloseVarianceToneLabel,
  shouldPrioritizePosShiftCloseSection,
  summarizePosShiftCloseChecklist,
} from "@/lib/pos/pos-shift-close-clarity-era19";
import { computeShiftCloseoutLivePreview } from "@/lib/pos/pos-shift-closeout-preview";

describe("pos-shift-close-clarity-era19 policy", () => {
  it("registers era19 closeout clarity proof", () => {
    expect(POS_SHIFT_CLOSE_CLARITY_ERA19_POLICY_ID).toBe("era19-pos-shift-close-clarity-v1");
    expect(POS_SHIFT_CLOSE_CLARITY_ERA19_PROOF_STATUS).toBe(
      "pos_shift_close_clarity_checklist_wired",
    );
    expect(POS_SHIFT_CLOSE_CLARITY_ERA19_BACKLOG_ID).toBe("KOS-E19-019");
  });
});

describe("formatPosShiftOpenedDuration", () => {
  it("formats hours and minutes from opened timestamp", () => {
    const now = new Date("2026-05-28T18:30:00.000Z");
    expect(formatPosShiftOpenedDuration("2026-05-28T08:00:00.000Z", now)).toBe("10h 30m open");
  });

  it("formats sub-hour durations in minutes", () => {
    const now = new Date("2026-05-28T08:45:00.000Z");
    expect(formatPosShiftOpenedDuration("2026-05-28T08:00:00.000Z", now)).toBe("45m open");
  });
});

describe("buildPosShiftCloseOpenShiftSummary", () => {
  it("builds hero copy from open shift preview", () => {
    const summary = buildPosShiftCloseOpenShiftSummary({
      shiftId: "shift-1",
      registerName: "Front counter",
      openedAtIso: "2026-05-28T08:00:00.000Z",
      expectedCash: 245.5,
      cashSalesTotal: 200,
      cashTransactionCount: 12,
      openingCash: 45.5,
    });

    expect(summary.headline).toContain("Front counter");
    expect(summary.subline).toContain("12 cash sale");
    expect(summary.expectedCashLabel).toBe("$245.50");
  });
});

describe("buildPosShiftCloseChecklist", () => {
  it("blocks checklist when no open shift exists", () => {
    const steps = buildPosShiftCloseChecklist({
      hasOpenShift: false,
      preview: null,
      varianceAcknowledged: false,
      notes: "",
    });

    expect(steps[0]?.status).toBe("blocked");
    expect(summarizePosShiftCloseChecklist(steps).readyToClose).toBe(false);
  });

  it("marks balanced closeout ready after counted cash matches expected", () => {
    const preview = computeShiftCloseoutLivePreview({
      cashSalesTotal: 100,
      expectedCash: 150,
      closingCashInput: "150.00",
    });

    const steps = buildPosShiftCloseChecklist({
      hasOpenShift: true,
      preview,
      varianceAcknowledged: false,
      notes: "",
    });

    const summary = summarizePosShiftCloseChecklist(steps);
    expect(steps.find((step) => step.id === "review_variance")?.status).toBe("complete");
    expect(summary.readyToClose).toBe(true);
    expect(summary.activeStepId).toBe("close_shift");
  });

  it("requires variance ack and note before close when short", () => {
    const preview = computeShiftCloseoutLivePreview({
      cashSalesTotal: 100,
      expectedCash: 150,
      closingCashInput: "140.00",
    });

    const blocked = buildPosShiftCloseChecklist({
      hasOpenShift: true,
      preview,
      varianceAcknowledged: false,
      notes: "",
    });
    expect(summarizePosShiftCloseChecklist(blocked).readyToClose).toBe(false);
    expect(blocked.find((step) => step.id === "review_variance")?.status).toBe("active");

    const ready = buildPosShiftCloseChecklist({
      hasOpenShift: true,
      preview,
      varianceAcknowledged: true,
      notes: "Paid out tips",
    });
    expect(summarizePosShiftCloseChecklist(ready).readyToClose).toBe(true);
  });
});

describe("posShiftCloseVarianceToneLabel", () => {
  it("maps variance tones to operator labels", () => {
    expect(posShiftCloseVarianceToneLabel("balanced")).toMatch(/balanced/i);
    expect(posShiftCloseVarianceToneLabel("short")).toMatch(/short/i);
    expect(posShiftCloseVarianceToneLabel("pending")).toBeNull();
  });
});

describe("shouldPrioritizePosShiftCloseSection", () => {
  it("prioritizes closeout layout when shifts are open", () => {
    expect(shouldPrioritizePosShiftCloseSection(1)).toBe(true);
    expect(shouldPrioritizePosShiftCloseSection(0)).toBe(false);
  });
});
