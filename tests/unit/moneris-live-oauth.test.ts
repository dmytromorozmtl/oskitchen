import { describe, expect, it } from "vitest";

import {
  signMonerisOAuthState,
  verifyMonerisOAuthState,
} from "@/services/integrations/moneris/moneris-live-service";

describe("moneris oauth state", () => {
  it("round-trips signed state", () => {
    const state = signMonerisOAuthState({ userId: "user-1", connectionId: "conn-1" });
    const verified = verifyMonerisOAuthState(state);
    expect(verified).toEqual({ userId: "user-1", connectionId: "conn-1" });
  });

  it("rejects tampered state", () => {
    const state = signMonerisOAuthState({ userId: "user-1", connectionId: "conn-1" });
    expect(verifyMonerisOAuthState(`${state}x`)).toBeNull();
  });
});
