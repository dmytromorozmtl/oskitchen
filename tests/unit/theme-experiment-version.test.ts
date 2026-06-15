import { describe, expect, it } from "vitest";
import { type ThemeExperimentJson } from "@/lib/prisma/json";

import {
  buildThemeExperimentJsonConclude,
  buildThemeExperimentJsonForSave,
  getThemeExperimentVersion,
} from "@/lib/storefront/theme-experiment-version";
import { evaluateExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";

describe("theme experiment version", () => {
  it("bumps version on each save", () => {
    const v1 = buildThemeExperimentJsonForSave({
      enabled: true,
      trafficPercent: 50,
      previousRaw: null,
    });
    expect(v1.version).toBe(1);
    const v2 = buildThemeExperimentJsonForSave({
      enabled: true,
      trafficPercent: 40,
      previousRaw: v1,
    });
    expect(v2.version).toBe(2);
    expect(getThemeExperimentVersion(v2)).toBe(2);
  });

  it("conclude disables experiment and bumps version", () => {
    const active = buildThemeExperimentJsonForSave({
      enabled: true,
      trafficPercent: 50,
      draftPresetId: "modern",
      previousRaw: null,
    });
    const concluded = buildThemeExperimentJsonConclude({
      previousRaw: active,
      outcome: "publish_draft",
    });
    expect(concluded.enabled).toBe(false);
    expect(concluded.version).toBe(active.version + 1);
    expect(concluded.concludeOutcome).toBe("publish_draft");
    expect(concluded.concludedAt).toBeTruthy();
  });
});

describe("experiment prod decision", () => {
  it("recommends publish_draft when lift and significance pass", () => {
    const d = evaluateExperimentProdDecision([
      {
        arm: "published",
        exposures: 500,
        checkouts: 200,
        conversions: 40,
        conversionRatePercent: 20,
      },
      {
        arm: "draft",
        exposures: 500,
        checkouts: 200,
        conversions: 60,
        conversionRatePercent: 30,
      },
    ]);
    expect(d.recommendation).toBe("publish_draft");
    expect(d.significant).toBe(true);
  });

  it("insufficient_data below checkout threshold", () => {
    const d = evaluateExperimentProdDecision([
      {
        arm: "published",
        exposures: 10,
        checkouts: 10,
        conversions: 2,
        conversionRatePercent: 20,
      },
      {
        arm: "draft",
        exposures: 10,
        checkouts: 10,
        conversions: 4,
        conversionRatePercent: 40,
      },
    ]);
    expect(d.recommendation).toBe("insufficient_data");
  });
});
