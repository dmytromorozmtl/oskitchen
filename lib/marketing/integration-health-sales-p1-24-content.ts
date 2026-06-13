/**
 * Blueprint P1-24 — Integration Health Center sales hook (DoorDash failure diagnostic).
 */

export const INTEGRATION_HEALTH_SALES_P1_24_POLICY_ID =
  "integration-health-sales-p1-24-v1" as const;

/** Primary sales hook for /integration-health-center hero. */
export const INTEGRATION_HEALTH_CENTER_SALES_HOOK =
  "See exactly why your DoorDash integration failed" as const;

export const INTEGRATION_HEALTH_CENTER_SALES_HOOK_SUBTITLE =
  "Incumbent POS tiles stay green while webhooks fail. Integration Health Center shows the exact failure code, last sync time, and recovery playbook — for DoorDash, Shopify, WooCommerce, and every channel in your workspace." as const;

export const INTEGRATION_HEALTH_DOORDASH_FAILURE_SECTION_TEST_ID =
  "integration-health-doordash-failure" as const;

/** Illustrative DoorDash failure rows — honest BETA/partner-gated caveats apply. */
export const INTEGRATION_HEALTH_DOORDASH_FAILURE_EXAMPLES = [
  {
    id: "auth_degraded",
    status: "FAILED",
    code: "AUTH_DEGRADED",
    title: "OAuth token expired",
    detail: "DoorDash partner token rotated — last successful sync 14h ago. Re-auth playbook ready.",
    playbook: "Re-authenticate DoorDash credentials",
  },
  {
    id: "webhook_signature",
    status: "FAILED",
    code: "WEBHOOK_SIGNATURE_MISMATCH",
    title: "Webhook signature rejected",
    detail: "Last 12 inbound webhooks returned 401 — HMAC secret mismatch after dashboard rotation.",
    playbook: "Verify webhook secret + replay queue",
  },
  {
    id: "stale_menu",
    status: "Watch",
    code: "STALE_CATALOG_SYNC",
    title: "Menu sync stale",
    detail: "Catalog pull 36h behind — items may 86 on DoorDash while POS shows in stock.",
    playbook: "Run catalog sync + review mapping",
  },
  {
    id: "partner_skipped",
    status: "SKIPPED",
    code: "PARTNER_CREDS_MISSING",
    title: "Partner credentials not configured",
    detail: "No fake green badge — DoorDash shows SKIPPED until pilot credentials are wired.",
    playbook: "Connect partner credentials in setup",
  },
] as const;

export type IntegrationHealthDoordashFailureExample =
  (typeof INTEGRATION_HEALTH_DOORDASH_FAILURE_EXAMPLES)[number];

export const INTEGRATION_HEALTH_DOORDASH_FAILURE_DISCLAIMER =
  "Examples are illustrative diagnostics — live DoorDash ops remain partner-gated or SKIPPED until your workspace credentials and pilot scope allow. Health signals are operational, not guaranteed uptime." as const;
