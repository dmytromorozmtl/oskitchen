/**
 * Absolute Final Task 135 — device status dashboard GTM scale (feature 90).
 *
 * @see docs/device-status-gtm-scale.md
 * @see components/dashboard/devices/device-status-dashboard.tsx
 */

export const DEVICE_STATUS_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "device-status-gtm-scale-absolute-final-v1" as const;

export const DEVICE_STATUS_GTM_SCALE_DOC_PATH = "docs/device-status-gtm-scale.md" as const;

export const DEVICE_STATUS_GTM_SCALE_HONESTY_MARKERS = [
  "Configuration only",
  "not proprietary hub telemetry",
  "Stripe",
  "Clover parity",
  "sales-safe",
] as const;

export const DEVICE_STATUS_GTM_SCALE_WIRING_PATHS = [
  DEVICE_STATUS_GTM_SCALE_DOC_PATH,
  "components/dashboard/devices/device-status-dashboard.tsx",
  "lib/integration-health/device-status-dashboard-absolute-final-policy.ts",
  "lib/marketing/device-status-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/device-status-gtm-scale-audit.ts",
  "tests/unit/device-status-dashboard-absolute-final.test.ts",
] as const;
