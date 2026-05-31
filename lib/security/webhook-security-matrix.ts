import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const WEBHOOK_ROUTE_ROOT = "app/api/webhooks" as const;

export const WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT = 52 as const;

export type WebhookSecurityCategory =
  | "commerce_critical"
  | "delivery_ops"
  | "platform_internal"
  | "experiment_internal"
  | "regulatory_mesh";

export type WebhookSignatureKind =
  | "stripe_construct_event"
  | "woocommerce_hmac"
  | "shopify_hmac"
  | "resend_hmac"
  | "slack_signature"
  | "scim_bearer"
  | "uber_eats_hmac"
  | "bearer_secret";

export type WebhookReplayKind =
  | "billing_event_id"
  | "webhook_event_store"
  | "provider_event_id"
  | "scim_upsert"
  | "ingress_dedupe"
  | "none";

export type WebhookTenantMapping =
  | "connection_cid"
  | "shop_domain"
  | "global_billing"
  | "global_platform"
  | "payload_scoped";

export type WebhookRiskTier = "P0" | "P1" | "P2" | "P3";

export type WebhookTestCoverage = "dedicated" | "shared" | "guard_only" | "none";

export interface WebhookSecurityClassification {
  category: WebhookSecurityCategory;
  signatureKind: WebhookSignatureKind;
  signatureValidated: true;
  replayProtection: WebhookReplayKind;
  tenantMapping: WebhookTenantMapping;
  structuredLogging: boolean;
  rateLimited: boolean;
  riskTier: WebhookRiskTier;
  testCoverage: WebhookTestCoverage;
  nextAction?: string;
}

export interface WebhookSecurityMatrixEntry extends WebhookSecurityClassification {
  routePath: string;
  apiPath: string;
}

export interface WebhookSecurityMatrixSummary {
  policyId: string;
  generatedAt: string;
  totalRoutes: number;
  expectedRouteCount: number;
  byRiskTier: Record<WebhookRiskTier, number>;
  byCategory: Record<WebhookSecurityCategory, number>;
  commerceRoutesWithReplay: number;
  p0p1MissingReplay: WebhookSecurityMatrixEntry[];
  highRiskNextActions: Array<{ apiPath: string; nextAction: string }>;
  entries: WebhookSecurityMatrixEntry[];
}

function walkRouteFiles(dir: string, root: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const name of entries) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      files.push(...walkRouteFiles(full, root));
      continue;
    }
    if (name === "route.ts") {
      files.push(relative(root, full).split("\\").join("/"));
    }
  }
  return files.sort();
}

export function listWebhookRouteFiles(root = process.cwd()): string[] {
  const base = join(root, WEBHOOK_ROUTE_ROOT);
  return walkRouteFiles(base, root);
}

