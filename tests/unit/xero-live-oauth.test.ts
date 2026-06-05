import { describe, expect, it } from "vitest";

import {
  signXeroOAuthState,
  verifyXeroOAuthState,
} from "@/services/integrations/xero/xero-live-service";

describe("xero oauth state", () => {
  it("round-trips signed state", () => {
    const state = signXeroOAuthState({ userId: "user-1", connectionId: "conn-1" });
    const verified = verifyXeroOAuthState(state);
    expect(verified).toEqual({ userId: "user-1", connectionId: "conn-1" });
  });

  it("rejects tampered state", () => {
    const state = signXeroOAuthState({ userId: "user-1", connectionId: "conn-1" });
    expect(verifyXeroOAuthState(`${state}x`)).toBeNull();
  });
});
