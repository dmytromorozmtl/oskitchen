import { describe, expect, it } from "vitest";

import {
  classifyShiftVariance,
  computeShiftCloseoutLivePreview,
  formatShiftCloseoutMoney,
  parseClosingCashInput,
  shiftCloseoutNeedsVarianceNote,
  shiftVarianceLabel,
} from "@/lib/pos/pos-shift-closeout-preview";
import { POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_POLICY_ID } from "@/lib/pos/pos-shift-closeout-preview-era18-policy";

describe("pos shift closeout preview era18", () => {
  it("locks era18 shift closeout preview policy id", () => {
    expect(POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_POLICY_ID).toBe(
      "era18-pos-shift-closeout-preview-v1",
    );
  });

  it("formats money for operator display", () => {
    expect(formatShiftCloseoutMoney(80)).toBe("$80.00");
    expect(formatShiftCloseoutMoney(-5.5)).toBe("-$5.50");
  });

  it("parses closing cash input", () => {
    expect(parseClosingCashInput("")).toBeNull();
    expect(parseClosingCashInput("75")).toBe(75);
    expect(parseClosingCashInput("-1")).toBeNull();
    expect(parseClosingCashInput("abc")).toBeNull();
  });

  it("classifies variance tone", () => {
    expect(classifyShiftVariance(null)).toBe("pending");
    expect(classifyShiftVariance(0)).toBe("balanced");
    expect(classifyShiftVariance(-5)).toBe("short");
    expect(classifyShiftVariance(3)).toBe("over");
  });

  it("computes live preview from expected cash and closing input", () => {
    const preview = computeShiftCloseoutLivePreview({
      cashSalesTotal: 30,
      expectedCash: 80,
      closingCashInput: "75",
    });
    expect(preview.variance).toBe(-5);
    expect(preview.tone).toBe("short");
    expect(shiftVarianceLabel(preview.tone)).toBe("Short");
    expect(shiftCloseoutNeedsVarianceNote(preview)).toBe(true);
  });

  it("shows balanced when counted matches expected", () => {
    const preview = computeShiftCloseoutLivePreview({
      cashSalesTotal: 0,
      expectedCash: 100,
      closingCashInput: "100",
    });
    expect(preview.tone).toBe("balanced");
    expect(shiftCloseoutNeedsVarianceNote(preview)).toBe(false);
  });
});
