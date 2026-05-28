import { describe, expect, it } from "vitest";

import {
  GETTING_STARTED_FOCUS_ERA18_POLICY_ID,
  GETTING_STARTED_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/onboarding/getting-started-focus-era18-policy";
import {
  GETTING_STARTED_STEP_PRIORITY,
  pickGettingStartedNextStep,
  shouldCollapseGettingStartedList,
} from "@/lib/onboarding/getting-started-focus-era18";
import type { GettingStartedItem } from "@/services/onboarding/getting-started-status";

function item(id: string, done: boolean, href = `/step/${id}`): GettingStartedItem {
  return { id, label: id, href, done };
}

describe("getting started focus era18", () => {
  it("locks era18 getting started focus policy id", () => {
    expect(GETTING_STARTED_FOCUS_ERA18_POLICY_ID).toBe("era18-getting-started-focus-v1");
    expect(GETTING_STARTED_FOCUS_ERA18_PROOF_STATUS).toBe("getting_started_focus_wired");
  });

  it("prioritizes menu before first order in golden path", () => {
    const next = pickGettingStartedNextStep([
      item("storefront", false),
      item("order", false),
      item("menu", false),
    ]);
    expect(next?.id).toBe("menu");
  });

  it("surfaces first order after menu is complete", () => {
    const next = pickGettingStartedNextStep([
      item("menu", true),
      item("pos", false),
      item("order", false),
    ]);
    expect(next?.id).toBe("order");
  });

  it("returns null when all steps are done", () => {
    expect(
      pickGettingStartedNextStep(GETTING_STARTED_STEP_PRIORITY.map((id) => item(id, true))),
    ).toBeNull();
  });

  it("collapses full checklist unless expanded or complete", () => {
    expect(shouldCollapseGettingStartedList({ showAllSteps: false, allDone: false })).toBe(true);
    expect(shouldCollapseGettingStartedList({ showAllSteps: true, allDone: false })).toBe(false);
    expect(shouldCollapseGettingStartedList({ showAllSteps: false, allDone: true })).toBe(false);
  });
});
