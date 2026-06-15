import { describe, expect, it } from "vitest";

import {
  evaluateSentryProductionHealth,
  parseSentryServerCheck,
} from "@/scripts/verify-sentry-production-health";

describe("verify-sentry-production-health", () => {
  it("parses sentryServer from health payload", () => {
    const sentry = parseSentryServerCheck({
      checks: { sentryServer: { ok: true, configured: true, status: "live" } },
    });
    expect(sentry).toEqual({ ok: true, configured: true, status: "live" });
  });

  it("passes when sentryServer.ok is true", () => {
    const result = evaluateSentryProductionHealth({ ok: true, configured: true, status: "live" });
    expect(result.ok).toBe(true);
  });

  it("fails when sentry is not configured", () => {
    const result = evaluateSentryProductionHealth({
      ok: false,
      configured: false,
      status: "not_configured",
    });
    expect(result.ok).toBe(false);
  });
});
