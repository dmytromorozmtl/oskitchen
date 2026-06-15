import { describe, expect, it } from "vitest";

import {
  POS_CHECKOUT_SHIFT_REPORT_E2E_POLICY_ID,
  POS_SHIFT_CLOSE_FORM_TEST_ID,
  POS_SHIFT_CLOSE_HISTORY_TEST_ID,
  posShiftHistoryRowTestId,
} from "@/lib/pos/pos-checkout-shift-report-e2e-policy";
import {
  canSubmitShiftCloseWithPreview,
  computeShiftCloseoutLivePreview,
} from "@/lib/pos/pos-shift-closeout-preview";

describe("pos checkout → shift close → report lifecycle (QA-15)", () => {
  it("exports E2E selectors for shift close report", () => {
    expect(POS_CHECKOUT_SHIFT_REPORT_E2E_POLICY_ID).toBe(
      "pos-checkout-shift-close-report-e2e-v1",
    );
    expect(POS_SHIFT_CLOSE_FORM_TEST_ID).toBe("pos-shift-close-form");
    expect(POS_SHIFT_CLOSE_HISTORY_TEST_ID).toBe("pos-shift-close-history");
    expect(posShiftHistoryRowTestId("abc")).toBe("pos-shift-history-row-abc");
  });

  it("balanced closeout after cash sale allows shift close submit", () => {
    const preview = computeShiftCloseoutLivePreview({
      cashSalesTotal: 12.5,
      expectedCash: 112.5,
      closingCashInput: "112.50",
    });
    expect(preview.tone).toBe("balanced");
    expect(
      canSubmitShiftCloseWithPreview({
        preview,
        varianceAcknowledged: false,
        notes: "",
      }),
    ).toBe(true);
  });

  it("cash sale increases expected drawer for shift report", () => {
    const beforeSale = computeShiftCloseoutLivePreview({
      cashSalesTotal: 0,
      expectedCash: 100,
      closingCashInput: "100",
    });
    const afterSale = computeShiftCloseoutLivePreview({
      cashSalesTotal: 15,
      expectedCash: 115,
      closingCashInput: "115",
    });
    expect(beforeSale.tone).toBe("balanced");
    expect(afterSale.tone).toBe("balanced");
    expect(afterSale.variance).toBe(0);
  });
});
