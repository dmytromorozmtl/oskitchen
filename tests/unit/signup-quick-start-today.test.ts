import { describe, expect, it, vi } from "vitest";

import {
  QUICK_START_SKIP_DESTINATION,
  SIGNUP_POST_AUTH_DEFAULT_PATH,
  SIGNUP_QUICK_START_TODAY_E2E_POLICY_ID,
  TODAY_PATH,
  isSignupQuickStartE2EEnabled,
} from "@/lib/onboarding/signup-quick-start-today-e2e-policy";
import { quickStartFinishUrl } from "@/lib/onboarding/quick-start-channels";

describe("signup → quick start → today lifecycle (QA-13)", () => {
  it("exports E2E policy route contract", () => {
    expect(SIGNUP_QUICK_START_TODAY_E2E_POLICY_ID).toBe("signup-quick-start-today-e2e-v1");
    expect(SIGNUP_POST_AUTH_DEFAULT_PATH).toBe("/onboarding");
    expect(QUICK_START_SKIP_DESTINATION).toBe(TODAY_PATH);
  });

  it("quick start skip destination is Today command center", () => {
    expect(QUICK_START_SKIP_DESTINATION).toBe("/dashboard/today");
  });

  it("quickStartFinishUrl falls back to Today for non-POS channel mixes", () => {
    expect(quickStartFinishUrl(["website"], "WALK_IN_DAILY")).toBe("/dashboard/storefront");
    expect(quickStartFinishUrl(["pos"], "WALK_IN_DAILY")).toContain("/dashboard/pos/terminal");
    expect(quickStartFinishUrl([], "WALK_IN_DAILY")).toBe("/dashboard/today");
  });

  it("full signup E2E gate requires E2E_SIGNUP_AUTO_CONFIRM", () => {
    vi.stubEnv("E2E_SIGNUP_AUTO_CONFIRM", "");
    expect(isSignupQuickStartE2EEnabled()).toBe(false);
    vi.stubEnv("E2E_SIGNUP_AUTO_CONFIRM", "true");
    expect(isSignupQuickStartE2EEnabled()).toBe(true);
    vi.unstubAllEnvs();
  });
});
