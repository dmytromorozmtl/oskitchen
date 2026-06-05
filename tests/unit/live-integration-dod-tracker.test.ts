import { describe, expect, it } from "vitest";

import {
  evaluateLiveIntegrationDodRow,
  listLiveIntegrationDodRows,
  LIVE_INTEGRATION_DOD_POLICY_ID,
  summarizeLiveIntegrationDod,
} from "@/lib/integrations/live-integration-dod-tracker";
import { getIntegrationById } from "@/lib/integrations/integration-registry";

describe("live integration dod tracker", () => {
  it("locks live integration dod policy id", () => {
    expect(LIVE_INTEGRATION_DOD_POLICY_ID).toBe("live-integration-dod-v1");
  });

  it("lists fifteen BETA integration rows with G1–G4 gates", () => {
    const rows = listLiveIntegrationDodRows({});
    expect(rows).toHaveLength(15);
    for (const row of rows) {
      expect(row.gates).toHaveLength(4);
      expect(row.registryStatus).toBe("BETA");
    }
  });

  it("marks G2 failed when platform env missing", () => {
    const entry = getIntegrationById("square");
    expect(entry).toBeDefined();
    const row = evaluateLiveIntegrationDodRow(entry!, {
      scaffoldOk: true,
      env: {},
    });
    expect(row.gates.find((g) => g.id === "G2")?.status).toBe("failed");
    expect(row.promotionEligible).toBe(false);
  });

  it("marks G1+G2 ready when scaffold and env pass", () => {
    const entry = getIntegrationById("email-orders");
    expect(entry).toBeDefined();
    const row = evaluateLiveIntegrationDodRow(entry!, {
      scaffoldOk: true,
      env: {},
    });
    expect(row.gates.find((g) => g.id === "G1")?.status).toBe("passed");
    expect(row.gates.find((g) => g.id === "G2")?.status).toBe("passed");
    expect(row.promotionEligible).toBe(true);
    expect(row.blockedReason).toContain("G3/G4");
  });

  it("summarizes scaffold and env readiness counts", () => {
    const rows = listLiveIntegrationDodRows({});
    const summary = summarizeLiveIntegrationDod(rows);
    expect(summary.total).toBe(15);
    expect(summary.scaffoldReadyCount).toBe(15);
    expect(summary.liveCount).toBe(5);
  });
});
