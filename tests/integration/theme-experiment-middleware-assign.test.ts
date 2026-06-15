import { describe, expect, it } from "vitest";

import { assignArmOrganoidKernel } from "@/lib/storefront/theme-experiment-organoid-wetware";
import { assignArmBioNeuronKernel } from "@/lib/storefront/theme-experiment-bio-neuron-assign";
import { seedCompositionalExperiment } from "@/lib/storefront/theme-experiment-compositional-ui";
import {
  mergeWetwareCalibration,
  type WetwareCalibrationSnapshot,
} from "@/lib/storefront/theme-experiment-wetware-calibration";
import { mergeCorticalOrganoidMesh } from "@/lib/storefront/theme-experiment-cortical-organoid-mesh";
import { mergeHippocampalOrganoidMesh } from "@/lib/storefront/theme-experiment-hippocampal-organoid-mesh";
import { mergePrefrontalOrganoidMesh } from "@/lib/storefront/theme-experiment-prefrontal-organoid-mesh";
import type { LinUcbSnapshot } from "@/lib/storefront/theme-experiment-linucb";

const snap: LinUcbSnapshot = {
  at: new Date().toISOString(),
  explorationPercent: 10,
  regretPp: 0,
  featureDim: 2,
  arms: [
    { armId: "published", theta: [1], weight: 50 },
    { armId: "draft", theta: [2], weight: 50 },
  ],
};

describe("middleware assign chain integration", () => {
  it("organoid path applies cortical → hippocampal → prefrontal before assign", () => {
    process.env.THEME_EXPERIMENT_ORGANOID_WETWARE = "1";
    process.env.THEME_EXPERIMENT_BIO_NEURON_ASSIGN = "1";
    process.env.THEME_EXPERIMENT_CORTICAL_ORGANOID_MESH = "1";
    process.env.THEME_EXPERIMENT_HIPPOCAMPAL_ORGANOID_MESH = "1";
    process.env.THEME_EXPERIMENT_PREFRONTAL_ORGANOID_MESH = "1";
    process.env.THEME_EXPERIMENT_WETWARE_CALIBRATION = "1";

    let json = seedCompositionalExperiment({
      previousRaw: null,
      headerVariants: ["a", "b", "c", "d", "e", "f", "g"],
      heroVariants: ["x", "y", "z", "w", "v"],
      ctaVariants: ["1", "2", "3", "4"],
    });
    const wet: WetwareCalibrationSnapshot = {
      at: new Date().toISOString(),
      synapses: [
        { armId: "published", weight: 50, lastOutcome: "neutral", plasticity: 1, updates: 2 },
        { armId: "draft", weight: 50, lastOutcome: "neutral", plasticity: 1, updates: 2 },
      ],
      learningRate: 0.1,
      calibrated: true,
      totalOutcomes: 10,
    };
    json = mergeWetwareCalibration(json, wet);
    json = mergeCorticalOrganoidMesh(json, "cafe", [
      { storeSlug: "peer-b", synapses: wet.synapses },
      { storeSlug: "peer-c", synapses: wet.synapses },
    ]).json;
    json = mergeHippocampalOrganoidMesh(json).json;
    json = mergePrefrontalOrganoidMesh(json).json;

    const r = assignArmOrganoidKernel({
      storeSlug: "cafe",
      visitorId: "visitor-chain",
      snapshot: snap,
      defaultWeights: { published: 50, draft: 50 },
      themeExperimentJson: json,
    });
    expect(r.armId).toMatch(/published|draft/);
    expect(r.ensembleSize).toBeGreaterThan(1);
  });

  it("bio-neuron path activates above factorial threshold", () => {
    process.env.THEME_EXPERIMENT_BIO_NEURON_ASSIGN = "1";
    const json = seedCompositionalExperiment({
      previousRaw: null,
      headerVariants: ["a", "b", "c", "d", "e", "f", "g"],
      heroVariants: ["x", "y", "z", "w", "v"],
      ctaVariants: ["1", "2", "3", "4"],
    });
    const r = assignArmBioNeuronKernel({
      storeSlug: "cafe",
      visitorId: "v-bio",
      snapshot: snap,
      defaultWeights: { published: 50, draft: 50 },
      themeExperimentJson: json,
    });
    expect(r.armId).toBeTruthy();
    expect(r.source).toBe("bio_neuron");
  });
});
