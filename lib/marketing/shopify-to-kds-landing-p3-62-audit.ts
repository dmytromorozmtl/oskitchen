import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SHOPIFY_TO_KDS_LANDING_P3_62_CANONICAL_PATH,
  SHOPIFY_TO_KDS_LANDING_P3_62_DOC,
  SHOPIFY_TO_KDS_LANDING_P3_62_NPM_SCRIPTS,
  SHOPIFY_TO_KDS_LANDING_P3_62_POLICY_ID,
  SHOPIFY_TO_KDS_LANDING_P3_62_PRIMARY_KEYWORD,
  SHOPIFY_TO_KDS_LANDING_P3_62_WIRING_PATHS,
} from "@/lib/marketing/shopify-to-kds-landing-p3-62-policy";
import { validateShopifyToKdsLandingContract } from "@/lib/marketing/shopify-to-kds-landing-p3-62-measurement";

export type ShopifyToKdsLandingP3_62AuditSummary = {
  policyId: typeof SHOPIFY_TO_KDS_LANDING_P3_62_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  canonicalPathWired: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditShopifyToKdsLandingP3_62(
  root = process.cwd(),
): ShopifyToKdsLandingP3_62AuditSummary {
  const wiringComplete = SHOPIFY_TO_KDS_LANDING_P3_62_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, SHOPIFY_TO_KDS_LANDING_P3_62_DOC))) {
    const source = readFileSync(join(root, SHOPIFY_TO_KDS_LANDING_P3_62_DOC), "utf8");
    docWired =
      source.includes(SHOPIFY_TO_KDS_LANDING_P3_62_POLICY_ID) &&
      source.includes(SHOPIFY_TO_KDS_LANDING_P3_62_CANONICAL_PATH) &&
      source.includes(SHOPIFY_TO_KDS_LANDING_P3_62_PRIMARY_KEYWORD);
  }

  const contract = validateShopifyToKdsLandingContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = SHOPIFY_TO_KDS_LANDING_P3_62_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed =
    wiringComplete &&
    docWired &&
    contract.passed &&
    contract.pathsAligned &&
    npmScriptsWired;

  return {
    policyId: SHOPIFY_TO_KDS_LANDING_P3_62_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    canonicalPathWired: contract.pathsAligned,
    npmScriptsWired,
    passed,
  };
}

export function formatShopifyToKdsLandingP3_62AuditLines(
  summary: ShopifyToKdsLandingP3_62AuditSummary,
): string[] {
  return [
    `Shopify-to-KDS landing audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${SHOPIFY_TO_KDS_LANDING_P3_62_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Canonical /shopify-to-kds: ${summary.canonicalPathWired ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
