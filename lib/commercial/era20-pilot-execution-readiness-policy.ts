/**
 * Era 20 — Pilot execution readiness (metrics baseline + rollback + support).
 */

import { PILOT_METRICS_BASELINE_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-metrics-baseline-era17-policy";
import { PILOT_ROLLBACK_DRILL_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-rollback-drill-era17-policy";
import { ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID } from "@/lib/commercial/era20-first-paid-pilot-package-policy";

export const ERA20_PILOT_EXECUTION_READINESS_POLICY_ID =
  "era20-pilot-execution-readiness-v1" as const;

export const ERA20_PILOT_EXECUTION_READINESS_BACKLOG_ID = "KOS-E20-009" as const;

export const ERA20_PILOT_EXECUTION_READINESS_DOC =
  "docs/era20-pilot-execution-readiness-2026-05-28.md" as const;

export const ERA20_PILOT_EXECUTION_READINESS_EXTENDS_POLICIES = [
  ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID,
  "era17-pilot-metrics-baseline-v1",
  "era17-pilot-rollback-drill-v1",
  "era17-pilot-gono-go-v1",
] as const;

export const ERA20_PILOT_EXECUTION_READINESS_INPUT_ARTIFACTS = [
  PILOT_METRICS_BASELINE_ERA17_SUMMARY_ARTIFACT,
  PILOT_ROLLBACK_DRILL_ERA17_SUMMARY_ARTIFACT,
  "artifacts/pilot-gono-go-summary.json",
  "artifacts/pilot-forbidden-claims-enforcement-summary.json",
] as const;

export const ERA20_PILOT_EXECUTION_READINESS_CI_SCRIPTS = [
  "test:ci:era20-pilot-execution-readiness",
  "test:ci:era20-pilot-execution-readiness:cert",
] as const;

export const ERA20_PILOT_EXECUTION_READINESS_UNIT_TESTS = [
  "tests/unit/era20-pilot-execution-readiness.test.ts",
  "tests/unit/era20-pilot-execution-readiness-cert-live.test.ts",
] as const;
