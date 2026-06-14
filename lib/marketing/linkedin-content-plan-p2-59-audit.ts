import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LINKEDIN_FOUNDER_POSTS_PER_WEEK,
} from "@/lib/marketing/linkedin-content-plan-p2-59-content";
import {
  LINKEDIN_CONTENT_PLAN_P2_59_DOC,
  LINKEDIN_CONTENT_PLAN_P2_59_HONESTY_MARKERS,
  LINKEDIN_CONTENT_PLAN_P2_59_POLICY_ID,
  LINKEDIN_CONTENT_PLAN_P2_59_POSTS_PER_WEEK,
  LINKEDIN_CONTENT_PLAN_P2_59_WEEKDAY_SLOTS,
  LINKEDIN_CONTENT_PLAN_P2_59_WIRING_PATHS,
} from "@/lib/marketing/linkedin-content-plan-p2-59-policy";

export type LinkedInContentPlanP259AuditSummary = {
  policyId: typeof LINKEDIN_CONTENT_PLAN_P2_59_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  threePostsPerWeekOk: boolean;
  founderLedOk: boolean;
  weekdaySlotsOk: boolean;
  utmDisciplineOk: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditLinkedInContentPlanP259(
  root = process.cwd(),
): LinkedInContentPlanP259AuditSummary {
  const wiringComplete = LINKEDIN_CONTENT_PLAN_P2_59_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let founderLedOk = false;
  let utmDisciplineOk = false;
  let honestyMarkersPresent = false;

  if (existsSync(join(root, LINKEDIN_CONTENT_PLAN_P2_59_DOC))) {
    const source = readFileSync(join(root, LINKEDIN_CONTENT_PLAN_P2_59_DOC), "utf8");
    docWired =
      source.includes(LINKEDIN_CONTENT_PLAN_P2_59_POLICY_ID) &&
      source.includes("3 posts") &&
      source.toLowerCase().includes("founder");
    founderLedOk =
      source.toLowerCase().includes("founder-led") &&
      source.includes("Monday") &&
      source.includes("Wednesday") &&
      source.includes("Friday");
    utmDisciplineOk =
      source.includes("utm_source=linkedin") && source.includes("utm_campaign");
    honestyMarkersPresent = LINKEDIN_CONTENT_PLAN_P2_59_HONESTY_MARKERS.every((marker) =>
      source.toLowerCase().includes(marker.toLowerCase()),
    );
  }

  const threePostsPerWeekOk =
    LINKEDIN_CONTENT_PLAN_P2_59_POSTS_PER_WEEK === 3 &&
    LINKEDIN_FOUNDER_POSTS_PER_WEEK.length === 3;

  const weekdaySlotsOk = LINKEDIN_CONTENT_PLAN_P2_59_WEEKDAY_SLOTS.every((day) =>
    LINKEDIN_FOUNDER_POSTS_PER_WEEK.some((post) => post.weekday === day),
  );

  const passed =
    wiringComplete &&
    docWired &&
    threePostsPerWeekOk &&
    founderLedOk &&
    weekdaySlotsOk &&
    utmDisciplineOk &&
    honestyMarkersPresent;

  return {
    policyId: LINKEDIN_CONTENT_PLAN_P2_59_POLICY_ID,
    wiringComplete,
    docWired,
    threePostsPerWeekOk,
    founderLedOk,
    weekdaySlotsOk,
    utmDisciplineOk,
    honestyMarkersPresent,
    passed,
  };
}

export function formatLinkedInContentPlanP259AuditLines(
  summary: LinkedInContentPlanP259AuditSummary,
): string[] {
  return [
    `LinkedIn content plan (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `3 posts/week: ${summary.threePostsPerWeekOk ? "yes" : "no"}`,
    `Founder-led: ${summary.founderLedOk ? "yes" : "no"}`,
    `Mon/Wed/Fri slots: ${summary.weekdaySlotsOk ? "yes" : "no"}`,
    `UTM discipline: ${summary.utmDisciplineOk ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
