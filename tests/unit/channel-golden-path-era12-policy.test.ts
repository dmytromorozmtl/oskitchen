import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CHANNEL_GOLDEN_PATH_ERA12_ORDER_HUB_SERVICE_MARKERS,
  CHANNEL_GOLDEN_PATH_ERA12_POLICY_ID,
  CHANNEL_GOLDEN_PATH_ERA12_WORKSPACE_SCOPE_MARKERS,
} from "@/lib/integrations/channel-golden-path-era12-policy";
import { CHANNEL_GOLDEN_PATH_STAGES } from "@/lib/integrations/channel-golden-path-policy";

const ROOT = process.cwd();

describe("channel golden path era12 policy", () => {
  it("locks era12 channel golden path recert policy id", () => {
    expect(CHANNEL_GOLDEN_PATH_ERA12_POLICY_ID).toBe(
      "era12-channel-golden-path-recert-v1",
    );
    expect(CHANNEL_GOLDEN_PATH_STAGES).toContain("order_hub_visibility");
  });

  it("wires order hub visibility to scoped externalOrder queries", () => {
    const hub = readFileSync(
      join(ROOT, "services/order-hub/order-hub-service.ts"),
      "utf8",
    );
    for (const marker of CHANNEL_GOLDEN_PATH_ERA12_ORDER_HUB_SERVICE_MARKERS) {
      expect(hub, `order-hub missing ${marker}`).toContain(marker);
    }

    const scope = readFileSync(
      join(ROOT, "lib/scope/workspace-channel-scope.ts"),
      "utf8",
    );
    for (const marker of CHANNEL_GOLDEN_PATH_ERA12_WORKSPACE_SCOPE_MARKERS) {
      expect(scope, `workspace scope missing ${marker}`).toContain(marker);
    }
  });
});
