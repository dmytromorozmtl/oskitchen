import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_COPY_ARTIFACT_PATHS,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_COPY,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_REQUIRED_ASSETS,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_REQUIRED_SCOPES,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_REQUIRED_WEBHOOKS,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_SUBMISSION_CHECKLIST_ITEMS,
  taglineWithinShopifyLimit,
} from "@/lib/marketing/shopify-partner-marketplace-p3-83-content";
import {
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_APP_NAME,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_DOC,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_HONESTY_MARKERS,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_STATUS,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_POLICY_ID,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_READINESS_DOC,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_SUBMISSION_PHASES,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_UPSTREAM,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_WIRING_PATHS,
} from "@/lib/marketing/shopify-partner-marketplace-p3-83-policy";

export type ShopifyPartnerMarketplaceP383AuditSummary = {
  policyId: typeof SHOPIFY_PARTNER_MARKETPLACE_P3_83_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  readinessDocLinked: boolean;
  assetsDefined: boolean;
  copyArtifactsWired: boolean;
  copyValid: boolean;
  webhooksDefined: boolean;
  scopesDefined: boolean;
  checklistComplete: boolean;
  upstreamProofsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditShopifyPartnerMarketplaceP383(
  root = process.cwd(),
): ShopifyPartnerMarketplaceP383AuditSummary {
  const wiringComplete = SHOPIFY_PARTNER_MARKETPLACE_P3_83_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let readinessDocLinked = false;
  let honestyMarkersPresent = false;

  if (existsSync(join(root, SHOPIFY_PARTNER_MARKETPLACE_P3_83_DOC))) {
    const source = readFileSync(join(root, SHOPIFY_PARTNER_MARKETPLACE_P3_83_DOC), "utf8");
    docWired =
      source.includes(SHOPIFY_PARTNER_MARKETPLACE_P3_83_POLICY_ID) &&
      source.includes("Listing copy") &&
      source.includes("Submission checklist");
    readinessDocLinked = source.includes("SHOPIFY_APP_MARKETPLACE_READINESS.md");
    honestyMarkersPresent = SHOPIFY_PARTNER_MARKETPLACE_P3_83_HONESTY_MARKERS.every((marker) =>
      source.toLowerCase().includes(marker.toLowerCase()),
    );
  }

  const assetsDefined =
    SHOPIFY_PARTNER_MARKETPLACE_P3_83_REQUIRED_ASSETS.length >= 5 &&
    SHOPIFY_PARTNER_MARKETPLACE_P3_83_REQUIRED_ASSETS.some((a) => a.id === "app-icon");

  const copyArtifactsWired = SHOPIFY_PARTNER_MARKETPLACE_P3_83_COPY_ARTIFACT_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let copyValid = false;
  if (copyArtifactsWired) {
    const listing = readFileSync(
      join(root, SHOPIFY_PARTNER_MARKETPLACE_P3_83_COPY_ARTIFACT_PATHS[0]!),
      "utf8",
    );
    copyValid =
      listing.includes(SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_COPY.tagline) &&
      listing.includes(SHOPIFY_PARTNER_MARKETPLACE_P3_83_APP_NAME) &&
      taglineWithinShopifyLimit(SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_COPY.tagline);
  }

  const webhooksDefined = SHOPIFY_PARTNER_MARKETPLACE_P3_83_REQUIRED_WEBHOOKS.length >= 7;
  const scopesDefined = SHOPIFY_PARTNER_MARKETPLACE_P3_83_REQUIRED_SCOPES.length >= 4;

  const checklistComplete =
    SHOPIFY_PARTNER_MARKETPLACE_P3_83_SUBMISSION_CHECKLIST_ITEMS.length >= 7 &&
    SHOPIFY_PARTNER_MARKETPLACE_P3_83_SUBMISSION_PHASES.every((phase) =>
      SHOPIFY_PARTNER_MARKETPLACE_P3_83_SUBMISSION_CHECKLIST_ITEMS.some(
        (item) => item.phase === phase,
      ),
    );

  const upstreamProofsPresent = SHOPIFY_PARTNER_MARKETPLACE_P3_83_UPSTREAM.every((rel) =>
    existsSync(join(root, rel)),
  );

  let readinessAligned = false;
  if (existsSync(join(root, SHOPIFY_PARTNER_MARKETPLACE_P3_83_READINESS_DOC))) {
    const readiness = readFileSync(
      join(root, SHOPIFY_PARTNER_MARKETPLACE_P3_83_READINESS_DOC),
      "utf8",
    );
    readinessAligned =
      readiness.includes(SHOPIFY_PARTNER_MARKETPLACE_P3_83_APP_NAME) &&
      SHOPIFY_PARTNER_MARKETPLACE_P3_83_REQUIRED_WEBHOOKS.slice(0, 4).every((hook) =>
        readiness.includes(hook),
      );
  }

  const passed =
    wiringComplete &&
    docWired &&
    readinessDocLinked &&
    assetsDefined &&
    copyArtifactsWired &&
    copyValid &&
    webhooksDefined &&
    scopesDefined &&
    checklistComplete &&
    upstreamProofsPresent &&
    honestyMarkersPresent &&
    readinessAligned;

  return {
    policyId: SHOPIFY_PARTNER_MARKETPLACE_P3_83_POLICY_ID,
    wiringComplete,
    docWired,
    readinessDocLinked,
    assetsDefined,
    copyArtifactsWired,
    copyValid,
    webhooksDefined,
    scopesDefined,
    checklistComplete,
    upstreamProofsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatShopifyPartnerMarketplaceP383AuditLines(
  summary: ShopifyPartnerMarketplaceP383AuditSummary,
): string[] {
  return [
    `Shopify Partner marketplace listing (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Readiness doc linked: ${summary.readinessDocLinked ? "yes" : "no"}`,
    `Assets defined: ${summary.assetsDefined ? "yes" : "no"}`,
    `Copy artifacts: ${summary.copyArtifactsWired ? "yes" : "no"}`,
    `Copy valid: ${summary.copyValid ? "yes" : "no"}`,
    `Webhooks: ${summary.webhooksDefined ? "yes" : "no"}`,
    `Scopes: ${summary.scopesDefined ? "yes" : "no"}`,
    `Checklist: ${summary.checklistComplete ? "yes" : "no"}`,
    `Upstream proofs: ${summary.upstreamProofsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
