import { describe, expect, it } from "vitest";

import {
  buildThemeExperimentEdgeRouting,
  edgeRoutingKeyForStore,
  parseThemeExperimentEdgeRouting,
} from "@/lib/storefront/theme-experiment-edge-routing";

describe("theme experiment edge routing", () => {
  it("routing key is namespaced by store slug", () => {
    expect(edgeRoutingKeyForStore("acme")).toBe("theme-exp-routing:acme");
  });

  it("parse rejects invalid routing payloads", () => {
    expect(parseThemeExperimentEdgeRouting(null)).toBeNull();
    expect(parseThemeExperimentEdgeRouting({})).toBeNull();
  });

  it("build + parse round-trip workspace config key", () => {
    const raw = buildThemeExperimentEdgeRouting({
      workspaceId: "ws-1",
      storeSlug: "acme",
    });
    const parsed = parseThemeExperimentEdgeRouting(raw);
    expect(parsed?.configKey).toBe("theme-exp:ws-1:acme");
    expect(parsed?.legacyKey).toBe("theme-exp:acme");
    expect(parsed?.workspaceId).toBe("ws-1");
  });
});
