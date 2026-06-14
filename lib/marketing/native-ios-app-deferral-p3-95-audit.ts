import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  NATIVE_IOS_APP_DEFERRAL_P3_95_ALTERNATIVES,
  NATIVE_IOS_APP_DEFERRAL_P3_95_BANNED_PHRASES,
  NATIVE_IOS_APP_DEFERRAL_P3_95_PUBLIC_LINE,
  NATIVE_IOS_APP_DEFERRAL_P3_95_SCAN_EXCLUDE_FILES,
  NATIVE_IOS_APP_DEFERRAL_P3_95_SCAN_PATHS,
} from "@/lib/marketing/native-ios-app-deferral-p3-95-content";
import {
  NATIVE_IOS_APP_DEFERRAL_P3_95_DOC,
  NATIVE_IOS_APP_DEFERRAL_P3_95_POLICY_ID,
  NATIVE_IOS_APP_DEFERRAL_P3_95_ROADMAP_ITEM_ID,
  NATIVE_IOS_APP_DEFERRAL_P3_95_UPSTREAM_PRODUCT_ROADMAP,
  NATIVE_IOS_APP_DEFERRAL_P3_95_UPSTREAM_ROADMAP,
  NATIVE_IOS_APP_DEFERRAL_P3_95_WIRING_PATHS,
} from "@/lib/marketing/native-ios-app-deferral-p3-95-policy";

export type NativeIosAppDeferralP395AuditSummary = {
  policyId: typeof NATIVE_IOS_APP_DEFERRAL_P3_95_POLICY_ID;
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

  for (const rel of NATIVE_IOS_APP_DEFERRAL_P3_95_SCAN_PATHS) {
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
          if ((NATIVE_IOS_APP_DEFERRAL_P3_95_SCAN_EXCLUDE_FILES as readonly string[]).includes(childRel)) {
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

export function auditNativeIosAppDeferralP395(
  root = process.cwd(),
): NativeIosAppDeferralP395AuditSummary {
  const failures: string[] = [];

  const wiringComplete = NATIVE_IOS_APP_DEFERRAL_P3_95_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );
  if (!wiringComplete) failures.push("missing P3-95 wiring paths");

  let docWired = false;
  if (existsSync(join(root, NATIVE_IOS_APP_DEFERRAL_P3_95_DOC))) {
    const doc = readFileSync(join(root, NATIVE_IOS_APP_DEFERRAL_P3_95_DOC), "utf8");
    docWired =
      doc.includes(NATIVE_IOS_APP_DEFERRAL_P3_95_POLICY_ID) &&
      doc.includes("native iOS") &&
      doc.includes("defer");
  } else {
    failures.push(`missing doc: ${NATIVE_IOS_APP_DEFERRAL_P3_95_DOC}`);
  }

  let roadmapDeferred = false;
  if (existsSync(join(root, NATIVE_IOS_APP_DEFERRAL_P3_95_UPSTREAM_ROADMAP))) {
    const roadmap = readFileSync(join(root, NATIVE_IOS_APP_DEFERRAL_P3_95_UPSTREAM_ROADMAP), "utf8");
    roadmapDeferred =
      roadmap.includes(`id: '${NATIVE_IOS_APP_DEFERRAL_P3_95_ROADMAP_ITEM_ID}'`) &&
      roadmap.includes("native iOS") &&
      roadmap.includes("deferred");
  } else {
    failures.push("missing public roadmap content");
  }

  let productRoadmapDeferred = false;
  if (existsSync(join(root, NATIVE_IOS_APP_DEFERRAL_P3_95_UPSTREAM_PRODUCT_ROADMAP))) {
    const product = readFileSync(
      join(root, NATIVE_IOS_APP_DEFERRAL_P3_95_UPSTREAM_PRODUCT_ROADMAP),
      "utf8",
    );
    productRoadmapDeferred =
      product.includes("Native iOS app") && product.includes("NOT_AVAILABLE");
  }

  const alternativesDefined = NATIVE_IOS_APP_DEFERRAL_P3_95_ALTERNATIVES.length >= 3;

  let marketingClean = true;
  for (const source of collectSources(root)) {
    for (const phrase of NATIVE_IOS_APP_DEFERRAL_P3_95_BANNED_PHRASES) {
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
    policyId: NATIVE_IOS_APP_DEFERRAL_P3_95_POLICY_ID,
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

export function formatNativeIosAppDeferralP395AuditLines(
  summary: NativeIosAppDeferralP395AuditSummary,
): string[] {
  return [
    `Native iOS app deferral (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Public /roadmap deferred: ${summary.roadmapDeferred ? "yes" : "no"}`,
    `PRODUCT_ROADMAP deferred: ${summary.productRoadmapDeferred ? "yes" : "no"}`,
    `Alternatives (${NATIVE_IOS_APP_DEFERRAL_P3_95_ALTERNATIVES.length}): ${summary.alternativesDefined ? "yes" : "no"}`,
    `Marketing clean: ${summary.marketingClean ? "yes" : "no"}`,
    `Public line: ${NATIVE_IOS_APP_DEFERRAL_P3_95_PUBLIC_LINE.slice(0, 60)}…`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
    ...(summary.failures.length > 0 ? [`Failures: ${summary.failures.join("; ")}`] : []),
  ];
}
