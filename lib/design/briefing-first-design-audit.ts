import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BRIEFING_FIRST_DESIGN_POLICY_ID,
  BRIEFING_FIRST_HERO_MODULE,
  BRIEFING_FIRST_NARRATIVE_MODULE,
  BRIEFING_FIRST_NARRATIVE_TEST_ID,
  BRIEFING_FIRST_REQUIRED_SEGMENTS,
} from "@/lib/design/briefing-first-design-policy";

export type BriefingFirstDesignAuditSummary = {
  policyId: typeof BRIEFING_FIRST_DESIGN_POLICY_ID;
  heroModulePresent: boolean;
  narrativeModulePresent: boolean;
  narrativeBuilderWired: boolean;
  narrativeStripWired: boolean;
  narrativeTokensWired: boolean;
  passed: boolean;
};

export function auditBriefingFirstDesign(
  root = process.cwd(),
): BriefingFirstDesignAuditSummary {
  const heroPath = join(root, BRIEFING_FIRST_HERO_MODULE);
  const narrativePath = join(root, BRIEFING_FIRST_NARRATIVE_MODULE);

  const heroModulePresent = existsSync(heroPath);
  const narrativeModulePresent = existsSync(narrativePath);

  let narrativeBuilderWired = false;
  let narrativeStripWired = false;
  let narrativeTokensWired = false;

  if (narrativeModulePresent) {
    const source = readFileSync(narrativePath, "utf8");
    narrativeBuilderWired =
      source.includes("buildBriefingFirstNarrative") &&
      source.includes("performance") &&
      source.includes("insight") &&
      source.includes("Next:");
  }

  if (heroModulePresent) {
    const source = readFileSync(heroPath, "utf8");
    narrativeStripWired =
      source.includes("briefingNarrative.formatted") &&
      source.includes("BRIEFING_FIRST_NARRATIVE_TEST_ID");
    narrativeTokensWired =
      source.includes("BRIEFING_FIRST_NARRATIVE_WRAPPER_CLASS") &&
      source.includes("BRIEFING_FIRST_NARRATIVE_CLASS");
  }

  const passed =
    heroModulePresent &&
    narrativeModulePresent &&
    narrativeBuilderWired &&
    narrativeStripWired &&
    narrativeTokensWired &&
    BRIEFING_FIRST_REQUIRED_SEGMENTS.length === 3;

  return {
    policyId: BRIEFING_FIRST_DESIGN_POLICY_ID,
    heroModulePresent,
    narrativeModulePresent,
    narrativeBuilderWired,
    narrativeStripWired,
    narrativeTokensWired,
    passed,
  };
}

export function formatBriefingFirstDesignAuditLines(
  summary: BriefingFirstDesignAuditSummary,
): string[] {
  return [
    `Briefing-first design audit (${summary.policyId})`,
    `Hero module: ${summary.heroModulePresent ? "present" : "missing"} (${BRIEFING_FIRST_HERO_MODULE})`,
    `Narrative builder: ${summary.narrativeModulePresent ? "present" : "missing"} (${BRIEFING_FIRST_NARRATIVE_MODULE})`,
    `Narrative builder wired: ${summary.narrativeBuilderWired ? "yes" : "no"}`,
    `Narrative strip (${BRIEFING_FIRST_NARRATIVE_TEST_ID}): ${summary.narrativeStripWired ? "yes" : "no"}`,
    `Design tokens: ${summary.narrativeTokensWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
