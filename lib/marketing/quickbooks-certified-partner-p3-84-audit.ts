import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_PHASES,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_DOC,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_HONESTY_MARKERS,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_INTEGRATION_DOC,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_POLICY_ID,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_UPSTREAM,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_WIRING_PATHS,
} from "@/lib/marketing/quickbooks-certified-partner-p3-84-policy";
import {
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_CHECKLIST_ITEMS,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_COPY_ARTIFACT_PATHS,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_LISTING_COPY,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_REQUIRED_ASSETS,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_REQUIRED_ENDPOINTS,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_REQUIRED_SCOPES,
  taglineWithinQuickBooksLimit,
} from "@/lib/marketing/quickbooks-certified-partner-p3-84-content";

export type QuickBooksCertifiedPartnerP384AuditSummary = {
  policyId: typeof QUICKBOOKS_CERTIFIED_PARTNER_P3_84_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  integrationDocLinked: boolean;
  assetsDefined: boolean;
  copyArtifactsWired: boolean;
  copyValid: boolean;
  scopesDefined: boolean;
  endpointsDefined: boolean;
  checklistComplete: boolean;
  upstreamProofsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditQuickBooksCertifiedPartnerP384(
  root = process.cwd(),
): QuickBooksCertifiedPartnerP384AuditSummary {
  const wiringComplete = QUICKBOOKS_CERTIFIED_PARTNER_P3_84_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let integrationDocLinked = false;
  let honestyMarkersPresent = false;

  if (existsSync(join(root, QUICKBOOKS_CERTIFIED_PARTNER_P3_84_DOC))) {
    const source = readFileSync(join(root, QUICKBOOKS_CERTIFIED_PARTNER_P3_84_DOC), "utf8");
    docWired =
      source.includes(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_POLICY_ID) &&
      source.includes("Application checklist") &&
      source.includes("Listing copy");
    integrationDocLinked = source.includes("QUICKBOOKS_INTEGRATION.md");
    honestyMarkersPresent = QUICKBOOKS_CERTIFIED_PARTNER_P3_84_HONESTY_MARKERS.every((marker) =>
      source.toLowerCase().includes(marker.toLowerCase()),
    );
  }

  const assetsDefined =
    QUICKBOOKS_CERTIFIED_PARTNER_P3_84_REQUIRED_ASSETS.length >= 4 &&
    QUICKBOOKS_CERTIFIED_PARTNER_P3_84_REQUIRED_ASSETS.some((a) => a.id === "app-logo");

  const copyArtifactsWired = QUICKBOOKS_CERTIFIED_PARTNER_P3_84_COPY_ARTIFACT_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let copyValid = false;
  if (copyArtifactsWired) {
    const listing = readFileSync(
      join(root, QUICKBOOKS_CERTIFIED_PARTNER_P3_84_COPY_ARTIFACT_PATHS[0]!),
      "utf8",
    );
    copyValid =
      listing.includes(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_LISTING_COPY.tagline) &&
      listing.includes(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_LISTING_COPY.appName) &&
      taglineWithinQuickBooksLimit(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_LISTING_COPY.tagline);
  }

  const scopesDefined = QUICKBOOKS_CERTIFIED_PARTNER_P3_84_REQUIRED_SCOPES.length >= 4;
  const endpointsDefined = QUICKBOOKS_CERTIFIED_PARTNER_P3_84_REQUIRED_ENDPOINTS.length >= 4;

  const checklistComplete =
    QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_CHECKLIST_ITEMS.length >= 7 &&
    QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_PHASES.every((phase) =>
      QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_CHECKLIST_ITEMS.some(
        (item) => item.phase === phase,
      ),
    );

  const upstreamProofsPresent = QUICKBOOKS_CERTIFIED_PARTNER_P3_84_UPSTREAM.every((rel) =>
    existsSync(join(root, rel)),
  );

  let integrationAligned = false;
  if (existsSync(join(root, QUICKBOOKS_CERTIFIED_PARTNER_P3_84_INTEGRATION_DOC))) {
    const integration = readFileSync(
      join(root, QUICKBOOKS_CERTIFIED_PARTNER_P3_84_INTEGRATION_DOC),
      "utf8",
    );
    integrationAligned =
      integration.includes("LIVE") &&
      QUICKBOOKS_CERTIFIED_PARTNER_P3_84_REQUIRED_ENDPOINTS.some((endpoint) =>
        integration.includes(endpoint),
      );
  }

  const passed =
    wiringComplete &&
    docWired &&
    integrationDocLinked &&
    assetsDefined &&
    copyArtifactsWired &&
    copyValid &&
    scopesDefined &&
    endpointsDefined &&
    checklistComplete &&
    upstreamProofsPresent &&
    honestyMarkersPresent &&
    integrationAligned;

  return {
    policyId: QUICKBOOKS_CERTIFIED_PARTNER_P3_84_POLICY_ID,
    wiringComplete,
    docWired,
    integrationDocLinked,
    assetsDefined,
    copyArtifactsWired,
    copyValid,
    scopesDefined,
    endpointsDefined,
    checklistComplete,
    upstreamProofsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatQuickBooksCertifiedPartnerP384AuditLines(
  summary: QuickBooksCertifiedPartnerP384AuditSummary,
): string[] {
  return [
    `QuickBooks certified partner (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Integration doc linked: ${summary.integrationDocLinked ? "yes" : "no"}`,
    `Assets defined: ${summary.assetsDefined ? "yes" : "no"}`,
    `Copy artifacts: ${summary.copyArtifactsWired ? "yes" : "no"}`,
    `Copy valid: ${summary.copyValid ? "yes" : "no"}`,
    `Scopes: ${summary.scopesDefined ? "yes" : "no"}`,
    `Endpoints: ${summary.endpointsDefined ? "yes" : "no"}`,
    `Checklist: ${summary.checklistComplete ? "yes" : "no"}`,
    `Upstream proofs: ${summary.upstreamProofsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
