import { describe, expect, it } from "vitest";

import {
  CHANNEL_PILOT_CERTIFICATION_ANCHOR,
  CHANNEL_PILOT_CONNECTION_ANCHOR,
  CHANNEL_PILOT_SETUP_FOCUS_ERA18_POLICY_ID,
  CHANNEL_PILOT_SETUP_FOCUS_ERA18_PROOF_STATUS,
  CHANNEL_PILOT_TOOLS_ANCHOR,
  CHANNEL_PILOT_WEBHOOK_LOG_ROUTE,
} from "@/lib/integrations/channel-pilot-setup-focus-era18-policy";
import {
  buildChannelPilotSetupFocusSnapshot,
  pickChannelPilotSetupAttentionItems,
  resolveChannelPilotSetupStepRowNextAction,
  shouldShowChannelPilotSetupAttentionStrip,
  summarizeChannelPilotSetupFocus,
} from "@/lib/integrations/channel-pilot-setup-focus-era18";
import {
  CHANNEL_PILOT_SETUP_WOO_STEPS,
  evaluateChannelPilotSetupProgress,
} from "@/lib/integrations/channel-pilot-setup-wizard-steps";

describe("channel pilot setup focus era18", () => {
  it("locks era18 channel pilot setup focus policy id", () => {
    expect(CHANNEL_PILOT_SETUP_FOCUS_ERA18_POLICY_ID).toBe("era18-channel-pilot-setup-focus-v1");
    expect(CHANNEL_PILOT_SETUP_FOCUS_ERA18_PROOF_STATUS).toBe(
      "channel_pilot_setup_focus_attention_wired",
    );
  });

  it("builds focus snapshot from wizard progress", () => {
    const progress = evaluateChannelPilotSetupProgress({
      provider: "woocommerce",
      hasConnection: false,
      hasCredentials: false,
      hasWebhookSecret: false,
      hasStoreIdentity: false,
      certification: null,
    });

    expect(buildChannelPilotSetupFocusSnapshot(progress)).toEqual({
      completedCount: 0,
      totalCount: 5,
      incompleteCount: 5,
      currentStepId: "save_credentials",
      pilotReady: false,
    });
  });

  it("prioritizes current setup step in attention items", () => {
    const progress = evaluateChannelPilotSetupProgress({
      provider: "woocommerce",
      hasConnection: true,
      hasCredentials: true,
      hasWebhookSecret: true,
      hasStoreIdentity: true,
      certification: null,
    });
    const items = pickChannelPilotSetupAttentionItems(progress, CHANNEL_PILOT_SETUP_WOO_STEPS);

    expect(items[0]?.id).toBe("current-step");
    expect(items[0]?.href).toBe(CHANNEL_PILOT_TOOLS_ANCHOR);
  });

  it("shows attention strip when setup is incomplete", () => {
    const progress = evaluateChannelPilotSetupProgress({
      provider: "woocommerce",
      hasConnection: false,
      hasCredentials: false,
      hasWebhookSecret: false,
      hasStoreIdentity: false,
      certification: null,
    });
    const focus = buildChannelPilotSetupFocusSnapshot(progress);

    expect(shouldShowChannelPilotSetupAttentionStrip(focus)).toBe(true);
    expect(summarizeChannelPilotSetupFocus(focus).hasUrgent).toBe(true);
  });

  it("resolves row next actions for incomplete steps", () => {
    const saveStep = CHANNEL_PILOT_SETUP_WOO_STEPS[0]!;

    expect(resolveChannelPilotSetupStepRowNextAction(saveStep, false, true)).toEqual({
      label: "Save credentials now",
      href: CHANNEL_PILOT_CONNECTION_ANCHOR,
      tone: "urgent",
    });

    const verifyStep = CHANNEL_PILOT_SETUP_WOO_STEPS[3]!;
    expect(resolveChannelPilotSetupStepRowNextAction(verifyStep, false, true)).toEqual({
      label: "Verify webhook delivery",
      href: CHANNEL_PILOT_WEBHOOK_LOG_ROUTE,
      tone: "urgent",
    });

    const certStep = CHANNEL_PILOT_SETUP_WOO_STEPS[4]!;
    expect(resolveChannelPilotSetupStepRowNextAction(certStep, false, false)).toEqual({
      label: "Open certification panel",
      href: CHANNEL_PILOT_CERTIFICATION_ANCHOR,
      tone: "normal",
    });
  });
});
