import { describe, expect, it } from "vitest";

import {
  signHomebaseOAuthState,
  verifyHomebaseOAuthState,
} from "@/services/integrations/homebase/homebase-live-service";

describe("homebase oauth state", () => {
  it("round-trips signed state", () => {
    const state = signHomebaseOAuthState({ userId: "user-1", connectionId: "conn-1" });
    const verified = verifyHomebaseOAuthState(state);
    expect(verified).toEqual({ userId: "user-1", connectionId: "conn-1" });
  });

  it("rejects tampered state", () => {
    const state = signHomebaseOAuthState({ userId: "user-1", connectionId: "conn-1" });
    expect(verifyHomebaseOAuthState(`${state}x`)).toBeNull();
  });
});
