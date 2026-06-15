import { describe, expect, it } from "vitest";

import {
  buildThemeExperimentEdgePayload,
  edgeConfigKeyForStore,
  parseThemeExperimentEdgePayload,
} from "@/lib/storefront/theme-experiment-edge-config";

describe("theme experiment edge config", () => {
  it("edgeConfigKeyForStore uses theme-exp namespace", () => {
    expect(edgeConfigKeyForStore("acme")).toBe("theme-exp:acme");
  });

  it("edgeConfigKeyForStore namespaces by workspace when provided", () => {
    expect(edgeConfigKeyForStore("acme", "ws-uuid-1")).toBe("theme-exp:ws-uuid-1:acme");
  });

  it("parseThemeExperimentEdgePayload rejects invalid JSON", () => {
    expect(parseThemeExperimentEdgePayload(null)).toBeNull();
    expect(parseThemeExperimentEdgePayload({ enabled: false })).toBeNull();
  });

  it("parseThemeExperimentEdgePayload rejects pipeline kill switch", () => {
    expect(
      parseThemeExperimentEdgePayload({
        enabled: true,
        pipelineEnabled: false,
        experimentId: "sf-1",
        version: 1,
      }),
    ).toBeNull();
  });

  it("buildThemeExperimentEdgePayload includes version", () => {
    const p = buildThemeExperimentEdgePayload({
      storefrontId: "sf-1",
      config: { enabled: true, trafficPercent: 40 },
      version: 3,
    });
    expect(p.experimentId).toBe("sf-1");
    expect(p.trafficPercent).toBe(40);
    expect(p.version).toBe(3);
    expect(p.arms).toEqual(["published", "draft"]);
  });
});
