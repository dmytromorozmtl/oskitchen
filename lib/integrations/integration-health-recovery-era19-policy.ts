/**
 * Integration Health recovery guidance — Evolution Era 19 Workstream D Cycle 14.
 *
 * Contextual operator checklist with safe deep links — no risky mutations.
 */

export const INTEGRATION_HEALTH_RECOVERY_ERA19_POLICY_ID =
  "era19-integration-health-recovery-v1" as const;

export const INTEGRATION_HEALTH_RECOVERY_ANCHOR =
  "#integration-recovery-checklist" as const;

export const INTEGRATION_HEALTH_RECOVERY_OPS_CHECKLIST_DOC =
  "docs/era18-p0-staging-proof-ops-checklist.md" as const;

export const INTEGRATION_HEALTH_RECOVERY_QUICK_LINKS = [
  {
    id: "webhook-queue",
    label: "Webhook queue",
    href: "/dashboard/sales-channels/webhooks",
    detail: "Review failed or unprocessed webhook deliveries.",
  },
  {
    id: "product-mapping",
    label: "Product mapping",
    href: "/dashboard/product-mapping",
    detail: "Resolve Woo/Shopify SKU mismatches before live smoke.",
  },
  {
    id: "import-center",
    label: "Import center",
    href: "/dashboard/import-center",
    detail: "Migrate catalog and customer CSVs before channel mapping.",
  },
  {
    id: "error-recovery",
    label: "Error recovery",
    href: "/dashboard/error-recovery",
    detail: "Replay failed jobs when a safe server action exists.",
  },
  {
    id: "connection-tests",
    label: "Connection tests",
    href: "/dashboard/sales-channels/health",
    detail: "Run in-app channel health checks before engineering smoke.",
  },
  {
    id: "launch-wizard",
    label: "Launch wizard",
    href: "/dashboard/launch-wizard",
    detail: "Track setup steps blocking pilot cutover.",
  },
  {
    id: "sso-settings",
    label: "Enterprise SSO",
    href: "/dashboard/settings/security/sso",
    detail: "Configure IdP pilot wiring — not production SSO for all tenants.",
  },
  {
    id: "sales-channels",
    label: "Sales channels",
    href: "/dashboard/sales-channels",
    detail: "Add or rotate Woo/Shopify credentials and webhook secrets.",
  },
] as const;
