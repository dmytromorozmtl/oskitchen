/**
 * Permission denied UX — packing + production surfaces — Evolution Era 19 Workstream E Cycle 35.
 *
 * Extends Era 17 POS/KDS denial cards to packing command center, packing verify, and production calendar.
 * Does not bypass server-side mutation checks.
 */

import {
  PERMISSION_DENIED_UX_ERA17_POLICY_ID,
  PERMISSION_DENIED_UX_ERA17_WIRED_PAGE_PATHS,
} from "@/lib/ux/permission-denied-era17-policy";

export const PERMISSION_DENIED_UX_ERA19_POLICY_ID =
  "era19-permission-denied-packing-production-v1" as const;

export const PERMISSION_DENIED_UX_ERA19_EXTENDS_POLICIES = [
  PERMISSION_DENIED_UX_ERA17_POLICY_ID,
] as const;

export const PERMISSION_DENIED_UX_ERA19_BACKLOG_ID = "KOS-E19-035" as const;

export const PERMISSION_DENIED_UX_ERA19_WIRED_PAGE_PATHS = [
  "app/dashboard/packing/page.tsx",
  "app/dashboard/packing/verify/page.tsx",
  "app/dashboard/packing/scanner/page.tsx",
  "app/dashboard/packing/reports/page.tsx",
  "app/dashboard/production/calendar/page.tsx",
  "app/dashboard/production/page.tsx",
  "app/dashboard/production/templates/page.tsx",
  "app/dashboard/production/reports/page.tsx",
  "app/dashboard/production/batches/[batchId]/page.tsx",
] as const;

export const PERMISSION_DENIED_UX_ERA19_ALL_WIRED_PAGE_PATHS = [
  ...PERMISSION_DENIED_UX_ERA17_WIRED_PAGE_PATHS,
  ...PERMISSION_DENIED_UX_ERA19_WIRED_PAGE_PATHS,
] as const;

export const PERMISSION_DENIED_UX_ERA19_SPOTCHECK_SURFACES = [
  "packing_command",
  "packing_verify",
  "production_calendar",
  "production_board",
] as const;

export const PERMISSION_DENIED_UX_ERA19_UNIT_TESTS = [
  "tests/unit/permission-denied-era19-policy.test.ts",
  "tests/unit/permission-denied-era19-cert-live.test.ts",
  "tests/unit/permission-denied-page-access-era19.test.ts",
] as const;
