/**
 * Blueprint P3-57 — Storybook stories for top-20 design system components.
 *
 * @see stories/top20/*.stories.tsx
 * @see docs/storybook-top20-p3-57.md
 */

import {
  DESIGN_SYSTEM_TOP_20_COMPONENTS,
} from "@/lib/design/design-system-documentation-absolute-final-policy";
import { STORYBOOK_TOP20_TITLE_PREFIX } from "@/lib/storybook/csf-types";

export const STORYBOOK_TOP20_P3_57_POLICY_ID = "storybook-top20-p3-57-v1" as const;

export const STORYBOOK_TOP20_P3_57_DOC = "docs/storybook-top20-p3-57.md" as const;

export const STORYBOOK_TOP20_P3_57_SETUP_DOC = "docs/storybook-top20-setup.md" as const;

export const STORYBOOK_TOP20_P3_57_ARTIFACT =
  "artifacts/storybook-top20-p3-57-registry.json" as const;

export const STORYBOOK_TOP20_P3_57_AUDIT_SCRIPT =
  "scripts/audit-storybook-top20-p3-57.ts" as const;

export const STORYBOOK_TOP20_P3_57_NPM_SCRIPT = "audit:storybook-top20-p3-57" as const;

export const STORYBOOK_TOP20_P3_57_CHECK_NPM_SCRIPT = "check:storybook-top20-p3-57" as const;

export const STORYBOOK_TOP20_P3_57_UNIT_TEST =
  "tests/unit/storybook-top20-p3-57.test.ts" as const;

export const STORYBOOK_TOP20_P3_57_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const STORYBOOK_TOP20_P3_57_COMPONENT_COUNT = 20 as const;

export const STORYBOOK_TOP20_P3_57_STORIES_DIR = "stories/top20" as const;

export const STORYBOOK_TOP20_P3_57_STORY_SUFFIX = ".stories.tsx" as const;

export const STORYBOOK_TOP20_P3_57_TITLE_PREFIX = STORYBOOK_TOP20_TITLE_PREFIX;

export const STORYBOOK_TOP20_P3_57_COMPONENTS = DESIGN_SYSTEM_TOP_20_COMPONENTS;

export const STORYBOOK_TOP20_P3_57_STORY_PATHS = DESIGN_SYSTEM_TOP_20_COMPONENTS.map(
  (component) =>
    `${STORYBOOK_TOP20_P3_57_STORIES_DIR}/${component.id}${STORYBOOK_TOP20_P3_57_STORY_SUFFIX}`,
) as readonly string[];

export const STORYBOOK_TOP20_P3_57_NPM_SCRIPTS = [
  "storybook",
  "build-storybook",
  "test:ci:storybook-top20",
  "test:ci:storybook-top20:cert",
] as const;

export const STORYBOOK_TOP20_P3_57_WIRING_PATHS = [
  STORYBOOK_TOP20_P3_57_DOC,
  STORYBOOK_TOP20_P3_57_SETUP_DOC,
  ".storybook/main.ts",
  ".storybook/preview.ts",
  "lib/storybook/storybook-top20-policy.ts",
  "lib/storybook/storybook-top20-audit.ts",
  "lib/storybook/csf-types.ts",
  "stories/top20/_story-meta.ts",
  "lib/qa/storybook-top20-p3-57-measurement.ts",
  "lib/qa/storybook-top20-p3-57-audit.ts",
  STORYBOOK_TOP20_P3_57_UNIT_TEST,
  STORYBOOK_TOP20_P3_57_ARTIFACT,
  ...STORYBOOK_TOP20_P3_57_STORY_PATHS,
] as const;

export function storybookTop20ComponentIds(): string[] {
  return STORYBOOK_TOP20_P3_57_COMPONENTS.map((component) => component.id);
}
