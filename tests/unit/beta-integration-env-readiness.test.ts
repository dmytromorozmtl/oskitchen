import { describe, expect, it } from "vitest";

import {
  evaluateBetaIntegrationEnvReadiness,
  listBetaIntegrationEnvReadinessCards,
  summarizeBetaIntegrationEnvReadiness,
} from "@/lib/integrations/beta-integration-env-readiness";
import {
  BETA_INTEGRATION_IDS,
  getIntegrationById,
} from "@/lib/integrations/integration-registry";

describe("beta integration env readiness", () => {
  it("lists eighteen BETA registry cards", () => {
    const cards = listBetaIntegrationEnvReadinessCards({});
    expect(cards).toHaveLength(BETA_INTEGRATION_IDS.length);
    expect(cards).toHaveLength(18);
  });

  it("marks email-orders as optional when no env required", () => {
    const entry = getIntegrationById("email-orders");
    expect(entry).toBeDefined();
    const card = evaluateBetaIntegrationEnvReadiness(entry!, {});
    expect(card.status).toBe("optional");
    expect(card.missingEnv).toEqual([]);
  });

  it("detects missing env vars for square", () => {
    const entry = getIntegrationById("square");
    expect(entry).toBeDefined();
    const missing = evaluateBetaIntegrationEnvReadiness(entry!, {});
    expect(missing.status).toBe("missing");
    expect(missing.missingEnv).toEqual(["SQUARE_ACCESS_TOKEN", "SQUARE_LOCATION_ID"]);
  });

  it("marks ready when all required env vars are set", () => {
    const entry = getIntegrationById("square");
    expect(entry).toBeDefined();
    const ready = evaluateBetaIntegrationEnvReadiness(entry!, {
      SQUARE_ACCESS_TOKEN: "test-token",
      SQUARE_LOCATION_ID: "loc-1",
    });
    expect(ready.status).toBe("ready");
    expect(ready.configuredCount).toBe(2);
    expect(ready.missingEnv).toEqual([]);
  });

  it("summarizes overall readiness", () => {
    const cards = listBetaIntegrationEnvReadinessCards({
      SQUARE_ACCESS_TOKEN: "x",
      SQUARE_LOCATION_ID: "y",
    });
    const summary = summarizeBetaIntegrationEnvReadiness(cards);
    expect(summary.total).toBe(15);
    expect(summary.readyCount).toBeGreaterThanOrEqual(1);
    expect(summary.optionalCount).toBeGreaterThanOrEqual(1);
    expect(["ready", "degraded", "blocked"]).toContain(summary.overall);
  });
});
