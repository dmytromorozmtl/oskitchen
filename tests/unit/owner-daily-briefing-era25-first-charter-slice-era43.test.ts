import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEra25FirstCharterSliceAction,
  ERA25_FIRST_CHARTER_SLICE_BRIEFING_ACTION_PRIORITY,
  mergeBriefingEra25FirstCharterSliceTopActions,
} from "@/lib/briefing/owner-daily-briefing-era25-first-charter-slice-era43";
import type { Era25FirstCharterSliceReadinessUiSlice } from "@/lib/commercial/era25-first-charter-slice-readiness-ui-era24";

const blockedSlice = {
  visible: true,
  era25FirstCharterSliceReadinessMilestone: "charter_exit_blocked",
  platformOpsHref: "/platform/ops#era25-first-charter-slice-readiness",
} as Era25FirstCharterSliceReadinessUiSlice;

describe("owner-daily-briefing-era25-first-charter-slice-era43", () => {
  it("ranks first charter slice action at priority 18", () => {
    const action = buildOwnerDailyBriefingEra25FirstCharterSliceAction(blockedSlice);
    expect(action?.priority).toBe(ERA25_FIRST_CHARTER_SLICE_BRIEFING_ACTION_PRIORITY);
    expect(action?.severity).toBe("high");
  });

  it("merges first charter slice action ahead of lower-priority items", () => {
    const merged = mergeBriefingEra25FirstCharterSliceTopActions(
      buildOwnerDailyBriefingEra25FirstCharterSliceAction(blockedSlice),
      [{ id: "other", priority: 99 } as never],
    );
    expect(merged[0]?.id).toBe("era25-first-charter-slice-readiness");
  });
});
