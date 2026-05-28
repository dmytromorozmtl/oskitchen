import { describe, expect, it } from "vitest";

import {
  CHANNEL_PILOT_PLAYBOOK_ERA17_POLICY_ID,
  CHANNEL_PILOT_PLAYBOOK_ERA17_STATUS,
} from "@/lib/integrations/channel-pilot-playbook-era17-policy";

describe("channel pilot playbook era17 policy", () => {
  it("locks era17 channel pilot playbook policy id", () => {
    expect(CHANNEL_PILOT_PLAYBOOK_ERA17_POLICY_ID).toBe("era17-channel-pilot-playbook-v1");
  });

  it("marks playbook operator_ready without live smoke pass claim", () => {
    expect(CHANNEL_PILOT_PLAYBOOK_ERA17_STATUS).toBe("operator_ready");
  });
});
