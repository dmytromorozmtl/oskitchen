import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_ARTIFACT,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CALLER,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_COMPONENT,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_POLICY_ID,
} from "@/lib/frontend/product-thumbnail-alt-text-p2-47-policy";

export type ProductThumbnailAltTextP247AuditSummary = {
  policyId: typeof PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_POLICY_ID;
  componentHasProductNameProp: boolean;
  componentUsesAltProductName: boolean;
  componentNoEmptyAlt: boolean;
  callerPassesProductName: boolean;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditProductThumbnailAltTextP247(
  root = process.cwd(),
): ProductThumbnailAltTextP247AuditSummary {
  const componentPath = join(root, PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_COMPONENT);
  const callerPath = join(root, PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CALLER);
  const artifactPath = join(root, PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_ARTIFACT);

  const componentSource = existsSync(componentPath)
    ? readFileSync(componentPath, "utf8")
    : "";
  const callerSource = existsSync(callerPath) ? readFileSync(callerPath, "utf8") : "";

  const componentHasProductNameProp =
    componentSource.includes("productName: string") &&
    componentSource.includes("productName,");
  const componentUsesAltProductName = componentSource.includes("alt={productName}");
  const componentNoEmptyAlt = !componentSource.includes('alt=""');
  const callerPassesProductName =
    callerSource.includes("productName={p.title}") ||
    callerSource.includes("productName={");

  let artifactPresent = false;
  if (existsSync(artifactPath)) {
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      policyId?: string;
      fix?: string;
    };
    artifactPresent =
      artifact.policyId === PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_POLICY_ID &&
      artifact.fix === "alt={productName}";
  }

  const passed =
    componentHasProductNameProp &&
    componentUsesAltProductName &&
    componentNoEmptyAlt &&
    callerPassesProductName &&
    artifactPresent;

  return {
    policyId: PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_POLICY_ID,
    componentHasProductNameProp,
    componentUsesAltProductName,
    componentNoEmptyAlt,
    callerPassesProductName,
    artifactPresent,
    passed,
  };
}

export function formatProductThumbnailAltTextP247AuditLines(
  summary: ProductThumbnailAltTextP247AuditSummary,
): string[] {
  return [
    `Product thumbnail alt text (${summary.policyId})`,
    `productName prop: ${summary.componentHasProductNameProp ? "yes" : "no"}`,
    `alt={productName}: ${summary.componentUsesAltProductName ? "yes" : "no"}`,
    `no empty alt: ${summary.componentNoEmptyAlt ? "yes" : "no"}`,
    `caller passes productName: ${summary.callerPassesProductName ? "yes" : "no"}`,
    `Artifact present: ${summary.artifactPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
