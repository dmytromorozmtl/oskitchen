/**
 * Blueprint P3-144 — Inventory + reservations depth (Lightspeed parity baseline).
 *
 * @see docs/inventory-reservations-depth.md
 */

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID =
  "inventory-reservations-depth-p3-144-v1" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_DOC =
  "docs/inventory-reservations-depth.md" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_ARTIFACT =
  "artifacts/inventory-reservations-depth-registry.json" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_AUDIT_SCRIPT =
  "scripts/audit-inventory-reservations-depth-p3-144.ts" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_NPM_SCRIPT =
  "audit:inventory-reservations-depth-p3-144" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_UNIT_TEST =
  "tests/unit/inventory-reservations-depth-p3-144.test.ts" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_COMPETITOR = "lightspeed" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_HEADLINE =
  "Inventory + reservations depth — Lightspeed parity baseline" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_ROUTE = "/dashboard/inventory/depth" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE =
  "/dashboard/reservations" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_COUNT = 5 as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_COUNT = 4 as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_TOTAL_CAPABILITY_COUNT = 9 as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_IDS = [
  "stock_counts",
  "receiving",
  "variance",
  "purchase_suggestions",
  "pos_impacts",
] as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_IDS = [
  "calendar_host",
  "waitlist_sms",
  "conflict_detection",
  "public_booking",
] as const;

export type InventoryDepthCapabilityId =
  (typeof INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_IDS)[number];

export type ReservationDepthCapabilityId =
  (typeof INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_IDS)[number];

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_TEST_IDS = [
  "inventory-reservations-depth",
  "inventory-depth-stock-counts",
  "inventory-depth-receiving",
  "inventory-depth-variance",
  "inventory-depth-purchase-suggestions",
  "inventory-depth-pos-impacts",
  "reservation-depth-calendar-host",
  "reservation-depth-waitlist-sms",
  "reservation-depth-conflict-detection",
  "reservation-depth-public-booking",
] as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_COMPONENT =
  "components/inventory/inventory-reservations-depth-panel.tsx" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_PAGE =
  "app/dashboard/inventory/depth/page.tsx" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_LEGACY_INVENTORY =
  "services/inventory/count-service.ts" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_LEGACY_RESERVATIONS =
  "services/storefront/reservation-service.ts" as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_RELATED_DOCS = [
  "docs/competitor-battle-cards/lightspeed.md",
  "docs/lightspeed-positioning.md",
  "docs/inventory-variance-report.md",
  "docs/sales-safe-claims-registry.md",
  "services/inventory/count-service.ts",
  "services/storefront/reservation-service.ts",
] as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_HONESTY_MARKERS = [
  "not affiliated",
  "0 signed LOIs",
  "BETA",
  "baseline",
  "verify",
] as const;

export const INVENTORY_RESERVATIONS_DEPTH_P3_144_WIRING_PATHS = [
  INVENTORY_RESERVATIONS_DEPTH_P3_144_DOC,
  "lib/inventory/inventory-reservations-depth-p3-144-policy.ts",
  "lib/inventory/inventory-reservations-depth-p3-144-content.ts",
  "lib/inventory/inventory-reservations-depth-p3-144-operations.ts",
  "lib/inventory/inventory-reservations-depth-p3-144-audit.ts",
  INVENTORY_RESERVATIONS_DEPTH_P3_144_ARTIFACT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_UNIT_TEST,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_COMPONENT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_PAGE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_LEGACY_INVENTORY,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_LEGACY_RESERVATIONS,
] as const;
