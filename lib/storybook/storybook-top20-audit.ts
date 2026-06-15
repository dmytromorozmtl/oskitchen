import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { STORYBOOK_TOP20_TITLE_PREFIX } from "@/lib/storybook/csf-types";
import {
  STORYBOOK_TOP20_COMPONENTS,
  STORYBOOK_TOP20_SETUP_DOC,
  STORYBOOK_TOP20_STORY_PATHS,
  STORYBOOK_TOP20_WIRING_PATHS,
} from "@/lib/storybook/storybook-top20-policy";

export type StorybookTop20Audit = {
  ok: boolean;
  failures: string[];
};

export function auditStorybookTop20Wiring(root = process.cwd()): StorybookTop20Audit {
  const failures: string[] = [];

  for (const rel of STORYBOOK_TOP20_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const setupDoc = readFileSync(join(root, STORYBOOK_TOP20_SETUP_DOC), "utf8");
  if (!setupDoc.includes(STORYBOOK_TOP20_TITLE_PREFIX)) {
    failures.push("storybook-top20-setup.md missing title prefix");
  }

  for (let i = 0; i < STORYBOOK_TOP20_STORY_PATHS.length; i++) {
    const rel = STORYBOOK_TOP20_STORY_PATHS[i]!;
    const component = STORYBOOK_TOP20_COMPONENTS[i]!;
    const source = readFileSync(join(root, rel), "utf8");

    if (!source.includes("export default")) {
      failures.push(`${rel} missing default meta export`);
    }
    if (!source.includes(STORYBOOK_TOP20_TITLE_PREFIX) && !source.includes("top20StoryMeta")) {
      failures.push(`${rel} missing top-20 title prefix`);
    }
    if (!source.includes(component.path.replace(/\//g, "/"))) {
      const importPath = `@/${component.path.replace(/\.tsx$/, "")}`;
      if (!source.includes(importPath)) {
        failures.push(`${rel} missing import from ${component.path}`);
      }
    }
  }

  return { ok: failures.length === 0, failures };
}
