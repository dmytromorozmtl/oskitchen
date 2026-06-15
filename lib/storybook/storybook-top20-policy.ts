/**
 * Absolute Final Task 65 — Storybook stories for design system top 20 components.
 *
 * @see stories/top20/*.stories.tsx
 * @see docs/storybook-top20-setup.md
 */

import {
  DESIGN_SYSTEM_TOP_20_COMPONENTS,
  DESIGN_SYSTEM_DOCUMENTATION_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/design/design-system-documentation-absolute-final-policy";

export const STORYBOOK_TOP20_POLICY_ID = "storybook-top20-absolute-final-v1" as const;

export const STORYBOOK_TOP20_UPSTREAM_POLICY_ID =
  DESIGN_SYSTEM_DOCUMENTATION_ABSOLUTE_FINAL_POLICY_ID;

export const STORYBOOK_TOP20_STORIES_DIR = "stories/top20" as const;

export const STORYBOOK_TOP20_CONFIG_DIR = ".storybook" as const;

export const STORYBOOK_TOP20_SETUP_DOC = "docs/storybook-top20-setup.md" as const;

export const STORYBOOK_TOP20_STORY_SUFFIX = ".stories.tsx" as const;

export const STORYBOOK_TOP20_STORY_PATHS = DESIGN_SYSTEM_TOP_20_COMPONENTS.map(
  (component) => `${STORYBOOK_TOP20_STORIES_DIR}/${component.id}${STORYBOOK_TOP20_STORY_SUFFIX}`,
) as readonly string[];

export const STORYBOOK_TOP20_WIRING_PATHS = [
  STORYBOOK_TOP20_SETUP_DOC,
  `${STORYBOOK_TOP20_CONFIG_DIR}/main.ts`,
  `${STORYBOOK_TOP20_CONFIG_DIR}/preview.ts`,
  "lib/storybook/storybook-top20-policy.ts",
  "lib/storybook/storybook-top20-audit.ts",
  "lib/storybook/csf-types.ts",
  "tests/unit/storybook-top20.test.ts",
  ...STORYBOOK_TOP20_STORY_PATHS,
] as const;

export const STORYBOOK_TOP20_UNIT_TEST = "tests/unit/storybook-top20.test.ts" as const;

export const STORYBOOK_TOP20_CI_SCRIPTS = [
  "test:ci:storybook-top20",
  "test:ci:storybook-top20:cert",
] as const;

export const STORYBOOK_TOP20_NPM_SCRIPTS = ["storybook", "build-storybook"] as const;

export const STORYBOOK_TOP20_COMPONENTS = DESIGN_SYSTEM_TOP_20_COMPONENTS;
