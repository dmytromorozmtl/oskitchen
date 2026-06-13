import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FOUNDER_STORY_BLOG_P3_68_DOC,
  FOUNDER_STORY_BLOG_P3_68_NPM_SCRIPTS,
  FOUNDER_STORY_BLOG_P3_68_PATH,
  FOUNDER_STORY_BLOG_P3_68_POLICY_ID,
  FOUNDER_STORY_BLOG_P3_68_UPSTREAM_DOC,
  FOUNDER_STORY_BLOG_P3_68_UPSTREAM_POLICY_ID,
  FOUNDER_STORY_BLOG_P3_68_WIRING_PATHS,
} from "@/lib/marketing/founder-story-blog-p3-68-policy";
import { validateFounderStoryBlogContract } from "@/lib/marketing/founder-story-blog-p3-68-measurement";

export type FounderStoryBlogP3_68AuditSummary = {
  policyId: typeof FOUNDER_STORY_BLOG_P3_68_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  upstreamPolicyAligned: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditFounderStoryBlogP3_68(
  root = process.cwd(),
): FounderStoryBlogP3_68AuditSummary {
  const wiringComplete = FOUNDER_STORY_BLOG_P3_68_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, FOUNDER_STORY_BLOG_P3_68_DOC))) {
    const source = readFileSync(join(root, FOUNDER_STORY_BLOG_P3_68_DOC), "utf8");
    docWired =
      source.includes(FOUNDER_STORY_BLOG_P3_68_POLICY_ID) &&
      source.includes(FOUNDER_STORY_BLOG_P3_68_UPSTREAM_DOC) &&
      source.includes(FOUNDER_STORY_BLOG_P3_68_PATH) &&
      source.includes(FOUNDER_STORY_BLOG_P3_68_UPSTREAM_POLICY_ID);
  }

  const contract = validateFounderStoryBlogContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = FOUNDER_STORY_BLOG_P3_68_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed = wiringComplete && docWired && contract.passed && npmScriptsWired;

  return {
    policyId: FOUNDER_STORY_BLOG_P3_68_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    upstreamPolicyAligned: contract.upstreamDocOk,
    npmScriptsWired,
    passed,
  };
}

export function formatFounderStoryBlogP3_68AuditLines(
  summary: FounderStoryBlogP3_68AuditSummary,
): string[] {
  return [
    `Founder story blog audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${FOUNDER_STORY_BLOG_P3_68_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Upstream founding-customer-story: ${summary.upstreamPolicyAligned ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
