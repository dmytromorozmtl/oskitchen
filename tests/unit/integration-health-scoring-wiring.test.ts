import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { INTEGRATION_HEALTH_SCORING_DOC } from "@/lib/integration-health/health-scoring-policy";

const ROOT = process.cwd();

describe("integration health scoring wiring", () => {
  it("ships health scoring engine with load scoreboard", () => {
    const source = readFileSync(
      join(ROOT, "services/integration-health/health-scoring-engine.ts"),
      "utf8",
    );
    expect(source).toContain("scoreIntegrationHealth");
    expect(source).toContain("computeIntegrationHealthTrend");
    expect(source).toContain("predictIntegrationHealthAlerts");
    expect(source).toContain("loadIntegrationHealthScoreboard");
  });

  it("ships integration health sales deck", () => {
    expect(existsSync(join(ROOT, INTEGRATION_HEALTH_SCORING_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, INTEGRATION_HEALTH_SCORING_DOC), "utf8");
    expect(doc).toContain("0–100");
    expect(doc).toContain("Predictive alerts");
    expect(doc).toContain("health-scoring-engine.ts");
  });
});
