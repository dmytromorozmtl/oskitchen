import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  CONSUMER_APP_DEFERRAL_P3_92_ALTERNATIVES,
  CONSUMER_APP_DEFERRAL_P3_92_BANNED_PHRASES,
  CONSUMER_APP_DEFERRAL_P3_92_PUBLIC_LINE,
  CONSUMER_APP_DEFERRAL_P3_92_SCAN_EXCLUDE_FILES,
  CONSUMER_APP_DEFERRAL_P3_92_SCAN_PATHS,
} from "@/lib/marketing/consumer-app-deferral-p3-92-content";
import {
  CONSUMER_APP_DEFERRAL_P3_92_CUSTOMER_THRESHOLD,
  CONSUMER_APP_DEFERRAL_P3_92_DOC,
  CONSUMER_APP_DEFERRAL_P3_92_POLICY_ID,
  CONSUMER_APP_DEFERRAL_P3_92_ROADMAP_ITEM_ID,
  CONSUMER_APP_DEFERRAL_P3_92_UPSTREAM_PRODUCT_ROADMAP,
  CONSUMER_APP_DEFERRAL_P3_92_UPSTREAM_ROADMAP,
  CONSUMER_APP_DEFERRAL_P3_92_WIRING_PATHS,
} from "@/lib/marketing/consumer-app-deferral-p3-92-policy";

export type ConsumerAppDeferralP392AuditSummary = {
  policyId: typeof CONSUMER_APP_DEFERRAL_P3_92_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  roadmapDeferred: boolean;
  productRoadmapDeferred: boolean;
  alternativesDefined: boolean;
  marketingClean: boolean;
  passed: boolean;
  failures: string[];
};

function collectSources(root: string): { label: string; text: string }[] {
  const sources: { label: string; text: string }[] = [];

  for (const rel of CONSUMER_APP_DEFERRAL_P3_92_SCAN_PATHS) {
    const full = join(root, rel);
    if (!existsSync(full)) continue;

    const stat = statSync(full);
    if (stat.isFile()) {
      sources.push({ label: rel, text: readFileSync(full, "utf8") });
      continue;
    }

    const walk = (dir: string, prefix: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const childRel = join(prefix, entry.name);
        const childFull = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(childFull, childRel);
        } else if (/\.(tsx?|md)$/.test(entry.name)) {
          if ((CONSUMER_APP_DEFERRAL_P3_92_SCAN_EXCLUDE_FILES as readonly string[]).includes(childRel)) {
            continue;
          }
          sources.push({ label: childRel, text: readFileSync(childFull, "utf8") });
        }
      }
    };
    walk(full, rel);
  }

  return sources;
}

export function auditConsumerAppDeferralP392(
  root = process.cwd(),
): ConsumerAppDeferralP392AuditSummary {
  const failures: string[] = [];

  const wiringComplete = CONSUMER_APP_DEFERRAL_P3_92_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );
  if (!wiringComplete) failures.push("missing P3-92 wiring paths");

  let docWired = false;
  if (existsSync(join(root, CONSUMER_APP_DEFERRAL_P3_92_DOC))) {
    const doc = readFileSync(join(root, CONSUMER_APP_DEFERRAL_P3_92_DOC), "utf8");
    docWired =
      doc.includes(CONSUMER_APP_DEFERRAL_P3_92_POLICY_ID) &&
      doc.includes(String(CONSUMER_APP_DEFERRAL_P3_92_CUSTOMER_THRESHOLD)) &&
      doc.includes("defer");
  } else {
    failures.push(`missing doc: ${CONSUMER_APP_DEFERRAL_P3_92_DOC}`);
  }

  let roadmapDeferred = false;
  if (existsSync(join(root, CONSUMER_APP_DEFERRAL_P3_92_UPSTREAM_ROADMAP))) {
    const roadmap = readFileSync(join(root, CONSUMER_APP_DEFERRAL_P3_92_UPSTREAM_ROADMAP), "utf8");
    roadmapDeferred =
      roadmap.includes(`id: '${CONSUMER_APP_DEFERRAL_P3_92_ROADMAP_ITEM_ID}'`) &&
      roadmap.includes(String(CONSUMER_APP_DEFERRAL_P3_92_CUSTOMER_THRESHOLD));
  } else {
    failures.push("missing public roadmap content");
  }

  let productRoadmapDeferred = false;
  if (existsSync(join(root, CONSUMER_APP_DEFERRAL_P3_92_UPSTREAM_PRODUCT_ROADMAP))) {
    const product = readFileSync(join(root, CONSUMER_APP_DEFERRAL_P3_92_UPSTREAM_PRODUCT_ROADMAP), "utf8");
    productRoadmapDeferred =
      product.includes("Native consumer app") &&
      product.includes(String(CONSUMER_APP_DEFERRAL_P3_92_CUSTOMER_THRESHOLD));
  }

  const alternativesDefined = CONSUMER_APP_DEFERRAL_P3_92_ALTERNATIVES.length >= 3;

  let marketingClean = true;
  for (const source of collectSources(root)) {
    for (const phrase of CONSUMER_APP_DEFERRAL_P3_92_BANNED_PHRASES) {
      if (source.text.includes(phrase)) {
        marketingClean = false;
        failures.push(`banned phrase "${phrase}" in ${source.label}`);
      }
    }
  }

  const passed =
    failures.length === 0 &&
    wiringComplete &&
    docWired &&
    roadmapDeferred &&
    productRoadmapDeferred &&
    alternativesDefined &&
    marketingClean;

  return {
    policyId: CONSUMER_APP_DEFERRAL_P3_92_POLICY_ID,
    wiringComplete,
    docWired,
    roadmapDeferred,
    productRoadmapDeferred,
    alternativesDefined,
    marketingClean,
    passed,
    failures,
  };
}

export function formatConsumerAppDeferralP392AuditLines(
  summary: ConsumerAppDeferralP392AuditSummary,
): string[] {
  return [
    `Consumer app deferral (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Public /roadmap deferred: ${summary.roadmapDeferred ? "yes" : "no"}`,
    `PRODUCT_ROADMAP deferred: ${summary.productRoadmapDeferred ? "yes" : "no"}`,
    `Alternatives (${CONSUMER_APP_DEFERRAL_P3_92_ALTERNATIVES.length}): ${summary.alternativesDefined ? "yes" : "no"}`,
    `Marketing clean: ${summary.marketingClean ? "yes" : "no"}`,
    `Threshold: ${CONSUMER_APP_DEFERRAL_P3_92_CUSTOMER_THRESHOLD}+ customers`,
    `Public line: ${CONSUMER_APP_DEFERRAL_P3_92_PUBLIC_LINE.slice(0, 60)}…`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
    ...(summary.failures.length > 0 ? [`Failures: ${summary.failures.join("; ")}`] : []),
  ];
}
