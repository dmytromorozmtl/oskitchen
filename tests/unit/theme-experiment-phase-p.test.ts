import { describe, expect, it } from "vitest";

import {
  buildCausalDagEdges,
  evaluateSpilloverPublishGate,
  mergeSpilloverDailyIntoJson,
} from "@/lib/storefront/theme-experiment-causal-dag";
import {
  ingestDurableFeatureStreamEvent,
  writeDurableLogToJson,
} from "@/lib/storefront/theme-experiment-feature-stream-durable";
import {
  buildPartialRevertSnapshot,
  seedPartialRollbackSnapshot,
} from "@/lib/storefront/theme-experiment-partial-rollback";
import {
  nearestEdgeRegionForGeo,
  resolvePlanetEdgeConfigIds,
} from "@/lib/storefront/theme-experiment-edge-planet";
import { buildSoc2Type2EvidenceBinder } from "@/lib/compliance/soc2-control-mapping";

describe("P1 causal DAG spillover", () => {
  it("bans publish when spillover > 1pp", () => {
    process.env.THEME_EXPERIMENT_CAUSAL_DAG = "1";
    process.env.THEME_EXPERIMENT_SPILLOVER_BAN_PP = "1";
    const cells = [
      {
        workspaceId: "ws1",
        storeSlug: "cafe",
        region: "US",
        segment: "mobile",
        spilloverPp: 1.5,
        treatmentArmId: "draft",
      },
    ];
    const json = mergeSpilloverDailyIntoJson(null, {
      at: new Date().toISOString(),
      cells,
      maxSpilloverPp: 1.5,
      publishBanned: true,
      dagEdges: buildCausalDagEdges(cells),
    });
    const gate = evaluateSpilloverPublishGate(json);
    expect(gate.passed).toBe(false);
    expect(gate.maxSpilloverPp).toBe(1.5);
  });
});

describe("P2 durable feature stream", () => {
  it("dedupes eventId within 24h", () => {
    const first = ingestDurableFeatureStreamEvent({
      previousRaw: null,
      eventId: "evt-1",
      event: {
        visitorId: "v1",
        sessionId: "s1",
        segment: "default",
        geo: "US",
        device: "mobile",
        cartValueCents: 0,
      },
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const json = writeDurableLogToJson(null, first.log);
    const second = ingestDurableFeatureStreamEvent({
      previousRaw: json,
      eventId: "evt-1",
      event: {
        visitorId: "v1",
        sessionId: "s1",
        segment: "default",
        geo: "US",
        device: "mobile",
        cartValueCents: 0,
      },
    });
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.duplicate).toBe(true);
  });
});

describe("P5 partial rollback", () => {
  it("keeps winner nav on partial revert", () => {
    const published = {
      version: 1 as const,
      navigationItems: [{ label: "Old" }],
      tokens: { brandColor: "#111111" },
    };
    const winner = {
      version: 1 as const,
      navigationItems: [{ label: "Winner copy" }],
      tokens: { brandColor: "#222222" },
    };
    const json = seedPartialRollbackSnapshot({
      previousRaw: null,
      publishedSnapshot: published,
      winnerSnapshot: winner,
    });
    const snap = (json as { partialRollbackSnapshot: { publishedSnapshot: typeof published; winnerSnapshot: typeof winner; layoutTokens: typeof published.tokens } })
      .partialRollbackSnapshot;
    const reverted = buildPartialRevertSnapshot(snap);
    expect(reverted.navigationItems).toEqual(winner.navigationItems);
    expect(reverted.tokens?.brandColor).toBe("#111111");
  });
});

describe("P3 planet edge", () => {
  it("resolves nearest region for geo", () => {
    expect(nearestEdgeRegionForGeo("US")).toBe("iad1");
    expect(nearestEdgeRegionForGeo("DE")).toBe("dub1");
    expect(resolvePlanetEdgeConfigIds().length).toBeGreaterThanOrEqual(0);
  });
});

describe("P4 SOC2 Type II", () => {
  it("maps crons to controls", () => {
    const binder = buildSoc2Type2EvidenceBinder();
    expect(binder.controls.length).toBeGreaterThan(0);
    expect(binder.period).toMatch(/^\d{4}-\d{2}$/);
  });
});
