import { describe, expect, it } from "vitest";

import {
  inferPosCheckoutStatusKind,
  posCheckoutStatusClassName,
  toPosCheckoutStatus,
} from "@/lib/pos/pos-checkout-status";

describe("POS checkout status", () => {
  it("styles error, success, and info distinctly", () => {
    expect(posCheckoutStatusClassName("error")).toContain("destructive");
    expect(posCheckoutStatusClassName("success")).toContain("emerald");
    expect(posCheckoutStatusClassName("info")).toContain("muted");
  });

  it("infers error for validation messages", () => {
    expect(inferPosCheckoutStatusKind("Add at least one item.")).toBe("error");
    expect(inferPosCheckoutStatusKind("Reconnect before using card")).toBe("error");
  });

  it("infers success for completed sale messages", () => {
    expect(inferPosCheckoutStatusKind("Sale complete — order abc12345…")).toBe("success");
    expect(inferPosCheckoutStatusKind("Synced 2 offline sale(s).")).toBe("success");
  });

  it("allows explicit kind override", () => {
    expect(toPosCheckoutStatus("Permission denied", "error").kind).toBe("error");
  });
});
