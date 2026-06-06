import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SENTRY_PRODUCTION_ERA143_CANONICAL_POLICY_ID,
  SENTRY_PRODUCTION_ERA143_CAPABILITIES,
  SENTRY_PRODUCTION_ERA143_DEVELOPER_PATH,
  SENTRY_PRODUCTION_ERA143_POLICY_ID,
  SENTRY_PRODUCTION_ERA143_SUMMARY_ARTIFACT,
  SENTRY_PRODUCTION_ERA143_WIRING_PATHS,
} from "@/lib/observability/sentry-production-era143-policy";
import {
  auditSentryProductionEra143SmokeWiring,
  buildSentryProductionEra143SmokeSummary,
  resolveSentryProductionEra143ProofStatus,
} from "@/lib/observability/sentry-production-era143-smoke-summary";
import { SENTRY_PRODUCTION_ERA70_POLICY_ID } from "@/lib/observability/sentry-production-era70-policy";

const ROOT = process.cwd();

describe("sentry production era143", () => {
  it("locks era143 policy and artifact path", () => {
    expect(SENTRY_PRODUCTION_ERA143_POLICY_ID).toBe("era143-sentry-production-v1");
    expect(SENTRY_PRODUCTION_ERA143_SUMMARY_ARTIFACT).toBe(
      "artifacts/sentry-production-era143-smoke-summary.json",
    );
    expect(SENTRY_PRODUCTION_ERA143_DEVELOPER_PATH).toBe("/dashboard/developer/sentry");
    expect(SENTRY_PRODUCTION_ERA143_WIRING_PATHS).toHaveLength(7);
    expect(SENTRY_PRODUCTION_ERA143_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era143 with canonical Sentry production policy", () => {
    expect(SENTRY_PRODUCTION_ERA143_CANONICAL_POLICY_ID).toBe(SENTRY_PRODUCTION_ERA70_POLICY_ID);
  });

  it("audits in-repo Sentry production wiring", () => {
    const audit = auditSentryProductionEra143SmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of SENTRY_PRODUCTION_ERA143_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes Sentry.init instrumentation and health probe wiring", () => {
    const server = readFileSync(join(ROOT, "sentry.server.config.ts"), "utf8");
    expect(server).toContain("Sentry.init");

    const instrumentation = readFileSync(join(ROOT, "instrumentation.ts"), "utf8");
    expect(instrumentation).toContain("sentry.server.config");
    expect(instrumentation).toContain("captureRequestError");

    const health = readFileSync(join(ROOT, "app/api/health/route.ts"), "utf8");
    expect(health).toContain("sentryServer");

    const push = readFileSync(join(ROOT, "scripts/push-vercel-production-sentry.ts"), "utf8");
    expect(push).toContain("SENTRY_DSN");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveSentryProductionEra143ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveSentryProductionEra143ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildSentryProductionEra143SmokeSummary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("sdk_init");
  });
});
