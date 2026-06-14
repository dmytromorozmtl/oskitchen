import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_ALTERNATIVES,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_BANNED_PHRASES,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_PUBLIC_LINE,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_SCAN_EXCLUDE_FILES,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_SCAN_PATHS,
} from "@/lib/marketing/hardware-ecosystem-deferral-p3-96-content";
import {
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_DOC,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_POLICY_ID,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_ROADMAP_ITEM_ID,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UPSTREAM_PRODUCT_ROADMAP,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UPSTREAM_ROADMAP,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_WIRING_PATHS,
} from "@/lib/marketing/hardware-ecosystem-deferral-p3-96-policy";

export type HardwareEcosystemDeferralP396AuditSummary = {
  policyId: typeof HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_POLICY_ID;
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

  for (const rel of HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_SCAN_PATHS) {
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
          if (
            (HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_SCAN_EXCLUDE_FILES as readonly string[]).includes(
              childRel,
            )
          ) {
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

export function auditHardwareEcosystemDeferralP396(
  root = process.cwd(),
): HardwareEcosystemDeferralP396AuditSummary {
  const failures: string[] = [];

  const wiringComplete = HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );
  if (!wiringComplete) failures.push("missing P3-96 wiring paths");

  let docWired = false;
  if (existsSync(join(root, HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_DOC))) {
    const doc = readFileSync(join(root, HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_DOC), "utf8");
    docWired =
      doc.includes(HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_POLICY_ID) &&
      doc.includes("hardware ecosystem") &&
      doc.includes("defer");
  } else {
    failures.push(`missing doc: ${HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_DOC}`);
  }

  let roadmapDeferred = false;
  if (existsSync(join(root, HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UPSTREAM_ROADMAP))) {
    const roadmap = readFileSync(
      join(root, HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UPSTREAM_ROADMAP),
      "utf8",
    );
    roadmapDeferred =
      roadmap.includes(`id: '${HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_ROADMAP_ITEM_ID}'`) &&
      roadmap.includes("hardware ecosystem") &&
      roadmap.includes("deferred");
  } else {
    failures.push("missing public roadmap content");
  }

  let productRoadmapDeferred = false;
  if (existsSync(join(root, HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UPSTREAM_PRODUCT_ROADMAP))) {
    const product = readFileSync(
      join(root, HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UPSTREAM_PRODUCT_ROADMAP),
      "utf8",
    );
    productRoadmapDeferred =
      product.includes("Hardware ecosystem") && product.includes("NOT_AVAILABLE");
  }

  const alternativesDefined = HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_ALTERNATIVES.length >= 3;

  let marketingClean = true;
  for (const source of collectSources(root)) {
    for (const phrase of HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_BANNED_PHRASES) {
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
    policyId: HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_POLICY_ID,
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

export function formatHardwareEcosystemDeferralP396AuditLines(
  summary: HardwareEcosystemDeferralP396AuditSummary,
): string[] {
  return [
    `Hardware ecosystem deferral (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Public /roadmap deferred: ${summary.roadmapDeferred ? "yes" : "no"}`,
    `PRODUCT_ROADMAP deferred: ${summary.productRoadmapDeferred ? "yes" : "no"}`,
    `Alternatives (${HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_ALTERNATIVES.length}): ${summary.alternativesDefined ? "yes" : "no"}`,
    `Marketing clean: ${summary.marketingClean ? "yes" : "no"}`,
    `Public line: ${HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_PUBLIC_LINE.slice(0, 60)}…`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
    ...(summary.failures.length > 0 ? [`Failures: ${summary.failures.join("; ")}`] : []),
  ];
}
