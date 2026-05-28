import { describe, expect, it } from "vitest";

import {
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_LIVE_SMOKE_NPM,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID,
} from "@/lib/api-public/public-api-partner-confidence-era16-policy";

describe("public API partner confidence era16 policy", () => {
  it("locks era16 public API partner confidence policy id", () => {
    expect(PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID).toBe(
      "era16-public-api-partner-confidence-v1",
    );
  });

  it("defines live smoke npm script name", () => {
    expect(PUBLIC_API_PARTNER_CONFIDENCE_ERA16_LIVE_SMOKE_NPM).toBe("smoke:public-api-live");
  });
});
