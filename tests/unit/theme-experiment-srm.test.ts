import { describe, expect, it } from "vitest";
import { type ThemeExperimentJson } from "@/lib/prisma/json";

import { evaluateExperimentSrm } from "@/lib/storefront/theme-experiment-srm";
import { getExperimentEnableCooldownBlock } from "@/lib/storefront/theme-experiment-cooldown";
import { buildThemeExperimentJsonConclude } from "@/lib/storefront/theme-experiment-version";
import { isThemeExperimentEdgeStrict } from "@/lib/storefront/theme-experiment-edge-strict";

describe("experiment SRM", () => {
  it("warns when draft share drifts >5pp with enough exposures", () => {
    const srm = evaluateExperimentSrm(
      [
        { arm: "published", exposures: 400, checkouts: 0, conversions: 0, conversionRatePercent: 0 },
        { arm: "draft", exposures: 600, checkouts: 0, conversions: 0, conversionRatePercent: 0 },
      ],
      50,
    );
    expect(srm.warn).toBe(true);
    expect(srm.observedDraftPercent).toBe(60);
  });
});

describe("experiment cooldown", () => {
  it("blocks re-enable within 7 days of conclude", () => {
    const concluded = buildThemeExperimentJsonConclude({
      previousRaw: { enabled: true, version: 1, updatedAt: new Date().toISOString(), trafficPercent: 50 },
      outcome: "publish_draft",
    });
    const block = getExperimentEnableCooldownBlock(concluded, true);
    expect(block?.blocked).toBe(true);
  });
});

describe("edge strict", () => {
  it("is false outside production by default", () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";
    process.env.THEME_EXPERIMENT_EDGE_STRICT = undefined;
    process.env.THEME_EXPERIMENT_EDGE = "1";
    expect(isThemeExperimentEdgeStrict()).toBe(false);
    process.env.NODE_ENV = prev;
  });
});
