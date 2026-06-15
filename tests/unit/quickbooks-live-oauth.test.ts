import { describe, expect, it } from "vitest";

import {
  signQuickBooksOAuthState,
  verifyQuickBooksOAuthState,
} from "@/services/integrations/quickbooks/quickbooks-live-service";

describe("quickbooks oauth state", () => {
  it("round-trips signed state", () => {
    const state = signQuickBooksOAuthState({ userId: "user-1", connectionId: "conn-1" });
    const verified = verifyQuickBooksOAuthState(state);
    expect(verified).toEqual({ userId: "user-1", connectionId: "conn-1" });
  });

  it("rejects tampered state", () => {
    const state = signQuickBooksOAuthState({ userId: "user-1", connectionId: "conn-1" });
    expect(verifyQuickBooksOAuthState(`${state}x`)).toBeNull();
  });
});