export function routeFileToApiPath(routePath: string): string {
  const slug = routePath
    .replace(/^app\/api\/webhooks\//, "")
    .replace(/\/route\.ts$/, "");
  return `/api/webhooks/${slug}`;
}

function slugFromRoutePath(routePath: string): string {
  return routePath.replace(/^app\/api\/webhooks\//, "").replace(/\/route\.ts$/, "");
}

function regulatoryMeshBase(slug: string): WebhookSecurityClassification {
  return {
    category: "regulatory_mesh",
    signatureKind: "bearer_secret",
    signatureValidated: true,
    replayProtection: "none",
    tenantMapping: "payload_scoped",
    structuredLogging: true,
    rateLimited: false,
    riskTier: "P3",
    testCoverage: "guard_only",
    nextAction: "Add replay/idempotency if regulatory mesh routes become production-enabled.",
  };
}

export function classifyWebhookRoute(routePath: string): WebhookSecurityClassification {
  const slug = slugFromRoutePath(routePath);

  if (slug === "stripe") {
    return {
      category: "commerce_critical",
      signatureKind: "stripe_construct_event",
      signatureValidated: true,
      replayProtection: "billing_event_id",
      tenantMapping: "global_billing",
      structuredLogging: true,
      rateLimited: false,
      riskTier: "P0",
      testCoverage: "dedicated",
      nextAction: "Maintain Stripe signing secret rotation runbook.",
    };
  }

  if (slug === "woocommerce") {
    return {
      category: "commerce_critical",
      signatureKind: "woocommerce_hmac",
      signatureValidated: true,
      replayProtection: "webhook_event_store",
      tenantMapping: "connection_cid",
      structuredLogging: true,
      rateLimited: true,
      riskTier: "P0",
      testCoverage: "shared",
      nextAction: "Continue live channel smoke when staging credentials exist.",
    };
  }

  if (slug.startsWith("shopify/")) {
    return {
      category: "commerce_critical",
      signatureKind: "shopify_hmac",
      signatureValidated: true,
      replayProtection: "webhook_event_store",
      tenantMapping: "shop_domain",
      structuredLogging: true,
      rateLimited: true,
      riskTier: "P0",
      testCoverage: "shared",
      nextAction: "Continue live channel smoke when staging credentials exist.",
    };
  }

  if (slug === "resend") {
    return {
      category: "delivery_ops",
      signatureKind: "resend_hmac",
      signatureValidated: true,
      replayProtection: "provider_event_id",
      tenantMapping: "global_platform",
      structuredLogging: true,
      rateLimited: false,
      riskTier: "P1",
      testCoverage: "guard_only",
      nextAction: "Era 17 ingress dedupe + providerEventId — extend replay tests when notification delivery is pilot-critical.",
    };
  }

  if (slug === "uber-eats/orders") {
    return {
      category: "delivery_ops",
      signatureKind: "uber_eats_hmac",
      signatureValidated: true,
      replayProtection: "webhook_event_store",
      tenantMapping: "connection_cid",
      structuredLogging: true,
      rateLimited: false,
      riskTier: "P1",
      testCoverage: "none",
      nextAction: "Marketplace remains placeholder — do not claim live Uber Eats ops.",
    };
  }

  if (slug === "uber-direct") {
    return {
      category: "delivery_ops",
      signatureKind: "bearer_secret",
      signatureValidated: true,
      replayProtection: "ingress_dedupe",
      tenantMapping: "global_platform",
      structuredLogging: true,
      rateLimited: false,
      riskTier: "P1",
      testCoverage: "dedicated",
      nextAction: "Replace placeholder with provider-native signature when Uber Direct ships.",
    };
  }

  if (slug === "slack/experiment-interactive") {
    return {
      category: "platform_internal",
      signatureKind: "slack_signature",
      signatureValidated: true,
      replayProtection: "ingress_dedupe",
      tenantMapping: "global_platform",
      structuredLogging: true,
      rateLimited: false,
      riskTier: "P2",
      testCoverage: "dedicated",
      nextAction: "Slack ingress dedupe active — still not production commerce ingress.",
    };
  }

  if (slug.startsWith("capital-lender/")) {
    return {
      category: "platform_internal",
      signatureKind: "bearer_secret",
      signatureValidated: true,
      replayProtection: "ingress_dedupe",
      tenantMapping: "payload_scoped",
      structuredLogging: true,
      rateLimited: false,
      riskTier: "P2",
      testCoverage: "guard_only",
      nextAction: "Capital lender offer webhooks — partner-scoped secret rotation.",
    };
  }

  if (slug === "doordash/orders" || slug === "grubhub/orders") {
    return {
      category: "commerce_critical",
      signatureKind: "bearer_secret",
      signatureValidated: true,
      replayProtection: "webhook_event_store",
      tenantMapping: "connection_cid",
      structuredLogging: true,
      rateLimited: true,
      riskTier: "P0",
      testCoverage: "none",
      nextAction: "Marketplace BETA — continue live channel smoke when staging credentials exist.",
    };
  }

  if (slug === "scim/experiment-auditor") {
    return {
      category: "platform_internal",
      signatureKind: "scim_bearer",
      signatureValidated: true,
      replayProtection: "scim_upsert",
      tenantMapping: "global_platform",
      structuredLogging: true,
      rateLimited: false,
      riskTier: "P2",
      testCoverage: "dedicated",
      nextAction: "SCIM remains experiment-only — not enterprise SCIM delivery.",
    };
  }

  if (slug.startsWith("bigquery-") || slug.startsWith("experiment-")) {
    return {
      category: "experiment_internal",
      signatureKind: "bearer_secret",
      signatureValidated: true,
      replayProtection: "none",
      tenantMapping: "payload_scoped",
      structuredLogging: true,
      rateLimited: false,
      riskTier: "P3",
      testCoverage: "guard_only",
      nextAction: "Add idempotency keys before enabling experiment webhooks in production.",
    };
  }

  if (
    slug.startsWith("eu-ai-") ||
    slug.startsWith("nist-") ||
    slug.startsWith("iso-") ||
    slug.startsWith("uk-dsit-") ||
    slug.startsWith("us-ftc-") ||
    slug.startsWith("oecd-") ||
    slug.startsWith("wto-") ||
    slug.startsWith("icao-") ||
    slug.startsWith("itu-") ||
    slug.startsWith("cen-cenelec-") ||
    slug.startsWith("un-ai-") ||
    slug.startsWith("vertex-")
  ) {
    return regulatoryMeshBase(slug);
  }

  throw new Error(`Unclassified webhook route: ${routePath}`);
}

export function buildWebhookSecurityMatrix(root = process.cwd()): WebhookSecurityMatrixEntry[] {
  return listWebhookRouteFiles(root).map((routePath) => ({
    routePath,
    apiPath: routeFileToApiPath(routePath),
    ...classifyWebhookRoute(routePath),
  }));
}

export function validateWebhookSecurityMatrix(root = process.cwd()): {
  ok: boolean;
  errors: string[];
  entries: WebhookSecurityMatrixEntry[];
} {
  const entries = buildWebhookSecurityMatrix(root);
  const errors: string[] = [];

  if (entries.length !== WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT) {
    errors.push(
      `Expected ${WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT} webhook routes, found ${entries.length}`,
    );
  }

  const commerce = entries.filter((e) => e.category === "commerce_critical");
  for (const entry of commerce) {
    if (entry.replayProtection === "none") {
      errors.push(`${entry.apiPath} commerce route missing replay protection`);
    }
    if (!entry.signatureValidated) {
      errors.push(`${entry.apiPath} commerce route missing signature validation`);
    }
  }

  const p0p1 = entries.filter((e) => e.riskTier === "P0" || e.riskTier === "P1");
  const p0p1MissingReplay = p0p1.filter((e) => e.replayProtection === "none");
  if (p0p1MissingReplay.some((e) => e.category === "commerce_critical")) {
    errors.push("P0/P1 commerce route missing replay protection");
  }

  return { ok: errors.length === 0, errors, entries };
}

export function buildWebhookSecurityMatrixSummary(
  policyId: string,
  entries: WebhookSecurityMatrixEntry[],
): WebhookSecurityMatrixSummary {
  const byRiskTier: Record<WebhookRiskTier, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
  const byCategory: Record<WebhookSecurityCategory, number> = {
    commerce_critical: 0,
    delivery_ops: 0,
    platform_internal: 0,
    experiment_internal: 0,
    regulatory_mesh: 0,
  };

  for (const entry of entries) {
    byRiskTier[entry.riskTier] += 1;
    byCategory[entry.category] += 1;
  }

  const commerceRoutesWithReplay = entries.filter(
    (e) => e.category === "commerce_critical" && e.replayProtection !== "none",
  ).length;

  const p0p1MissingReplay = entries.filter(
    (e) => (e.riskTier === "P0" || e.riskTier === "P1") && e.replayProtection === "none",
  );

  const highRiskNextActions = entries
    .filter((e) => e.nextAction && (e.riskTier === "P0" || e.riskTier === "P1"))
    .map((e) => ({ apiPath: e.apiPath, nextAction: e.nextAction! }));

  return {
    policyId,
    generatedAt: new Date().toISOString(),
    totalRoutes: entries.length,
    expectedRouteCount: WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT,
    byRiskTier,
    byCategory,
    commerceRoutesWithReplay,
    p0p1MissingReplay,
    highRiskNextActions,
    entries,
  };
}

export function formatWebhookSecurityMatrixLine(entry: WebhookSecurityMatrixEntry): string {
  return [
    entry.apiPath,
    entry.riskTier,
    entry.signatureKind,
    entry.replayProtection,
    entry.tenantMapping,
  ].join(" | ");
}
