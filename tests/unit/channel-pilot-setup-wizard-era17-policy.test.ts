import { describe, expect, it } from "vitest";

import {
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_BACKLOG_ID,
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_POLICY_ID,
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_PROOF_STATUS,
} from "@/lib/integrations/channel-pilot-setup-wizard-era17-policy";

describe("channel pilot setup wizard era17 policy", () => {
  it("locks era17 channel pilot setup wizard policy id", () => {
    expect(CHANNEL_PILOT_SETUP_WIZARD_ERA17_POLICY_ID).toBe(
      "era17-channel-pilot-setup-wizard-v1",
    );
    expect(CHANNEL_PILOT_SETUP_WIZARD_ERA17_PROOF_STATUS).toBe("pilot_setup_wizard_ready");
    expect(CHANNEL_PILOT_SETUP_WIZARD_ERA17_BACKLOG_ID).toBe("KOS-E17-033");
  });
});
