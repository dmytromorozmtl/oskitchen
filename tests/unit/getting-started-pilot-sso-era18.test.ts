import { describe, expect, it } from "vitest";

import {
  GETTING_STARTED_PILOT_SSO_ERA18_BACKLOG_ID,
  GETTING_STARTED_PILOT_SSO_ERA18_POLICY_ID,
  GETTING_STARTED_PILOT_SSO_ERA18_PROOF_STATUS,
  GETTING_STARTED_SSO_PILOT_ACTIVATION_ANCHOR,
  GETTING_STARTED_SSO_PILOT_CONFIGURATION_ANCHOR,
  GETTING_STARTED_SSO_PILOT_SETTINGS_ROUTE,
} from "@/lib/onboarding/getting-started-pilot-sso-era18-policy";
import {
  buildGettingStartedPilotSsoFocus,
  pickGettingStartedPilotSsoAttentionItems,
  summarizeGettingStartedPilotSsoFocus,
} from "@/lib/onboarding/getting-started-pilot-sso-era18";
import type { GettingStartedPayload } from "@/services/onboarding/getting-started-status";

function payload(over: Partial<GettingStartedPayload> = {}): GettingStartedPayload {
  return {
    items: [
      { id: "menu", label: "Menu", href: "/dashboard/menus/new", done: false },
      { id: "sso_pilot", label: "SSO", href: "/dashboard/settings/security/sso", done: false },
    ],
    allDone: false,
    showChecklist: true,
    accountAgeDays: 3,
    pilotChannel: { connectedCount: 0, errorCount: 0 },
    pilotChannelLiveProof: { slices: [] },
    pilotSso: {
      entitlementEnabled: true,
      configured: false,
      active: false,
      workspaceId: "ws-pilot-1",
    },
    ...over,
  };
}

describe("getting-started-pilot-sso-era18 policy", () => {
  it("registers era18 pilot SSO onboarding proof", () => {
    expect(GETTING_STARTED_PILOT_SSO_ERA18_POLICY_ID).toBe("era18-getting-started-pilot-sso-v1");
    expect(GETTING_STARTED_PILOT_SSO_ERA18_PROOF_STATUS).toBe("getting_started_pilot_sso_wired");
    expect(GETTING_STARTED_PILOT_SSO_ERA18_BACKLOG_ID).toBe("KOS-E18-043");
  });
});

describe("pickGettingStartedPilotSsoAttentionItems", () => {
  it("prompts IdP configuration when entitlement exists but SSO is not configured", () => {
    const focus = buildGettingStartedPilotSsoFocus(payload());
    const items = pickGettingStartedPilotSsoAttentionItems(focus);

    expect(items[0]?.id).toBe("configure-sso-pilot");
    expect(items[0]?.href).toBe(
      `${GETTING_STARTED_SSO_PILOT_SETTINGS_ROUTE}${GETTING_STARTED_SSO_PILOT_CONFIGURATION_ANCHOR}`,
    );
  });

  it("prompts activation when configured but inactive", () => {
    const focus = buildGettingStartedPilotSsoFocus(
      payload({
        pilotSso: {
          entitlementEnabled: true,
          configured: true,
          active: false,
          workspaceId: "ws-pilot-1",
        },
      }),
    );
    const items = pickGettingStartedPilotSsoAttentionItems(focus);

    expect(items[0]?.id).toBe("activate-sso-pilot");
    expect(items[0]?.href).toBe(
      `${GETTING_STARTED_SSO_PILOT_SETTINGS_ROUTE}${GETTING_STARTED_SSO_PILOT_ACTIVATION_ANCHOR}`,
    );
  });

  it("returns empty when SSO pilot is active or entitlement missing", () => {
    expect(
      pickGettingStartedPilotSsoAttentionItems(
        buildGettingStartedPilotSsoFocus(
          payload({
            pilotSso: {
              entitlementEnabled: true,
              configured: true,
              active: true,
              workspaceId: "ws-pilot-1",
            },
          }),
        ),
      ),
    ).toEqual([]);

    expect(
      pickGettingStartedPilotSsoAttentionItems(
        buildGettingStartedPilotSsoFocus(
          payload({
            pilotSso: {
              entitlementEnabled: false,
              configured: false,
              active: false,
              workspaceId: "ws-pilot-1",
            },
          }),
        ),
      ),
    ).toEqual([]);
  });
});

describe("summarizeGettingStartedPilotSsoFocus", () => {
  it("flags urgent when SSO setup is incomplete with entitlement", () => {
    const focus = buildGettingStartedPilotSsoFocus(payload());
    expect(summarizeGettingStartedPilotSsoFocus(focus).hasUrgent).toBe(true);
  });
});
