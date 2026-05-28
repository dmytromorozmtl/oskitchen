import { describe, expect, it } from "vitest";

import { SUSTAINED_OPERATIONAL_EXCELLENCE_TRACKED_ENV_KEYS } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import {
  evaluateSustainedOperationalExcellenceEnv,
  readSustainedOperationalExcellenceArtifacts,
} from "../../scripts/ops/validate-sustained-operational-excellence-env";

describe("validate-sustained-operational-excellence-env", () => {
  it("reads artifacts without throwing when paths resolve", () => {
    expect(() => readSustainedOperationalExcellenceArtifacts()).not.toThrow();
  });

  it("tracks four SUSTAINED_OPS_* env keys", () => {
    expect(SUSTAINED_OPERATIONAL_EXCELLENCE_TRACKED_ENV_KEYS).toHaveLength(4);
    expect(SUSTAINED_OPERATIONAL_EXCELLENCE_TRACKED_ENV_KEYS.every((key) => key.startsWith("SUSTAINED_OPS_"))).toBe(
      true,
    );
  });

  it("reports honest NO-GO when prerequisites are incomplete", () => {
    const result = evaluateSustainedOperationalExcellenceEnv({});
    expect(result.phases).toHaveLength(4);
    expect(result.missing).toEqual(SUSTAINED_OPERATIONAL_EXCELLENCE_TRACKED_ENV_KEYS);
    expect(result.sustainedOpsComplete).toBe(false);
    expect(result.prerequisites.prerequisitesComplete).toBe(false);
  });

  it("does not mark sustained ops complete without all cadences attested", () => {
    const env = Object.fromEntries(
      SUSTAINED_OPERATIONAL_EXCELLENCE_TRACKED_ENV_KEYS.map((key) => [key, "1"]),
    ) as NodeJS.ProcessEnv;
    const result = evaluateSustainedOperationalExcellenceEnv(env);
    expect(result.present).toHaveLength(4);
    expect(result.sustainedOpsComplete).toBe(false);
  });
});
