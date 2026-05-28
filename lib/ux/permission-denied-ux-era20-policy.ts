/**
 * Permission denied UX — Order Hub + Integration Health — Era 20 Workstream H Cycle 4.
 */

import {
  PERMISSION_DENIED_UX_ERA17_POLICY_ID,
  PERMISSION_DENIED_UX_ERA17_WIRED_PAGE_PATHS,
} from "@/lib/ux/permission-denied-era17-policy";
import {
  PERMISSION_DENIED_UX_ERA19_POLICY_ID,
  PERMISSION_DENIED_UX_ERA19_WIRED_PAGE_PATHS,
} from "@/lib/ux/permission-denied-era19-policy";

export const PERMISSION_DENIED_UX_ERA20_POLICY_ID =
  "era20-permission-denied-order-hub-integration-health-v1" as const;

export const PERMISSION_DENIED_UX_ERA20_EXTENDS_POLICIES = [
  PERMISSION_DENIED_UX_ERA17_POLICY_ID,
  PERMISSION_DENIED_UX_ERA19_POLICY_ID,
] as const;

export const PERMISSION_DENIED_UX_ERA20_BACKLOG_ID = "KOS-E20-004" as const;

export const PERMISSION_DENIED_UX_ERA20_WIRED_PAGE_PATHS = [
  "app/dashboard/order-hub/page.tsx",
  "app/dashboard/integration-health/page.tsx",
  "app/dashboard/reports/page.tsx",
  "app/dashboard/inventory/layout.tsx",
] as const;

export const PERMISSION_DENIED_UX_ERA20_ALL_WIRED_PAGE_PATHS = [
  ...PERMISSION_DENIED_UX_ERA17_WIRED_PAGE_PATHS,
  ...PERMISSION_DENIED_UX_ERA19_WIRED_PAGE_PATHS,
  ...PERMISSION_DENIED_UX_ERA20_WIRED_PAGE_PATHS,
] as const;

export const PERMISSION_DENIED_UX_ERA20_SPOTCHECK_SURFACES = [
  "order_hub",
  "integration_health",
  "reports_hub",
  "inventory_operations",
] as const;

export const PERMISSION_DENIED_UX_ERA20_UNIT_TESTS = [
  "tests/unit/permission-denied-ux-era20-policy.test.ts",
  "tests/unit/permission-denied-ux-era20-cert-live.test.ts",
  "tests/unit/permission-denied-page-access-era20.test.ts",
] as const;

export const PERMISSION_DENIED_UX_ERA20_CI_SCRIPTS = [
  "test:ci:permission-denied-ux-era20",
  "test:ci:permission-denied-ux-era20:cert",
] as const;

export const PERMISSION_DENIED_UX_ERA20_REVIEW_SECTION =
  "Era 20 permission denied UX — dashboard pilot surfaces (2026-05-28)" as const;
