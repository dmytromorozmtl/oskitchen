import { describe, expect, it } from "vitest";

import {
  WEBHOOK_SECURITY_ERA16_CANONICAL_MARKERS,
  WEBHOOK_SECURITY_ERA16_CI_SCRIPTS,
  WEBHOOK_SECURITY_ERA16_COMMERCE_ROUTES,
  WEBHOOK_SECURITY_ERA16_FORBIDDEN_CLAIMS,
  WEBHOOK_SECURITY_ERA16_HONEST_SCOPE,
  WEBHOOK_SECURITY_ERA16_POLICY_ID,
  WEBHOOK_SECURITY_ERA16_ROUTE_COUNT,
} from "@/lib/security/webhook-security-era16-policy";

describe("webhook security era16 policy", () => {
  it("locks era16 webhook security policy id", () => {
    expect(WEBHOOK_SECURITY_ERA16_POLICY_ID).toBe("era16-webhook-security-matrix-v1");
  });

  it("documents honest scope without overclaiming replay monitoring", () => {
    expect(WEBHOOK_SECURITY_ERA16_HONEST_SCOPE.allRoutesInventoried).toBe(true);
    expect(WEBHOOK_SECURITY_ERA16_HONEST_SCOPE.fullReplayMonitoringOps).toBe(false);
    expect(WEBHOOK_SECURITY_ERA16_HONEST_SCOPE.commerceRoutesClassified).toBe(true);
  });

  it("lists commerce-critical webhook routes", () => {
    expect(WEBHOOK_SECURITY_ERA16_COMMERCE_ROUTES).toHaveLength(6);
    expect(WEBHOOK_SECURITY_ERA16_ROUTE_COUNT).toBe(46);
  });

  it("defines canonical markers and forbidden claims", () => {
    expect(WEBHOOK_SECURITY_ERA16_CANONICAL_MARKERS).toContain(
      "era16-webhook-security-matrix-v1",
    );
    expect(WEBHOOK_SECURITY_ERA16_FORBIDDEN_CLAIMS).toContain(
      "full webhook replay monitoring",
    );
    expect(WEBHOOK_SECURITY_ERA16_CI_SCRIPTS).toContain("test:ci:webhook-security-era16:cert");
  });
});
