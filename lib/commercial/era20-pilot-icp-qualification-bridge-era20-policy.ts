/**
 * Era 20 — Pilot ICP qualification bridge for GO/NO-GO (Workstream B Cycle 15).
 */

import { PILOT_ICP_CONTRACT_ERA17_POLICY_ID } from "@/lib/commercial/pilot-icp-contract-era17-policy";
import { ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID } from "@/lib/commercial/era20-first-paid-pilot-package-policy";
import { PILOT_GONOGO_ERA17_POLICY_ID } from "@/lib/commercial/pilot-gono-go-era17-policy";

export const ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_POLICY_ID =
  "era20-pilot-icp-qualification-bridge-v1" as const;

export const ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_BACKLOG_ID = "KOS-E20-015" as const;

export const ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_TEMPLATE_PATH =
  "config/commercial/pilot-icp-qualified-example.template.json" as const;

export const ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_ENV_VAR = "PILOT_GONOGO_ICP_INPUT_JSON" as const;

export const ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_DOC =
  "docs/era20-pilot-icp-qualification-bridge-2026-05-28.md" as const;

export const ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_EXTENDS_POLICIES = [
  PILOT_ICP_CONTRACT_ERA17_POLICY_ID,
  ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID,
  PILOT_GONOGO_ERA17_POLICY_ID,
] as const;

export const ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_CI_SCRIPTS = [
  "test:ci:era20-pilot-icp-qualification-bridge",
  "test:ci:era20-pilot-icp-qualification-bridge:cert",
] as const;

export const ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_UNIT_TESTS = [
  "tests/unit/era20-pilot-icp-qualification-bridge.test.ts",
  "tests/unit/era20-pilot-icp-qualification-bridge-cert-live.test.ts",
] as const;
