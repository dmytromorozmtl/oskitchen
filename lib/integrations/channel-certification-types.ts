import type { IntegrationProvider } from "@prisma/client";

export type CertificationCheckStatus = "pass" | "fail" | "warn" | "skip";

export type CertificationCheckId =
  | "encryption_configured"
  | "credentials_present"
  | "webhook_secret_present"
  | "rest_api_reachable"
  | "webhook_hmac_algorithm"
  | "recent_valid_webhooks"
  | "idempotency_index"
  | "async_queue_recommended"
  | "shop_domain_routing"
  | "invalid_signature_isolated";

export type CertificationCheckResult = {
  id: CertificationCheckId;
  label: string;
  status: CertificationCheckStatus;
  message: string;
};

export type CertificationOverall = "PASS" | "PARTIAL" | "FAIL";

export type CertificationSignOff = {
  engineeringAt?: string;
  securityAt?: string;
  pilotAt?: string;
  notes?: string;
};

/** Stored on IntegrationConnection.settingsJson.certification */
export type ConnectionCertificationRecord = {
  provider: "woocommerce" | "shopify";
  lastRunAt: string;
  overall: CertificationOverall;
  checks: CertificationCheckResult[];
  signOff?: CertificationSignOff;
  /** Product label — always BETA until capability matrix is promoted. */
  productStatus: "BETA" | "PILOT_SIGNED";
};

export const WOO_CERTIFICATION_CHECKS: { id: CertificationCheckId; label: string }[] = [
  { id: "encryption_configured", label: "Encryption key configured" },
  { id: "credentials_present", label: "REST consumer key + secret saved" },
  { id: "webhook_secret_present", label: "Webhook signing secret saved" },
  { id: "rest_api_reachable", label: "WooCommerce REST API reachable" },
  { id: "webhook_hmac_algorithm", label: "HMAC-SHA256 verification (crypto self-test)" },
  { id: "recent_valid_webhooks", label: "Recent webhooks with valid signature" },
  { id: "idempotency_index", label: "Duplicate delivery id deduplication" },
  { id: "async_queue_recommended", label: "Async webhook queue (high volume)" },
  { id: "invalid_signature_isolated", label: "Invalid signatures do not process orders" },
];

export const SHOPIFY_CERTIFICATION_CHECKS: { id: CertificationCheckId; label: string }[] = [
  { id: "encryption_configured", label: "Encryption key configured" },
  { id: "credentials_present", label: "Admin API token saved" },
  { id: "webhook_secret_present", label: "Webhook signing secret saved" },
  { id: "shop_domain_routing", label: "Shop domain matches connection" },
  { id: "rest_api_reachable", label: "Shopify Admin API reachable" },
  { id: "webhook_hmac_algorithm", label: "HMAC-SHA256 verification (crypto self-test)" },
  { id: "recent_valid_webhooks", label: "Recent webhooks with valid signature" },
  { id: "idempotency_index", label: "Duplicate webhook id deduplication" },
  { id: "async_queue_recommended", label: "Async webhook queue (high volume)" },
  { id: "invalid_signature_isolated", label: "Invalid signatures rejected (401)" },
];

export function checklistForProvider(
  provider: IntegrationProvider,
): { id: CertificationCheckId; label: string }[] {
  if (provider === "WOOCOMMERCE") return WOO_CERTIFICATION_CHECKS;
  if (provider === "SHOPIFY") return SHOPIFY_CERTIFICATION_CHECKS;
  return [];
}

export function parseCertificationRecord(
  settingsJson: unknown,
): ConnectionCertificationRecord | null {
  if (!settingsJson || typeof settingsJson !== "object") return null;
  const cert = (settingsJson as Record<string, unknown>).certification;
  if (!cert || typeof cert !== "object") return null;
  return cert as ConnectionCertificationRecord;
}

export function certificationSignOffComplete(signOff?: CertificationSignOff): boolean {
  return Boolean(signOff?.engineeringAt && signOff?.securityAt && signOff?.pilotAt);
}
