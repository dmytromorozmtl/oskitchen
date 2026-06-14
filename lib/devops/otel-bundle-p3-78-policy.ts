/**
 * P3-78 — OpenTelemetry bundle warning: @next/bundle-analyzer + lazy-load OTel SDK.
 *
 * @see docs/otel-bundle-p3-78.md
 */

export const OTEL_BUNDLE_P3_78_POLICY_ID = "otel-bundle-p3-78-v1" as const;

export const OTEL_BUNDLE_P3_78_DOC = "docs/otel-bundle-p3-78.md" as const;

export const OTEL_BUNDLE_P3_78_ARTIFACT = "artifacts/otel-bundle-p3-78.json" as const;

export const OTEL_BUNDLE_P3_78_AUDIT_MODULE = "lib/devops/otel-bundle-p3-78-audit.ts" as const;

export const OTEL_BUNDLE_P3_78_SCORING_MODULE = "lib/devops/otel-bundle-p3-78-scoring.ts" as const;

export const OTEL_BUNDLE_P3_78_SCENARIO_COUNT = 6 as const;

export const OTEL_BUNDLE_P3_78_CHECK_NPM_SCRIPT = "check:otel-bundle-p3-78" as const;

export const OTEL_BUNDLE_P3_78_UNIT_TEST = "tests/unit/otel-bundle-p3-78.test.ts" as const;

export const OTEL_BUNDLE_P3_78_LAZY_LOAD_TEST = "tests/unit/experiment-otel-lazy-load.test.ts" as const;

export const OTEL_BUNDLE_P3_78_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const OTEL_BUNDLE_P3_78_ANALYZE_NPM_SCRIPT = "analyze" as const;

export const OTEL_BUNDLE_P3_78_SERVER_EXTERNAL_PACKAGES = [
  "@opentelemetry/api",
  "@opentelemetry/sdk-trace-node",
  "@opentelemetry/exporter-trace-otlp-http",
  "@opentelemetry/resources",
  "@opentelemetry/semantic-conventions",
  "@opentelemetry/otlp-transformer",
] as const;

/** Hot paths that must never statically import OpenTelemetry (protobufjs bundle warning). */
export const OTEL_BUNDLE_P3_78_NO_STATIC_IMPORT_PATHS = [
  "lib/storefront/experiment-trace.ts",
  "lib/observability/experiment-otel-url.ts",
  "instrumentation.ts",
  "lib/observability/experiment-otel-state.ts",
] as const;

export const OTEL_BUNDLE_P3_78_DYNAMIC_IMPORT_ONLY_PATHS = [
  "lib/observability/experiment-otel-init.ts",
  "lib/observability/experiment-otel-span.ts",
] as const;

export const OTEL_BUNDLE_P3_78_WIRING_PATHS = [
  OTEL_BUNDLE_P3_78_DOC,
  OTEL_BUNDLE_P3_78_ARTIFACT,
  OTEL_BUNDLE_P3_78_AUDIT_MODULE,
  OTEL_BUNDLE_P3_78_SCORING_MODULE,
  OTEL_BUNDLE_P3_78_UNIT_TEST,
  OTEL_BUNDLE_P3_78_LAZY_LOAD_TEST,
  OTEL_BUNDLE_P3_78_CI_WORKFLOW,
  "next.config.ts",
  "instrumentation.ts",
  "lib/observability/experiment-otel-init.ts",
  "lib/observability/experiment-otel-span.ts",
  "lib/storefront/experiment-trace.ts",
] as const;
