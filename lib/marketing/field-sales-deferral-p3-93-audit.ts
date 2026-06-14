import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  FIELD_SALES_DEFERRAL_P3_93_ALTERNATIVES,
  FIELD_SALES_DEFERRAL_P3_93_BANNED_PHRASES,
  FIELD_SALES_DEFERRAL_P3_93_PUBLIC_LINE,
  FIELD_SALES_DEFERRAL_P3_93_SCAN_EXCLUDE_FILES,
  FIELD_SALES_DEFERRAL_P3_93_SCAN_PATHS,
} from "@/lib/marketing/field-sales-deferral-p3-93-content";
import {
  FIELD_SALES_DEFERRAL_P3_93_DOC,
  FIELD_SALES_DEFERRAL_P3_93_POLICY_ID,
  FIELD_SALES_DEFERRAL_P3_93_ROADMAP_ITEM_ID,
  FIELD_SALES_DEFERRAL_P3_93_UPSTREAM_PRODUCT_ROADMAP,
  FIELD_SALES_DEFERRAL_P3_93_UPSTREAM_ROADMAP,
  FIELD_SALES_DEFERRAL_P3_93_WIRING_PATHS,
} from "@/lib/marketing/field-sales-deferral-p3-93-policy";

export type FieldSalesDeferralP393AuditSummary = {
  policyId: typeof FIELD_SALES_DEFERRAL_P3_93_POLICY_ID;
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

  for (const rel of FIELD_SALES_DEFERRAL_P3_93_SCAN_PATHS) {
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
          if ((FIELD_SALES_DEFERRAL_P3_93_SCAN_EXCLUDE_FILES as readonly string[]).includes(childRel)) {
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

export function auditFieldSalesDeferralP393(
  root = process.cwd(),
): FieldSalesDeferralP393AuditSummary {
  const failures: string[] = [];

  const wiringComplete = FIELD_SALES_DEFERRAL_P3_93_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );
  if (!wiringComplete) failures.push("missing P3-93 wiring paths");

  let docWired = false;
  if (existsSync(join(root, FIELD_SALES_DEFERRAL_P3_93_DOC))) {
    const doc = readFileSync(join(root, FIELD_SALES_DEFERRAL_P3_93_DOC), "utf8");
    docWired =
      doc.includes(FIELD_SALES_DEFERRAL_P3_93_POLICY_ID) &&
      doc.includes("digital-only") &&
      doc.includes("defer");
  } else {
    failures.push(`missing doc: ${FIELD_SALES_DEFERRAL_P3_93_DOC}`);
  }

  let roadmapDeferred = false;
  if (existsSync(join(root, FIELD_SALES_DEFERRAL_P3_93_UPSTREAM_ROADMAP))) {
    const roadmap = readFileSync(join(root, FIELD_SALES_DEFERRAL_P3_93_UPSTREAM_ROADMAP), "utf8");
    roadmapDeferred =
      roadmap.includes(`id: '${FIELD_SALES_DEFERRAL_P3_93_ROADMAP_ITEM_ID}'`) &&
      roadmap.includes("digital-only");
  } else {
    failures.push("missing public roadmap content");
  }

  let productRoadmapDeferred = false;
  if (existsSync(join(root, FIELD_SALES_DEFERRAL_P3_93_UPSTREAM_PRODUCT_ROADMAP))) {
    const product = readFileSync(join(root, FIELD_SALES_DEFERRAL_P3_93_UPSTREAM_PRODUCT_ROADMAP), "utf8");
    productRoadmapDeferred =
      product.includes("Field sales") && product.includes("digital-only");
  }

  const alternativesDefined = FIELD_SALES_DEFERRAL_P3_93_ALTERNATIVES.length >= 3;

  let marketingClean = true;
  for (const source of collectSources(root)) {
    for (const phrase of FIELD_SALES_DEFERRAL_P3_93_BANNED_PHRASES) {
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
    policyId: FIELD_SALES_DEFERRAL_P3_93_POLICY_ID,
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

export function formatFieldSalesDeferralP393AuditLines(
  summary: FieldSalesDeferralP393AuditSummary,
): string[] {
  return [
    `Field sales deferral (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Public /roadmap deferred: ${summary.roadmapDeferred ? "yes" : "no"}`,
    `PRODUCT_ROADMAP deferred: ${summary.productRoadmapDeferred ? "yes" : "no"}`,
    `Alternatives (${FIELD_SALES_DEFERRAL_P3_93_ALTERNATIVES.length}): ${summary.alternativesDefined ? "yes" : "no"}`,
    `Marketing clean: ${summary.marketingClean ? "yes" : "no"}`,
    `GTM model: digital-only`,
    `Public line: ${FIELD_SALES_DEFERRAL_P3_93_PUBLIC_LINE.slice(0, 60)}…`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
    ...(summary.failures.length > 0 ? [`Failures: ${summary.failures.join("; ")}`] : []),
  ];
}
