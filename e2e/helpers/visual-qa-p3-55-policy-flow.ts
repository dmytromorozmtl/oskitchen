import { expect } from "@playwright/test";

import {
  VISUAL_QA_P3_55_SURFACE_COUNT,
  VISUAL_QA_P3_55_SURFACES,
  type VisualQaSurfaceId,
} from "@/lib/qa/visual-qa-p3-55-policy";
import {
  buildVisualQaSurfaceStatuses,
  validateVisualQaContract,
} from "@/lib/qa/visual-qa-p3-55-measurement";

export function runVisualQaContractStep(): {
  contractValid: boolean;
  surfaceCount: number;
  surfaces: VisualQaSurfaceId[];
} {
  const result = validateVisualQaContract();
  expect(result.errors, "Visual QA contract should be valid").toEqual([]);
  return {
    contractValid: result.passed,
    surfaceCount: result.surfaceCount,
    surfaces: VISUAL_QA_P3_55_SURFACES.map((surface) => surface.id),
  };
}

export function listVisualQaSurfaces(): VisualQaSurfaceId[] {
  return VISUAL_QA_P3_55_SURFACES.map((surface) => surface.id);
}

export function runVisualQaPolicyFlow(): {
  contractValid: boolean;
  surfaceCount: number;
  surfaces: VisualQaSurfaceId[];
} {
  const contract = runVisualQaContractStep();
  for (const status of buildVisualQaSurfaceStatuses()) {
    expect(status.fixturePresent, `${status.surfaceId} fixture`).toBe(true);
    expect(status.shellPresent, `${status.surfaceId} shell`).toBe(true);
  }
  return contract;
}

export function visualQaSurfaceCount(): number {
  return VISUAL_QA_P3_55_SURFACE_COUNT;
}
