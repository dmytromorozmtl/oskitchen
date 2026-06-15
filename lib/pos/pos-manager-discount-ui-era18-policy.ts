/**
 * POS manager discount terminal UI — Evolution Era 18 Workstream F Cycle 30.
 *
 * Wires manager discount + COMPED controls to existing pos-discount-guard / action RBAC.
 * Does NOT claim Toast override parity, manager PIN flow, hardware POS, or offline POS.
 */

import { POS_MANAGER_DISCOUNT_ERA17_POLICY_ID } from "@/lib/pos/pos-manager-discount-era17-policy";

export const POS_MANAGER_DISCOUNT_UI_ERA18_POLICY_ID =
  "era18-pos-manager-discount-ui-v1" as const;

export const POS_MANAGER_DISCOUNT_UI_ERA18_DECISION_DATE = "2026-05-28" as const;

export const POS_MANAGER_DISCOUNT_UI_ERA18_EXTENDS_POLICIES = [
  POS_MANAGER_DISCOUNT_ERA17_POLICY_ID,
] as const;

export const POS_MANAGER_DISCOUNT_UI_ERA18_PROOF_STATUS =
  "terminal_discount_ui_wired" as const;

export const POS_MANAGER_DISCOUNT_UI_ERA18_TERMINAL_MODULE =
  "components/dashboard/pos-terminal-client.tsx" as const;

export const POS_MANAGER_DISCOUNT_UI_ERA18_DISCOUNT_UI_MODULE =
  "lib/pos/pos-terminal-discount-ui.ts" as const;

export const POS_MANAGER_DISCOUNT_UI_ERA18_REQUIRED_PERMISSION =
  "pos.discount.apply" as const;

export const POS_MANAGER_DISCOUNT_UI_ERA18_UX_TARGETS = [
  "Manager-only discount section on POS terminal cart",
  "Fixed and percent discount with preset chips",
  "Comp sale sets COMPED payment mode (manager permission gated)",
  "Cashiers cannot select COMPED without pos.discount.apply",
  "Subtotal / discount / amount due summary before complete sale",
] as const;

export const POS_MANAGER_DISCOUNT_UI_ERA18_FORBIDDEN_CLAIMS = [
  "toast manager override parity",
  "manager pin discount flow",
  "hardware pos certified",
  "offline pos production ready",
] as const;

export const POS_MANAGER_DISCOUNT_UI_ERA18_UNIT_TESTS = [
  "tests/unit/pos-terminal-discount-ui.test.ts",
  "tests/unit/pos-discount-guard.test.ts",
  "tests/unit/actions-pos-rbac.test.ts",
] as const;

export const POS_MANAGER_DISCOUNT_UI_ERA18_BACKLOG_ID = "KOS-E18-002" as const;
