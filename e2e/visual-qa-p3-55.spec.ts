import { expect, test } from "@playwright/test";

import {
  VISUAL_QA_P3_55_FLOW_STEPS,
  VISUAL_QA_P3_55_POLICY_ID,
  VISUAL_QA_P3_55_SURFACE_COUNT,
  VISUAL_QA_P3_55_SURFACES,
  visualQaSurfaceIds,
} from "@/lib/qa/visual-qa-p3-55-policy";
import {
  buildVisualQaSurfaceStatuses,
  validateVisualQaContract,
} from "@/lib/qa/visual-qa-p3-55-measurement";

import {
  listVisualQaSurfaces,
  runVisualQaContractStep,
  runVisualQaPolicyFlow,
  visualQaSurfaceCount,
} from "./helpers/visual-qa-p3-55-policy-flow";

/**
 * Visual QA — POS tablet, KDS kitchen screen, mobile Today.
 *
 * @see tests/visual/visual-qa-p3-55.spec.ts
 * @see docs/visual-qa-p3-55.md
 */

test.describe("visual qa p3-55 policy", () => {
  test("exports three operator surfaces with viewports", () => {
    expect(VISUAL_QA_P3_55_POLICY_ID).toBe("visual-qa-p3-55-v1");
    expect(visualQaSurfaceIds()).toHaveLength(VISUAL_QA_P3_55_SURFACE_COUNT);
    expect(visualQaSurfaceCount()).toBe(3);
    expect(VISUAL_QA_P3_55_SURFACES.map((surface) => surface.id)).toEqual([
      "pos_tablet",
      "kds_kitchen",
      "mobile_today",
    ]);
    expect(validateVisualQaContract().passed).toBe(true);
  });

  test("mobile today uses narrow viewport", () => {
    const mobile = VISUAL_QA_P3_55_SURFACES.find((surface) => surface.id === "mobile_today");
    expect(mobile?.viewport.width).toBeLessThanOrEqual(480);
    expect(mobile?.testId).toBe("visual-mobile-today");
  });

  test("pos tablet and kds kitchen use landscape tablet viewports", () => {
    const pos = VISUAL_QA_P3_55_SURFACES.find((surface) => surface.id === "pos_tablet");
    const kds = VISUAL_QA_P3_55_SURFACES.find((surface) => surface.id === "kds_kitchen");
    expect(pos?.viewport.width).toBeGreaterThanOrEqual(1024);
    expect(kds?.viewport.width).toBeGreaterThanOrEqual(1280);
  });

  test("each surface fixture and shell exist on disk", () => {
    for (const status of buildVisualQaSurfaceStatuses()) {
      expect(status.fixturePresent, `${status.surfaceId} fixture`).toBe(true);
      expect(status.shellPresent, `${status.surfaceId} shell`).toBe(true);
    }
  });
});

test.describe("visual qa contract step", () => {
  test("validates three-surface visual QA contract", () => {
    const result = runVisualQaContractStep();
    expect(result.contractValid).toBe(true);
    expect(result.surfaceCount).toBe(3);
    expect(result.surfaces).toEqual(listVisualQaSurfaces());
  });
});

test.describe("visual qa orchestrator", () => {
  test("lists capture flow steps for all surfaces", () => {
    const result = runVisualQaPolicyFlow();
    expect(result.contractValid).toBe(true);
    expect(result.surfaceCount).toBe(3);
    expect(VISUAL_QA_P3_55_FLOW_STEPS).toEqual([
      "validate_visual_qa_contract",
      "capture_pos_tablet",
      "capture_kds_kitchen",
      "capture_mobile_today",
    ]);
  });
});
