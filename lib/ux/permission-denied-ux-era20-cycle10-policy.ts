/**
 * Permission denied UX — Implementation, Staff, Go-live, CRM, Billing — Era 20 Cycle 10.
 */

import { PERMISSION_DENIED_UX_ERA20_POLICY_ID } from "@/lib/ux/permission-denied-ux-era20-policy";

export const PERMISSION_DENIED_UX_ERA20_CYCLE10_POLICY_ID =
  "era20-permission-denied-pilot-hubs-cycle10-v1" as const;

export const PERMISSION_DENIED_UX_ERA20_CYCLE10_BACKLOG_ID = "KOS-E20-010" as const;

export const PERMISSION_DENIED_UX_ERA20_CYCLE10_EXTENDS_POLICIES = [
  PERMISSION_DENIED_UX_ERA20_POLICY_ID,
] as const;

export const PERMISSION_DENIED_UX_ERA20_CYCLE10_WIRED_PAGE_PATHS = [
  "app/dashboard/implementation/layout.tsx",
  "app/dashboard/staff/layout.tsx",
  "app/dashboard/go-live/page.tsx",
  "app/dashboard/customers/page.tsx",
  "lib/billing/billing-page-access.tsx",
] as const;

export const PERMISSION_DENIED_UX_ERA20_CYCLE10_SPOTCHECK_SURFACES = [
  "implementation_hub",
  "staff_hub",
  "go_live_hub",
  "crm_customers",
  "billing_hub",
] as const;

export const PERMISSION_DENIED_UX_ERA20_CYCLE10_UNIT_TESTS = [
  "tests/unit/permission-denied-page-access-era20-cycle10.test.ts",
  "tests/unit/permission-denied-ux-era20-cycle10-cert-live.test.ts",
] as const;

export const PERMISSION_DENIED_UX_ERA20_CYCLE10_CI_SCRIPTS = [
  "test:ci:permission-denied-ux-era20-cycle10",
  "test:ci:permission-denied-ux-era20-cycle10:cert",
] as const;
