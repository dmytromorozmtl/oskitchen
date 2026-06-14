import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  DISPATCH_NETWORK_DEFERRAL_P3_97_ALTERNATIVES,
  DISPATCH_NETWORK_DEFERRAL_P3_97_BANNED_PHRASES,
  DISPATCH_NETWORK_DEFERRAL_P3_97_PUBLIC_LINE,
  DISPATCH_NETWORK_DEFERRAL_P3_97_SCAN_EXCLUDE_FILES,
  DISPATCH_NETWORK_DEFERRAL_P3_97_SCAN_PATHS,
} from "@/lib/marketing/dispatch-network-deferral-p3-97-content";
import {
  DISPATCH_NETWORK_DEFERRAL_P3_97_DOC,
  DISPATCH_NETWORK_DEFERRAL_P3_97_POLICY_ID,
  DISPATCH_NETWORK_DEFERRAL_P3_97_ROADMAP_ITEM_ID,
  DISPATCH_NETWORK_DEFERRAL_P3_97_UPSTREAM_PRODUCT_ROADMAP,
  DISPATCH_NETWORK_DEFERRAL_P3_97_UPSTREAM_ROADMAP,
  DISPATCH_NETWORK_DEFERRAL_P3_97_WIRING_PATHS,
} from "@/lib/marketing/dispatch-network-deferral-p3-97-policy";

export type DispatchNetworkDeferralP397AuditSummary = {
  policyId: typeof DISPATCH_NETWORK_DEFERRAL_P3_97_POLICY_ID;
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

  for (const rel of DISPATCH_NETWORK_DEFERRAL_P3_97_SCAN_PATHS) {
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
            (DISPATCH_NETWORK_DEFERRAL_P3_97_SCAN_EXCLUDE_FILES as readonly string[]).includes(
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

export function auditDispatchNetworkDeferralP397(
  root = process.cwd(),
): DispatchNetworkDeferralP397AuditSummary {
  const failures: string[] = [];

  const wiringComplete = DISPATCH_NETWORK_DEFERRAL_P3_97_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );
  if (!wiringComplete) failures.push("missing P3-97 wiring paths");

  let docWired = false;
  if (existsSync(join(root, DISPATCH_NETWORK_DEFERRAL_P3_97_DOC))) {
    const doc = readFileSync(join(root, DISPATCH_NETWORK_DEFERRAL_P3_97_DOC), "utf8");
    docWired =
      doc.includes(DISPATCH_NETWORK_DEFERRAL_P3_97_POLICY_ID) &&
      doc.includes("dispatch network") &&
      doc.includes("defer");
  } else {
    failures.push(`missing doc: ${DISPATCH_NETWORK_DEFERRAL_P3_97_DOC}`);
  }

  let roadmapDeferred = false;
  if (existsSync(join(root, DISPATCH_NETWORK_DEFERRAL_P3_97_UPSTREAM_ROADMAP))) {
    const roadmap = readFileSync(join(root, DISPATCH_NETWORK_DEFERRAL_P3_97_UPSTREAM_ROADMAP), "utf8");
    roadmapDeferred =
      roadmap.includes(`id: '${DISPATCH_NETWORK_DEFERRAL_P3_97_ROADMAP_ITEM_ID}'`) &&
      roadmap.includes("dispatch network") &&
      roadmap.includes("deferred");
  } else {
    failures.push("missing public roadmap content");
  }

  let productRoadmapDeferred = false;
  if (existsSync(join(root, DISPATCH_NETWORK_DEFERRAL_P3_97_UPSTREAM_PRODUCT_ROADMAP))) {
    const product = readFileSync(
      join(root, DISPATCH_NETWORK_DEFERRAL_P3_97_UPSTREAM_PRODUCT_ROADMAP),
      "utf8",
    );
    productRoadmapDeferred =
      product.includes("Dispatch network") && product.includes("NOT_AVAILABLE");
  }

  const alternativesDefined = DISPATCH_NETWORK_DEFERRAL_P3_97_ALTERNATIVES.length >= 3;

  let marketingClean = true;
  for (const source of collectSources(root)) {
    for (const phrase of DISPATCH_NETWORK_DEFERRAL_P3_97_BANNED_PHRASES) {
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
    policyId: DISPATCH_NETWORK_DEFERRAL_P3_97_POLICY_ID,
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

export function formatDispatchNetworkDeferralP397AuditLines(
  summary: DispatchNetworkDeferralP397AuditSummary,
): string[] {
  return [
    `Dispatch network deferral (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Public /roadmap deferred: ${summary.roadmapDeferred ? "yes" : "no"}`,
    `PRODUCT_ROADMAP deferred: ${summary.productRoadmapDeferred ? "yes" : "no"}`,
    `Alternatives (${DISPATCH_NETWORK_DEFERRAL_P3_97_ALTERNATIVES.length}): ${summary.alternativesDefined ? "yes" : "no"}`,
    `Marketing clean: ${summary.marketingClean ? "yes" : "no"}`,
    `Public line: ${DISPATCH_NETWORK_DEFERRAL_P3_97_PUBLIC_LINE.slice(0, 60)}…`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
    ...(summary.failures.length > 0 ? [`Failures: ${summary.failures.join("; ")}`] : []),
  ];
}
