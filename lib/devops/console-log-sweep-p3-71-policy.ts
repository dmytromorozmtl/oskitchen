/**
 * Blueprint P3-71 — Console.log sweep (production runtime paths).
 *
 * @see docs/console-log-audit.md
 * @see docs/console-log-sweep-p3-71.md
 */

import {
  CONSOLE_LOG_SWEEP_POLICY_ID,
  CONSOLE_LOG_SWEEP_RUNTIME_DIRS,
  CONSOLE_LOG_SWEEP_SUMMARY_ARTIFACT,
  CONSOLE_LOG_SWEEP_UNIT_TEST,
} from "@/lib/devops/console-log-sweep-policy";

export const CONSOLE_LOG_SWEEP_P3_71_POLICY_ID = "console-log-sweep-p3-71-v1" as const;

export const CONSOLE_LOG_SWEEP_P3_71_DOC = "docs/console-log-sweep-p3-71.md" as const;

export const CONSOLE_LOG_SWEEP_P3_71_ARTIFACT =
  "artifacts/console-log-sweep-p3-71-registry.json" as const;

export const CONSOLE_LOG_SWEEP_P3_71_AUDIT_SCRIPT =
  "scripts/audit-console-log-sweep-p3-71.ts" as const;

export const CONSOLE_LOG_SWEEP_P3_71_NPM_SCRIPT = "audit:console-log-sweep-p3-71" as const;

export const CONSOLE_LOG_SWEEP_P3_71_CHECK_NPM_SCRIPT =
  "check:console-log-sweep-p3-71" as const;

export const CONSOLE_LOG_SWEEP_P3_71_UNIT_TEST =
  "tests/unit/console-log-sweep-p3-71.test.ts" as const;

export const CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_POLICY_ID = CONSOLE_LOG_SWEEP_POLICY_ID;

export const CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_DOC = "docs/console-log-audit.md" as const;

export const CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_TEST = CONSOLE_LOG_SWEEP_UNIT_TEST;

export const CONSOLE_LOG_SWEEP_P3_71_NPM_SCRIPTS = [
  "test:ci:console-log-sweep",
  "test:ci:console-log-sweep:cert",
  "audit:console-log-surface",
] as const;

export const CONSOLE_LOG_SWEEP_P3_71_WIRING_PATHS = [
  CONSOLE_LOG_SWEEP_P3_71_DOC,
  CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_DOC,
  "lib/devops/console-log-surface-audit.ts",
  "lib/devops/console-log-sweep-p3-71-measurement.ts",
  "lib/devops/console-log-sweep-p3-71-audit.ts",
  "scripts/audit-console-log-surface.ts",
  CONSOLE_LOG_SWEEP_P3_71_UNIT_TEST,
  CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_TEST,
  CONSOLE_LOG_SWEEP_P3_71_ARTIFACT,
  CONSOLE_LOG_SWEEP_SUMMARY_ARTIFACT,
  "eslint.config.mjs",
] as const;

export const CONSOLE_LOG_SWEEP_P3_71_RUNTIME_DIRS = CONSOLE_LOG_SWEEP_RUNTIME_DIRS;
