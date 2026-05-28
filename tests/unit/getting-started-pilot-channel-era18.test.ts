import { describe, expect, it } from "vitest";

import {
  GETTING_STARTED_PILOT_CHANNEL_ERA18_BACKLOG_ID,
  GETTING_STARTED_PILOT_CHANNEL_ERA18_POLICY_ID,
  GETTING_STARTED_PILOT_CHANNEL_ERA18_PROOF_STATUS,
} from "@/lib/onboarding/getting-started-pilot-channel-era18-policy";
import {
  buildGettingStartedPilotChannelFocus,
  pickGettingStartedPilotChannelAttentionItems,
  summarizeGettingStartedPilotChannelFocus,
} from "@/lib/onboarding/getting-started-pilot-channel-era18";
import type { GettingStartedPayload } from "@/services/onboarding/getting-started-status";

function payload(over: Partial<GettingStartedPayload> = {}): GettingStartedPayload {
  return {
    items: [
      { id: "menu", label: "Menu", href: "/dashboard/menus/new", done: false },
      { id: "integration", label: "Integration", href: "/dashboard/integrations", done: false },
      { id: "order", label: "Order", href: "/dashboard/orders/new", done: false },
    ],
    allDone: false,
    showChecklist: true,
    accountAgeDays: 3,
    pilotChannel: { connectedCount: 0, errorCount: 0 },
    ...over,
  };
}

describe("getting-started-pilot-channel-era18 policy", () => {
  it("registers era18 pilot channel onboarding proof", () => {
    expect(GETTING_STARTED_PILOT_CHANNEL_ERA18_POLICY_ID).toBe(
      "era18-getting-started-pilot-channel-v1",
    );
    expect(GETTING_STARTED_PILOT_CHANNEL_ERA18_PROOF_STATUS).toBe(
      "getting_started_pilot_channel_wired",
    );
    expect(GETTING_STARTED_PILOT_CHANNEL_ERA18_BACKLOG_ID).toBe("KOS-E18-028");
  });
});

describe("pickGettingStartedPilotChannelAttentionItems", () => {
  it("surfaces integration errors first", () => {
    const focus = buildGettingStartedPilotChannelFocus(
      payload({
        pilotChannel: { connectedCount: 1, errorCount: 2 },
      }),
    );

    const items = pickGettingStartedPilotChannelAttentionItems(focus);
    expect(items[0]?.id).toBe("integration-errors");
    expect(items[0]?.href).toBe("/dashboard/integration-health");
  });

  it("prompts channel connect after menu is complete", () => {
    const focus = buildGettingStartedPilotChannelFocus(
      payload({
        items: [
          { id: "menu", label: "Menu", href: "/dashboard/menus/new", done: true },
          { id: "integration", label: "Integration", href: "/dashboard/integrations", done: false },
        ],
      }),
    );

    const items = pickGettingStartedPilotChannelAttentionItems(focus);
    expect(items.some((item) => item.id === "connect-channel")).toBe(true);
  });

  it("returns empty when menu incomplete and no errors", () => {
    const focus = buildGettingStartedPilotChannelFocus(payload());
    expect(pickGettingStartedPilotChannelAttentionItems(focus)).toEqual([]);
  });
});

describe("summarizeGettingStartedPilotChannelFocus", () => {
  it("flags urgent when integration errors exist", () => {
    const focus = buildGettingStartedPilotChannelFocus(
      payload({ pilotChannel: { connectedCount: 0, errorCount: 1 } }),
    );
    expect(summarizeGettingStartedPilotChannelFocus(focus).hasUrgent).toBe(true);
  });
});
