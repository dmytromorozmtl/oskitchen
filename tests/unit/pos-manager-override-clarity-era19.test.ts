import { describe, expect, it } from "vitest";

import {
  POS_MANAGER_OVERRIDE_CLARITY_ERA19_BACKLOG_ID,
  POS_MANAGER_OVERRIDE_CLARITY_ERA19_POLICY_ID,
  POS_MANAGER_OVERRIDE_CLARITY_ERA19_PROOF_STATUS,
} from "@/lib/pos/pos-manager-override-clarity-era19-policy";
import {
  buildPosManagerOverrideChecklist,
  buildPosManagerOverrideSummary,
  canCompletePosManagerOverrideSale,
  isPosManagerOverrideTypeSelected,
  shouldShowPosManagerOverrideHero,
  summarizePosManagerOverrideChecklist,
} from "@/lib/pos/pos-manager-override-clarity-era19";

const baseInput = {
  canApplyPosDiscount: true,
  discountMode: "none" as const,
  paymentMode: "CASH" as const,
  cartSubtotal: 42,
  cartItemCount: 2,
  fixedDiscountInvalid: false,
  percentDiscountInvalid: false,
  fixedDiscountInput: "",
  percentDiscountInput: "",
  appliedDiscountAmount: 0,
  amountDue: 42,
};

describe("pos-manager-override-clarity-era19 policy", () => {
  it("registers era19 manager override clarity proof", () => {
    expect(POS_MANAGER_OVERRIDE_CLARITY_ERA19_POLICY_ID).toBe(
      "era19-pos-manager-override-clarity-v1",
    );
    expect(POS_MANAGER_OVERRIDE_CLARITY_ERA19_PROOF_STATUS).toBe(
      "pos_manager_override_clarity_wired",
    );
    expect(POS_MANAGER_OVERRIDE_CLARITY_ERA19_BACKLOG_ID).toBe("KOS-E19-027");
  });
});

describe("buildPosManagerOverrideChecklist", () => {
  it("blocks checklist when cashier lacks pos.discount.apply", () => {
    const steps = buildPosManagerOverrideChecklist({
      ...baseInput,
      canApplyPosDiscount: false,
    });

    expect(steps[0]?.status).toBe("blocked");
    expect(summarizePosManagerOverrideChecklist(steps).readyToComplete).toBe(false);
  });

  it("marks manager fixed discount flow ready to complete", () => {
    const steps = buildPosManagerOverrideChecklist({
      ...baseInput,
      discountMode: "fixed",
      fixedDiscountInput: "5",
      appliedDiscountAmount: 5,
      amountDue: 37,
    });

    expect(steps[0]?.status).toBe("complete");
    expect(steps[1]?.status).toBe("complete");
    expect(steps[2]?.status).toBe("complete");
    expect(summarizePosManagerOverrideChecklist(steps).readyToComplete).toBe(true);
  });

  it("activates set_discount when fixed input is invalid", () => {
    const steps = buildPosManagerOverrideChecklist({
      ...baseInput,
      discountMode: "fixed",
      fixedDiscountInput: "-1",
      fixedDiscountInvalid: true,
    });

    expect(steps[2]?.status).toBe("active");
    expect(canCompletePosManagerOverrideSale({
      ...baseInput,
      discountMode: "fixed",
      fixedDiscountInput: "-1",
      fixedDiscountInvalid: true,
    })).toBe(false);
  });

  it("completes comp sale override without dollar input", () => {
    const steps = buildPosManagerOverrideChecklist({
      ...baseInput,
      paymentMode: "COMPED",
      appliedDiscountAmount: 42,
      amountDue: 0,
    });

    expect(isPosManagerOverrideTypeSelected({
      discountMode: "none",
      paymentMode: "COMPED",
    })).toBe(true);
    expect(steps[2]?.status).toBe("complete");
    expect(summarizePosManagerOverrideChecklist(steps).readyToComplete).toBe(true);
  });
});

describe("buildPosManagerOverrideSummary", () => {
  it("builds comp sale hero copy", () => {
    const summary = buildPosManagerOverrideSummary({
      ...baseInput,
      paymentMode: "COMPED",
      appliedDiscountAmount: 42,
      amountDue: 0,
    });

    expect(summary.headline).toContain("Comp sale");
    expect(summary.detail).toContain("$42.00");
  });

  it("shows hero only when override is active with cart items", () => {
    expect(
      shouldShowPosManagerOverrideHero({
        ...baseInput,
        discountMode: "percent",
        percentDiscountInput: "10",
        appliedDiscountAmount: 4.2,
        amountDue: 37.8,
      }),
    ).toBe(true);
    expect(shouldShowPosManagerOverrideHero(baseInput)).toBe(false);
  });
});
