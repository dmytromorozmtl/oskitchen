/**
 * Blueprint P3-55 — Visual QA (POS tablet, KDS kitchen screen, mobile Today).
 *
 * @see tests/visual/visual-qa-p3-55.spec.ts
 * @see docs/visual-qa-p3-55.md
 */

export const VISUAL_QA_P3_55_POLICY_ID = "visual-qa-p3-55-v1" as const;

export const VISUAL_QA_P3_55_DOC = "docs/visual-qa-p3-55.md" as const;

export const VISUAL_QA_P3_55_ARTIFACT = "artifacts/visual-qa-p3-55-registry.json" as const;

export const VISUAL_QA_P3_55_SPEC = "e2e/visual-qa-p3-55.spec.ts" as const;

export const VISUAL_QA_P3_55_VISUAL_SPEC = "tests/visual/visual-qa-p3-55.spec.ts" as const;

export const VISUAL_QA_P3_55_FLOW_HELPER = "e2e/helpers/visual-qa-p3-55-policy-flow.ts" as const;

export const VISUAL_QA_P3_55_READY_HELPER = "e2e/helpers/visual-qa-p3-55-ready.ts" as const;

export const VISUAL_QA_P3_55_AUDIT_SCRIPT = "scripts/audit-visual-qa-p3-55.ts" as const;

export const VISUAL_QA_P3_55_NPM_SCRIPT = "audit:visual-qa-p3-55" as const;

export const VISUAL_QA_P3_55_CHECK_NPM_SCRIPT = "check:visual-qa-p3-55" as const;

export const VISUAL_QA_P3_55_VISUAL_NPM_SCRIPT = "test:visual:qa-p3-55" as const;

export const VISUAL_QA_P3_55_UNIT_TEST = "tests/unit/visual-qa-p3-55.test.ts" as const;

export const VISUAL_QA_P3_55_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const VISUAL_QA_P3_55_SURFACE_COUNT = 3 as const;

export const VISUAL_QA_P3_55_FLOW_STEPS = [
  "validate_visual_qa_contract",
  "capture_pos_tablet",
  "capture_kds_kitchen",
  "capture_mobile_today",
] as const;

export type VisualQaViewport = {
  width: number;
  height: number;
};

export type VisualQaSurface = {
  id: "pos_tablet" | "kds_kitchen" | "mobile_today";
  label: string;
  path: string;
  testId: string;
  snapshotStem: string;
  viewport: VisualQaViewport;
  fixturePage: string;
  shellComponent: string;
};

export const VISUAL_QA_P3_55_SURFACES: readonly VisualQaSurface[] = [
  {
    id: "pos_tablet",
    label: "POS tablet",
    path: "/visual-test/pos-tablet",
    testId: "visual-pos-tablet",
    snapshotStem: "pos-tablet",
    viewport: { width: 1024, height: 768 },
    fixturePage: "app/visual-test/pos-tablet/page.tsx",
    shellComponent: "components/dashboard/visual-pos-tablet-shell.tsx",
  },
  {
    id: "kds_kitchen",
    label: "KDS kitchen screen",
    path: "/visual-test/kds-kitchen",
    testId: "visual-kds-kitchen",
    snapshotStem: "kds-kitchen",
    viewport: { width: 1280, height: 800 },
    fixturePage: "app/visual-test/kds-kitchen/page.tsx",
    shellComponent: "components/dashboard/visual-kds-kitchen-shell.tsx",
  },
  {
    id: "mobile_today",
    label: "Mobile Today",
    path: "/visual-test/mobile-today",
    testId: "visual-mobile-today",
    snapshotStem: "mobile-today",
    viewport: { width: 390, height: 844 },
    fixturePage: "app/visual-test/mobile-today/page.tsx",
    shellComponent: "components/dashboard/visual-mobile-today-shell.tsx",
  },
] as const;

export type VisualQaSurfaceId = (typeof VISUAL_QA_P3_55_SURFACES)[number]["id"];

export const VISUAL_QA_P3_55_WIRING_PATHS = [
  VISUAL_QA_P3_55_DOC,
  "lib/qa/visual-qa-p3-55-measurement.ts",
  "lib/qa/visual-qa-p3-55-audit.ts",
  "lib/qa/visual-qa-p3-55-fixtures.ts",
  ...VISUAL_QA_P3_55_SURFACES.flatMap((surface) => [surface.fixturePage, surface.shellComponent]),
  VISUAL_QA_P3_55_VISUAL_SPEC,
  VISUAL_QA_P3_55_SPEC,
  VISUAL_QA_P3_55_FLOW_HELPER,
  "e2e/helpers/visual-qa-p3-55-flow.ts",
  VISUAL_QA_P3_55_READY_HELPER,
  VISUAL_QA_P3_55_UNIT_TEST,
  VISUAL_QA_P3_55_ARTIFACT,
] as const;

export function isVisualQaP3_55Enabled(): boolean {
  return process.env.E2E_VISUAL_QA_P3_55?.trim() === "true";
}

export function visualQaSurfaceIds(): VisualQaSurfaceId[] {
  return VISUAL_QA_P3_55_SURFACES.map((surface) => surface.id);
}

export function visualQaSnapshotName(stem: string): string {
  return `${stem}.png`;
}
