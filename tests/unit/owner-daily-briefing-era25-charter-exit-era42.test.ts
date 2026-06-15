import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25CharterExitAction,
  ERA25_CHARTER_EXIT_BRIEFING_ACTION_PRIORITY,
  mergeBriefingEra25CharterExitTopActions,
} from "@/lib/briefing/owner-daily-briefing-era25-charter-exit-era42";
import type { Era25CharterExitUiSlice } from "@/lib/commercial/era25-charter-exit-ui-era24";

const blockedSlice = {
  visible: true,
  era25CharterExitMilestone: "terminus_guard_blocked",
  platformOpsHref: "/platform/ops#era25-charter-exit-outside-linear-path",
} as Era25CharterExitUiSlice;

describe("owner-daily-briefing-era25-charter-exit-era42", () => {
  it("ranks charter exit action at priority 17", () => {
    const action = buildOwnerDailyBriefingEra25CharterExitAction(blockedSlice);
    expect(action?.priority).toBe(ERA25_CHARTER_EXIT_BRIEFING_ACTION_PRIORITY);
    expect(action?.severity).toBe("high");
  });

  it("merges charter exit action ahead of lower-priority items", () => {
    const merged = mergeBriefingEra25CharterExitTopActions(
      buildOwnerDailyBriefingEra25CharterExitAction(blockedSlice),
      [{ id: "other", priority: 99 } as never],
    );
    expect(merged[0]?.id).toBe("era25-charter-exit-outside-linear-path");
  });
});
