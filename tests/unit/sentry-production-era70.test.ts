import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  SENTRY_PRODUCTION_ERA70_DEVELOPER_PATH,
  SENTRY_PRODUCTION_ERA70_POLICY_ID,
  SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT,
  SENTRY_PRODUCTION_ERA70_WIRING_PATHS,
} from "@/lib/observability/sentry-production-era70-policy";
import {
  auditSentryProductionWiring,
  buildSentryProductionSmokeSummary,
  listMissingSentryProductionEnvVars,
  resolveSentryProductionProofStatus,
} from "@/lib/observability/sentry-production-summary";
import { resolveSentryRelease } from "@/lib/observability/apm";

const ROOT = process.cwd();

describe("sentry production era70", () => {
  it("locks era70 policy and developer path", () => {
    expect(SENTRY_PRODUCTION_ERA70_POLICY_ID).toBe("era70-sentry-production-v1");
    expect(SENTRY_PRODUCTION_ERA70_DEVELOPER_PATH).toBe("/dashboard/developer/sentry");
    expect(SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT).toBe(
      "artifacts/sentry-production-smoke-summary.json",
    );
  });

  it("audits in-repo Sentry production wiring", () => {
    const audit = auditSentryProductionWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of SENTRY_PRODUCTION_ERA70_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("marks proof_passed only when cert, wiring, and DSN are ready", () => {
    expect(
      resolveSentryProductionProofStatus({
        wiringOk: true,
        certPassed: true,
        dsnConfigured: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveSentryProductionProofStatus({
        wiringOk: true,
        certPassed: true,
        dsnConfigured: false,
      }),
    ).toBe("proof_skipped_awaiting_dsn");
  });

  it("detects missing SENTRY_DSN in env", () => {
    expect(listMissingSentryProductionEnvVars({})).toEqual(["SENTRY_DSN"]);
    expect(
      listMissingSentryProductionEnvVars({
        SENTRY_DSN: "https://abc@o123.ingest.sentry.io/456",
      }),
    ).toEqual([]);
  });

  it("builds PASSED summary when DSN configured", () => {
    const summary = buildSentryProductionSmokeSummary({
      certPassed: true,
      env: { SENTRY_DSN: "https://abc@o123.ingest.sentry.io/456" },
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.dsnConfigured).toBe(true);
  });

  it("includes release helper in sentry runtime configs", () => {
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "abcdef1234567890");
    expect(resolveSentryRelease()).toBe("os-kitchen@abcdef123456");
    vi.unstubAllEnvs();

    const server = readFileSync(join(ROOT, "sentry.server.config.ts"), "utf8");
    expect(server).toContain("resolveSentryRelease");
    expect(server).toContain("Sentry.init");
  });

  it("documents smoke orchestrator and developer page", () => {
    expect(existsSync(join(ROOT, "scripts/smoke-sentry-production-era70.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "app/dashboard/developer/sentry/page.tsx"))).toBe(true);
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["smoke:sentry-production"]).toContain("smoke-sentry-production-era70");
  });
});
