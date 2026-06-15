import { describe, expect, it } from "vitest";

import {
  signMailchimpOAuthState,
  verifyMailchimpOAuthState,
} from "@/services/integrations/mailchimp/mailchimp-live-service";

describe("mailchimp oauth state", () => {
  it("round-trips signed state", () => {
    const state = signMailchimpOAuthState({ userId: "user-1", connectionId: "conn-1" });
    const verified = verifyMailchimpOAuthState(state);
    expect(verified).toEqual({ userId: "user-1", connectionId: "conn-1" });
  });

  it("rejects tampered state", () => {
    const state = signMailchimpOAuthState({ userId: "user-1", connectionId: "conn-1" });
    expect(verifyMailchimpOAuthState(`${state}x`)).toBeNull();
  });
});
