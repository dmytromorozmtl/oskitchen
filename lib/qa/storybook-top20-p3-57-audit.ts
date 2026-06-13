import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  STORYBOOK_TOP20_P3_57_COMPONENT_COUNT,
  STORYBOOK_TOP20_P3_57_DOC,
  STORYBOOK_TOP20_P3_57_NPM_SCRIPTS,
  STORYBOOK_TOP20_P3_57_POLICY_ID,
  STORYBOOK_TOP20_P3_57_SETUP_DOC,
  STORYBOOK_TOP20_P3_57_TITLE_PREFIX,
  STORYBOOK_TOP20_P3_57_WIRING_PATHS,
} from "@/lib/qa/storybook-top20-p3-57-policy";
import { validateStorybookTop20Contract } from "@/lib/qa/storybook-top20-p3-57-measurement";

export type StorybookTop20P3_57AuditSummary = {
  policyId: typeof STORYBOOK_TOP20_P3_57_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  setupDocWired: boolean;
  contractValid: boolean;
  twentyStoriesPresent: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditStorybookTop20P3_57(root = process.cwd()): StorybookTop20P3_57AuditSummary {
  const wiringComplete = STORYBOOK_TOP20_P3_57_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, STORYBOOK_TOP20_P3_57_DOC))) {
    const source = readFileSync(join(root, STORYBOOK_TOP20_P3_57_DOC), "utf8");
    docWired =
      source.includes(STORYBOOK_TOP20_P3_57_POLICY_ID) &&
      source.includes(STORYBOOK_TOP20_P3_57_TITLE_PREFIX) &&
      source.includes("npm run storybook");
  }

  let setupDocWired = false;
  if (existsSync(join(root, STORYBOOK_TOP20_P3_57_SETUP_DOC))) {
    const source = readFileSync(join(root, STORYBOOK_TOP20_P3_57_SETUP_DOC), "utf8");
    setupDocWired = source.includes(STORYBOOK_TOP20_P3_57_TITLE_PREFIX);
  }

  const contract = validateStorybookTop20Contract(root);
  const twentyStoriesPresent = contract.storiesPresent === STORYBOOK_TOP20_P3_57_COMPONENT_COUNT;

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = STORYBOOK_TOP20_P3_57_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed =
    wiringComplete &&
    docWired &&
    setupDocWired &&
    contract.passed &&
    twentyStoriesPresent &&
    npmScriptsWired;

  return {
    policyId: STORYBOOK_TOP20_P3_57_POLICY_ID,
    wiringComplete,
    docWired,
    setupDocWired,
    contractValid: contract.passed,
    twentyStoriesPresent,
    npmScriptsWired,
    passed,
  };
}

export function formatStorybookTop20P3_57AuditLines(
  summary: StorybookTop20P3_57AuditSummary,
): string[] {
  return [
    `Storybook top-20 audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${STORYBOOK_TOP20_P3_57_DOC})`,
    `Setup doc: ${summary.setupDocWired ? "yes" : "no"} (${STORYBOOK_TOP20_P3_57_SETUP_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Twenty stories: ${summary.twentyStoriesPresent ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
