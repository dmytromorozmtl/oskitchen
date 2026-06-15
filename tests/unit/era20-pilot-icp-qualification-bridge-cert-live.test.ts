import { describe, expect, it } from "vitest";

import {
  ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_BACKLOG_ID,
  ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_CI_SCRIPTS,
} from "@/lib/commercial/era20-pilot-icp-qualification-bridge-era20-policy";

describe("era20-pilot-icp-qualification-bridge-cert-live", () => {
  it("locks cert bundle", () => {
    expect(ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_BACKLOG_ID).toBe("KOS-E20-015");
    expect(ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_CI_SCRIPTS).toContain(
      "test:ci:era20-pilot-icp-qualification-bridge",
    );
  });
});
