import { describe, expect, it } from "vitest";

import {
  signSquarePaymentsOAuthState,
  verifySquarePaymentsOAuthState,
} from "@/services/integrations/square-payments/square-payments-live-service";

describe("square payments oauth state", () => {
  it("round-trips signed state", () => {
    const state = signSquarePaymentsOAuthState({ userId: "user-1", connectionId: "conn-1" });
    const verified = verifySquarePaymentsOAuthState(state);
    expect(verified).toEqual({ userId: "user-1", connectionId: "conn-1" });
  });

  it("rejects tampered state", () => {
    const state = signSquarePaymentsOAuthState({ userId: "user-1", connectionId: "conn-1" });
    expect(verifySquarePaymentsOAuthState(`${state}x`)).toBeNull();
  });
});
