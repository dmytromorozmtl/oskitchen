import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_ALTERNATIVES,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_BANNED_PHRASES,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_PUBLIC_LINE,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_SCAN_EXCLUDE_FILES,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_SCAN_PATHS,
} from "@/lib/marketing/native-payment-terminal-deferral-p3-94-content";
import {
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_DOC,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_POLICY_ID,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_ROADMAP_ITEM_ID,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UPSTREAM_PRODUCT_ROADMAP,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UPSTREAM_ROADMAP,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_WIRING_PATHS,
} from "@/lib/marketing/native-payment-terminal-deferral-p3-94-policy";

export type NativePaymentTerminalDeferralP394AuditSummary = {
  policyId: typeof NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_POLICY_ID;
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

  for (const rel of NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_SCAN_PATHS) {
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
            (NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_SCAN_EXCLUDE_FILES as readonly string[]).includes(
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

export function auditNativePaymentTerminalDeferralP394(
  root = process.cwd(),
): NativePaymentTerminalDeferralP394AuditSummary {
  const failures: string[] = [];

  const wiringComplete = NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );
  if (!wiringComplete) failures.push("missing P3-94 wiring paths");

  let docWired = false;
  if (existsSync(join(root, NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_DOC))) {
    const doc = readFileSync(join(root, NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_DOC), "utf8");
    docWired =
      doc.includes(NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_POLICY_ID) &&
      doc.includes("native payment terminal") &&
      doc.includes("defer");
  } else {
    failures.push(`missing doc: ${NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_DOC}`);
  }

  let roadmapDeferred = false;
  if (existsSync(join(root, NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UPSTREAM_ROADMAP))) {
    const roadmap = readFileSync(
      join(root, NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UPSTREAM_ROADMAP),
      "utf8",
    );
    roadmapDeferred =
      roadmap.includes(`id: '${NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_ROADMAP_ITEM_ID}'`) &&
      roadmap.includes("native payment terminal") &&
      roadmap.includes("deferred");
  } else {
    failures.push("missing public roadmap content");
  }

  let productRoadmapDeferred = false;
  if (existsSync(join(root, NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UPSTREAM_PRODUCT_ROADMAP))) {
    const product = readFileSync(
      join(root, NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UPSTREAM_PRODUCT_ROADMAP),
      "utf8",
    );
    productRoadmapDeferred =
      product.includes("Native payment terminals") && product.includes("NOT_AVAILABLE");
  }

  const alternativesDefined = NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_ALTERNATIVES.length >= 3;

  let marketingClean = true;
  for (const source of collectSources(root)) {
    for (const phrase of NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_BANNED_PHRASES) {
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
    policyId: NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_POLICY_ID,
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

export function formatNativePaymentTerminalDeferralP394AuditLines(
  summary: NativePaymentTerminalDeferralP394AuditSummary,
): string[] {
  return [
    `Native payment terminal deferral (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Public /roadmap deferred: ${summary.roadmapDeferred ? "yes" : "no"}`,
    `PRODUCT_ROADMAP deferred: ${summary.productRoadmapDeferred ? "yes" : "no"}`,
    `Alternatives (${NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_ALTERNATIVES.length}): ${summary.alternativesDefined ? "yes" : "no"}`,
    `Marketing clean: ${summary.marketingClean ? "yes" : "no"}`,
    `Public line: ${NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_PUBLIC_LINE.slice(0, 60)}…`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
    ...(summary.failures.length > 0 ? [`Failures: ${summary.failures.join("; ")}`] : []),
  ];
}
