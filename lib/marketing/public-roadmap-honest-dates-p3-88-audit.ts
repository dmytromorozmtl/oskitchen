import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PUBLIC_ROADMAP_P3_88_CANONICAL_PATH,
  PUBLIC_ROADMAP_P3_88_DOC,
  PUBLIC_ROADMAP_P3_88_POLICY_ID,
  PUBLIC_ROADMAP_P3_88_UPSTREAM_P1_25,
  PUBLIC_ROADMAP_P3_88_UPSTREAM_P3_69,
  PUBLIC_ROADMAP_P3_88_WIRING_PATHS,
} from "@/lib/marketing/public-roadmap-honest-dates-p3-88-policy";
import { validatePublicRoadmapHonestDates } from "@/lib/marketing/public-roadmap-honest-dates-p3-88-measurement";

export type PublicRoadmapP388AuditSummary = {
  policyId: typeof PUBLIC_ROADMAP_P3_88_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  upstreamLinked: boolean;
  pageShowsConfidence: boolean;
  contentHonest: boolean;
  passed: boolean;
};

export function auditPublicRoadmapP388(root = process.cwd()): PublicRoadmapP388AuditSummary {
  const wiringComplete = PUBLIC_ROADMAP_P3_88_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, PUBLIC_ROADMAP_P3_88_DOC))) {
    const doc = readFileSync(join(root, PUBLIC_ROADMAP_P3_88_DOC), "utf8");
    docWired =
      doc.includes(PUBLIC_ROADMAP_P3_88_POLICY_ID) &&
      doc.includes(PUBLIC_ROADMAP_P3_88_CANONICAL_PATH) &&
      doc.includes("no undated hardware");
  }

  let upstreamLinked = false;
  if (existsSync(join(root, PUBLIC_ROADMAP_P3_88_UPSTREAM_P3_69))) {
    const p369 = readFileSync(join(root, PUBLIC_ROADMAP_P3_88_UPSTREAM_P3_69), "utf8");
    upstreamLinked =
      p369.includes("P3-88") || p369.includes("public-roadmap-honest-dates-p3-88");
  }

  let pageShowsConfidence = false;
  const pagePath = join(root, "components/marketing/public-roadmap-page.tsx");
  if (existsSync(pagePath)) {
    const page = readFileSync(pagePath, "utf8");
    pageShowsConfidence =
      page.includes("PUBLIC_ROADMAP_CONFIDENCE_LABELS") &&
      page.includes("data-testid=\"public-roadmap-confidence\"");
  }

  const honest = validatePublicRoadmapHonestDates();
  const contentHonest = honest.passed;

  const passed =
    wiringComplete && docWired && upstreamLinked && pageShowsConfidence && contentHonest;

  return {
    policyId: PUBLIC_ROADMAP_P3_88_POLICY_ID,
    wiringComplete,
    docWired,
    upstreamLinked,
    pageShowsConfidence,
    contentHonest,
    passed,
  };
}

export function formatPublicRoadmapP388AuditLines(
  summary: PublicRoadmapP388AuditSummary,
): string[] {
  const honest = validatePublicRoadmapHonestDates();
  return [
    `Public roadmap honest dates (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"} (${PUBLIC_ROADMAP_P3_88_DOC})`,
    `Upstream P3-69 link: ${summary.upstreamLinked ? "yes" : "no"}`,
    `P1-25 upstream: ${PUBLIC_ROADMAP_P3_88_UPSTREAM_P1_25}`,
    `Quarter labels honest: ${honest.quarterLabelsHonest ? "yes" : "no"}`,
    `All items have confidence: ${honest.allItemsHaveConfidence ? "yes" : "no"}`,
    `No hardware in quarters: ${honest.noHardwareInQuarters ? "yes" : "no"}`,
    `Page shows confidence: ${summary.pageShowsConfidence ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
    ...(honest.failures.length > 0 ? [`Failures: ${honest.failures.join("; ")}`] : []),
  ];
}
