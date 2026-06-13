import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditStorybookTop20Wiring } from "@/lib/storybook/storybook-top20-audit";
import {
  STORYBOOK_TOP20_P3_57_COMPONENT_COUNT,
  STORYBOOK_TOP20_P3_57_COMPONENTS,
  STORYBOOK_TOP20_P3_57_STORY_PATHS,
  STORYBOOK_TOP20_P3_57_TITLE_PREFIX,
} from "@/lib/qa/storybook-top20-p3-57-policy";

export type StorybookTop20StoryStatus = {
  id: string;
  storyPath: string;
  componentPath: string;
  storyPresent: boolean;
  componentPresent: boolean;
  hasDefaultExport: boolean;
  hasTitlePrefix: boolean;
};

export type StorybookTop20ContractValidation = {
  passed: boolean;
  componentCount: number;
  storiesPresent: number;
  upstreamAuditOk: boolean;
  failures: string[];
};

export function buildStorybookTop20StoryStatuses(root = process.cwd()): StorybookTop20StoryStatus[] {
  return STORYBOOK_TOP20_P3_57_COMPONENTS.map((component, index) => {
    const storyPath = STORYBOOK_TOP20_P3_57_STORY_PATHS[index]!;
    const storyPresent = existsSync(join(root, storyPath));
    const componentPresent = existsSync(join(root, component.path));

    let hasDefaultExport = false;
    let hasTitlePrefix = false;

    if (storyPresent) {
      const source = readFileSync(join(root, storyPath), "utf8");
      hasDefaultExport = source.includes("export default");
      hasTitlePrefix =
        source.includes(STORYBOOK_TOP20_P3_57_TITLE_PREFIX) ||
        source.includes("top20StoryMeta");
    }

    return {
      id: component.id,
      storyPath,
      componentPath: component.path,
      storyPresent,
      componentPresent,
      hasDefaultExport,
      hasTitlePrefix,
    };
  });
}

export function validateStorybookTop20Contract(root = process.cwd()): StorybookTop20ContractValidation {
  const statuses = buildStorybookTop20StoryStatuses(root);
  const failures: string[] = [];

  for (const status of statuses) {
    if (!status.storyPresent) failures.push(`missing story: ${status.storyPath}`);
    if (!status.componentPresent) failures.push(`missing component: ${status.componentPath}`);
    if (!status.hasDefaultExport) failures.push(`${status.storyPath} missing default export`);
    if (!status.hasTitlePrefix) failures.push(`${status.storyPath} missing title prefix`);
  }

  const upstream = auditStorybookTop20Wiring(root);
  if (!upstream.ok) {
    failures.push(...upstream.failures);
  }

  const storiesPresent = statuses.filter((status) => status.storyPresent).length;

  return {
    passed:
      failures.length === 0 &&
      storiesPresent === STORYBOOK_TOP20_P3_57_COMPONENT_COUNT &&
      upstream.ok,
    componentCount: STORYBOOK_TOP20_P3_57_COMPONENT_COUNT,
    storiesPresent,
    upstreamAuditOk: upstream.ok,
    failures,
  };
}
