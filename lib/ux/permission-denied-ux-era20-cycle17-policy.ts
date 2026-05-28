/**
 * Permission denied UX — Copilot routes — Era 20 Cycle 17 (Workstream H).
 */

import { PERMISSION_DENIED_UX_ERA20_CYCLE10_POLICY_ID } from "@/lib/ux/permission-denied-ux-era20-cycle10-policy";

export const PERMISSION_DENIED_UX_ERA20_CYCLE17_POLICY_ID =
  "era20-permission-denied-copilot-cycle17-v1" as const;

export const PERMISSION_DENIED_UX_ERA20_CYCLE17_BACKLOG_ID = "KOS-E20-017" as const;

export const PERMISSION_DENIED_UX_ERA20_CYCLE17_EXTENDS_POLICIES = [
  PERMISSION_DENIED_UX_ERA20_CYCLE10_POLICY_ID,
] as const;

export const PERMISSION_DENIED_UX_ERA20_CYCLE17_WIRED_PAGE_PATHS = [
  "app/dashboard/copilot/layout.tsx",
  "app/dashboard/copilot/chat/page.tsx",
  "app/dashboard/copilot/audit/page.tsx",
  "app/dashboard/copilot/settings/page.tsx",
] as const;

export const PERMISSION_DENIED_UX_ERA20_CYCLE17_SPOTCHECK_SURFACES = [
  "copilot_hub",
  "copilot_chat",
  "copilot_audit",
  "copilot_settings",
] as const;

export const PERMISSION_DENIED_UX_ERA20_CYCLE17_UNIT_TESTS = [
  "tests/unit/permission-denied-page-access-era20-cycle17.test.ts",
  "tests/unit/permission-denied-ux-era20-cycle17-cert-live.test.ts",
] as const;

export const PERMISSION_DENIED_UX_ERA20_CYCLE17_CI_SCRIPTS = [
  "test:ci:permission-denied-ux-era20-cycle17",
  "test:ci:permission-denied-ux-era20-cycle17:cert",
] as const;
