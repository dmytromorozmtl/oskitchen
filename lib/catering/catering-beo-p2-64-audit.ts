import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildCateringBeoFormatCorpusP264 } from "@/lib/catering/catering-beo-p2-64-corpus";
import {
  CATERING_BEO_FORMAT_P2_64_ARTIFACT,
  CATERING_BEO_FORMAT_P2_64_BUILDER,
  CATERING_BEO_FORMAT_P2_64_COMPONENT,
  CATERING_BEO_FORMAT_P2_64_DOCUMENT_TEST_ID,
  CATERING_BEO_FORMAT_P2_64_DOC,
  CATERING_BEO_FORMAT_P2_64_LAYOUT_TEST_ID,
  CATERING_BEO_FORMAT_P2_64_MENU_TEST_ID,
  CATERING_BEO_FORMAT_P2_64_PAGE,
  CATERING_BEO_FORMAT_P2_64_POLICY_ID,
  CATERING_BEO_FORMAT_P2_64_QUOTE_DETAIL,
  CATERING_BEO_FORMAT_P2_64_SCENARIO_COUNT,
  CATERING_BEO_FORMAT_P2_64_SERVICE,
  CATERING_BEO_FORMAT_P2_64_TIMELINE_TEST_ID,
  CATERING_BEO_FORMAT_P2_64_TRIPLESEAT_PARITY_NOTE,
  CATERING_BEO_FORMAT_P2_64_WIRING_PATHS,
} from "@/lib/catering/catering-beo-p2-64-policy";
import { runCateringBeoFormatBenchmarkP264 } from "@/lib/catering/catering-beo-p2-64-scoring";

export type CateringBeoFormatP264AuditSummary = {
  policyId: typeof CATERING_BEO_FORMAT_P2_64_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  builderWired: boolean;
  serviceWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  quoteDetailWired: boolean;
  corpusLoaded: boolean;
  scoringPassed: boolean;
  sectionCompletenessPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditCateringBeoFormatP264(root = process.cwd()): CateringBeoFormatP264AuditSummary {
  const wiringComplete = CATERING_BEO_FORMAT_P2_64_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, CATERING_BEO_FORMAT_P2_64_DOC))) {
    const source = readFileSync(join(root, CATERING_BEO_FORMAT_P2_64_DOC), "utf8");
    docWired =
      source.includes(CATERING_BEO_FORMAT_P2_64_POLICY_ID) &&
      source.includes("Tripleseat") &&
      source.includes(String(CATERING_BEO_FORMAT_P2_64_SCENARIO_COUNT));
  }

  let builderWired = false;
  if (existsSync(join(root, CATERING_BEO_FORMAT_P2_64_BUILDER))) {
    const source = readFileSync(join(root, CATERING_BEO_FORMAT_P2_64_BUILDER), "utf8");
    builderWired =
      source.includes("buildCateringBeoFromQuote") &&
      source.includes("buildMenuSections") &&
      source.includes("buildTimeline");
  }

  let serviceWired = false;
  if (existsSync(join(root, CATERING_BEO_FORMAT_P2_64_SERVICE))) {
    const source = readFileSync(join(root, CATERING_BEO_FORMAT_P2_64_SERVICE), "utf8");
    serviceWired = source.includes("buildCateringBeoForQuote");
  }

  let componentWired = false;
  if (existsSync(join(root, CATERING_BEO_FORMAT_P2_64_COMPONENT))) {
    const source = readFileSync(join(root, CATERING_BEO_FORMAT_P2_64_COMPONENT), "utf8");
    componentWired =
      source.includes(CATERING_BEO_FORMAT_P2_64_DOCUMENT_TEST_ID) &&
      source.includes(CATERING_BEO_FORMAT_P2_64_LAYOUT_TEST_ID) &&
      source.includes(CATERING_BEO_FORMAT_P2_64_MENU_TEST_ID) &&
      source.includes(CATERING_BEO_FORMAT_P2_64_TIMELINE_TEST_ID);
  }

  let pageWired = false;
  if (existsSync(join(root, CATERING_BEO_FORMAT_P2_64_PAGE))) {
    const source = readFileSync(join(root, CATERING_BEO_FORMAT_P2_64_PAGE), "utf8");
    pageWired = source.includes("CateringBeoDocument");
  }

  let quoteDetailWired = false;
  if (existsSync(join(root, CATERING_BEO_FORMAT_P2_64_QUOTE_DETAIL))) {
    const source = readFileSync(join(root, CATERING_BEO_FORMAT_P2_64_QUOTE_DETAIL), "utf8");
    quoteDetailWired = source.includes("/beo") || source.includes("Banquet Event Order");
  }

  const corpus = buildCateringBeoFormatCorpusP264();
  const result = runCateringBeoFormatBenchmarkP264(corpus);
  const artifactPresent = existsSync(join(root, CATERING_BEO_FORMAT_P2_64_ARTIFACT));

  const passed =
    wiringComplete &&
    docWired &&
    builderWired &&
    serviceWired &&
    componentWired &&
    pageWired &&
    quoteDetailWired &&
    corpus.length === CATERING_BEO_FORMAT_P2_64_SCENARIO_COUNT &&
    result.passed &&
    artifactPresent;

  return {
    policyId: CATERING_BEO_FORMAT_P2_64_POLICY_ID,
    wiringComplete,
    docWired,
    builderWired,
    serviceWired,
    componentWired,
    pageWired,
    quoteDetailWired,
    corpusLoaded: corpus.length === CATERING_BEO_FORMAT_P2_64_SCENARIO_COUNT,
    scoringPassed: result.passed,
    sectionCompletenessPct: result.sectionCompletenessPct,
    artifactPresent,
    passed,
  };
}

export function formatCateringBeoFormatP264AuditLines(
  summary: CateringBeoFormatP264AuditSummary,
): string[] {
  return [
    `Catering BEO format (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Builder: ${summary.builderWired ? "wired" : "missing"}`,
    `Service: ${summary.serviceWired ? "wired" : "missing"}`,
    `Component: ${summary.componentWired ? "wired" : "missing"}`,
    `BEO page: ${summary.pageWired ? "yes" : "no"}`,
    `Quote detail link: ${summary.quoteDetailWired ? "yes" : "no"}`,
    `Corpus: ${summary.corpusLoaded ? "yes" : "no"} (${CATERING_BEO_FORMAT_P2_64_SCENARIO_COUNT} scenarios)`,
    `Section completeness: ${summary.sectionCompletenessPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Tripleseat parity: ${CATERING_BEO_FORMAT_P2_64_TRIPLESEAT_PARITY_NOTE}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
