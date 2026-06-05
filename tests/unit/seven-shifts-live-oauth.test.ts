import { describe, expect, it } from "vitest";

import {
  signSevenShiftsOAuthState,
  verifySevenShiftsOAuthState,
} from "@/services/integrations/seven-shifts/seven-shifts-live-service";

describe("seven-shifts oauth state", () => {
  it("round-trips signed state", () => {
    const state = signSevenShiftsOAuthState({ userId: "user-1", connectionId: "conn-1" });
    const verified = verifySevenShiftsOAuthState(state);
    expect(verified).toEqual({ userId: "user-1", connectionId: "conn-1" });
  });

  it("rejects tampered state", () => {
    const state = signSevenShiftsOAuthState({ userId: "user-1", connectionId: "conn-1" });
    expect(verifySevenShiftsOAuthState(`${state}x`)).toBeNull();
  });
});
