import { describe, expect, it } from "vitest";

import { isValidKlaviyoCampaignFlow } from "@/services/integrations/klaviyo/campaign-triggers.service";

describe("klaviyo campaign triggers", () => {
  it("accepts known email flows", () => {
    expect(isValidKlaviyoCampaignFlow("welcome")).toBe(true);
    expect(isValidKlaviyoCampaignFlow("post_purchase")).toBe(true);
  });

  it("rejects unknown flows", () => {
    expect(isValidKlaviyoCampaignFlow("newsletter")).toBe(false);
    expect(isValidKlaviyoCampaignFlow("")).toBe(false);
  });
});
