import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT,
  type WebhookSecurityClassification,
  type WebhookSecurityMatrixEntry,
} from "./webhook-security-matrix";

/** Webhook ingress routes outside `app/api/webhooks/*` that still require signature verification. */
export const WEBHOOK_EXTENDED_INGRESS_ROUTE_FILES = [
  "app/api/marketplace/stripe-connect/webhook/route.ts",
  "app/api/voice/google/route.ts",
  "app/api/voice/alexa/route.ts",
  "app/api/capital/lender-share/[token]/route.ts",
] as const;

export type WebhookExtendedIngressRouteFile = (typeof WEBHOOK_EXTENDED_INGRESS_ROUTE_FILES)[number];

export const WEBHOOK_EXTENDED_INGRESS_ROUTE_COUNT =
  WEBHOOK_EXTENDED_INGRESS_ROUTE_FILES.length as 4;

export const WEBHOOK_ALL_INGRESS_ROUTE_COUNT =
  (WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT +
    WEBHOOK_EXTENDED_INGRESS_ROUTE_COUNT) as 59;

export function extendedRouteFileToApiPath(routePath: string): string {
  const slug = routePath.replace(/^app\/api\//, "").replace(/\/route\.ts$/, "");
  return `/api/${slug}`;
}

export function classifyExtendedWebhookRoute(
  routePath: WebhookExtendedIngressRouteFile,
): WebhookSecurityClassification {
  switch (routePath) {
    case "app/api/marketplace/stripe-connect/webhook/route.ts":
      return {
        category: "commerce_critical",
        signatureKind: "stripe_construct_event",
        signatureValidated: true,
        replayProtection: "billing_event_id",
        tenantMapping: "global_billing",
        structuredLogging: true,
        rateLimited: true,
        riskTier: "P0",
        testCoverage: "dedicated",
        nextAction: "Keep marketplace Connect webhook secret in sync with Stripe dashboard.",
      };
    case "app/api/voice/google/route.ts":
    case "app/api/voice/alexa/route.ts":
      return {
        category: "platform_internal",
        signatureKind: "bearer_secret",
        signatureValidated: true,
        replayProtection: "none",
        tenantMapping: "payload_scoped",
        structuredLogging: false,
        rateLimited: false,
        riskTier: "P2",
        testCoverage: "guard_only",
        nextAction: "Voice assistant ingress — per-owner x-voice-secret rotation.",
      };
    case "app/api/capital/lender-share/[token]/route.ts":
      return {
        category: "platform_internal",
        signatureKind: "bearer_secret",
        signatureValidated: true,
        replayProtection: "none",
        tenantMapping: "payload_scoped",
        structuredLogging: false,
        rateLimited: false,
        riskTier: "P2",
        testCoverage: "guard_only",
        nextAction: "Capital lender partner pull — IP allowlist + HMAC signature.",
      };
    default: {
      const _exhaustive: never = routePath;
      throw new Error(`Unclassified extended webhook route: ${_exhaustive}`);
    }
  }
}

export function listExtendedWebhookIngressRouteFiles(root = process.cwd()): string[] {
  return WEBHOOK_EXTENDED_INGRESS_ROUTE_FILES.filter((routePath) =>
    existsSync(join(root, routePath)),
  );
}

export function buildExtendedWebhookIngressMatrix(
  root = process.cwd(),
): WebhookSecurityMatrixEntry[] {
  return listExtendedWebhookIngressRouteFiles(root).map((routePath) => ({
    routePath,
    apiPath: extendedRouteFileToApiPath(routePath),
    ...classifyExtendedWebhookRoute(routePath as WebhookExtendedIngressRouteFile),
  }));
}

export function validateExtendedWebhookIngressMatrix(root = process.cwd()): {
  ok: boolean;
  errors: string[];
  entries: WebhookSecurityMatrixEntry[];
} {
  const entries = buildExtendedWebhookIngressMatrix(root);
  const errors: string[] = [];

  if (entries.length !== WEBHOOK_EXTENDED_INGRESS_ROUTE_COUNT) {
    errors.push(
      `Expected ${WEBHOOK_EXTENDED_INGRESS_ROUTE_COUNT} extended webhook ingress routes, found ${entries.length}`,
    );
  }

  for (const entry of entries) {
    if (!entry.signatureValidated) {
      errors.push(`${entry.apiPath} extended ingress route missing signature validation`);
    }
  }

  return { ok: errors.length === 0, errors, entries };
}
