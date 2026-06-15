import { describe, expect, it } from "vitest";

import {
  canSubmitShiftCloseWithPreview,
  classifyShiftVariance,
  computeShiftCloseoutLivePreview,
  formatShiftCloseoutMoney,
  parseClosingCashInput,
  parseShiftVarianceAcknowledged,
  shiftCloseoutNeedsVarianceNote,
  shiftVarianceLabel,
  validateShiftVarianceCloseoutAck,
} from "@/lib/pos/pos-shift-closeout-preview";
import { POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_POLICY_ID } from "@/lib/pos/pos-shift-closeout-preview-era18-policy";
import { POS_SHIFT_VARIANCE_ACK_ERA18_POLICY_ID } from "@/lib/pos/pos-shift-variance-ack-era18-policy";

describe("pos shift closeout preview era18", () => {
  it("locks era18 shift closeout preview policy id", () => {
    expect(POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_POLICY_ID).toBe(
      "era18-pos-shift-closeout-preview-v1",
    );
    expect(POS_SHIFT_VARIANCE_ACK_ERA18_POLICY_ID).toBe("era18-pos-shift-variance-ack-v1");
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

  it("requires acknowledgment and note for non-zero variance", () => {
    expect(
      validateShiftVarianceCloseoutAck({
        variance: -5,
        varianceAcknowledged: false,
        notes: "short",
      }),
    ).toBe("Acknowledge the cash variance before closing this shift.");

    expect(
      validateShiftVarianceCloseoutAck({
        variance: 3,
        varianceAcknowledged: true,
        notes: "ok",
      }),
    ).toBe("Add a note explaining the variance for the audit trail.");

    expect(
      validateShiftVarianceCloseoutAck({
        variance: 3,
        varianceAcknowledged: true,
        notes: "Paid out tips from drawer",
      }),
    ).toBeNull();
  });

  it("gates submit until variance ack and note when required", () => {
    const preview = computeShiftCloseoutLivePreview({
      cashSalesTotal: 30,
      expectedCash: 80,
      closingCashInput: "75",
    });
    expect(
      canSubmitShiftCloseWithPreview({
        preview,
        varianceAcknowledged: false,
        notes: "Counted short",
      }),
    ).toBe(false);
    expect(
      canSubmitShiftCloseWithPreview({
        preview,
        varianceAcknowledged: true,
        notes: "Counted short",
      }),
    ).toBe(true);
  });

  it("parses variance acknowledgment form values", () => {
    expect(parseShiftVarianceAcknowledged("1")).toBe(true);
    expect(parseShiftVarianceAcknowledged(null)).toBe(false);
  });
});
