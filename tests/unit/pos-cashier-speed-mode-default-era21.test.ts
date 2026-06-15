import { describe, expect, it } from "vitest";

import {
  posCashierSpeedModeFromSearchParam,
  resolvePosCashierSpeedMode,
} from "@/lib/pos/pos-cashier-speed-mode-era19";

describe("resolvePosCashierSpeedMode", () => {
  it("defaults speed mode on for cashier persona", () => {
    expect(
      resolvePosCashierSpeedMode({
        speedParam: undefined,
        persona: "cashier",
      }),
    ).toBe(true);
  });

  it("respects explicit speed=0 for cashiers", () => {
    expect(
      resolvePosCashierSpeedMode({
        speedParam: "0",
        persona: "cashier",
      }),
    ).toBe(false);
  });

  it("does not default speed mode for managers", () => {
    expect(
      resolvePosCashierSpeedMode({
        speedParam: undefined,
        persona: "manager",
      }),
    ).toBe(false);
  });

  it("keeps legacy search param parsing", () => {
    expect(posCashierSpeedModeFromSearchParam("1")).toBe(true);
    expect(posCashierSpeedModeFromSearchParam("true")).toBe(true);
  });
});
