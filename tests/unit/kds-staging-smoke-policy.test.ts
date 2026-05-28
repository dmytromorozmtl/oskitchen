import { describe, expect, it } from "vitest";

import {
  KDS_STAGING_SMOKE_AUTOMATED_STAGES,
  KDS_STAGING_SMOKE_FORBIDDEN_CLAIMS,
  KDS_STAGING_SMOKE_HONEST_SCOPE,
  KDS_STAGING_SMOKE_POLICY_ID,
  KDS_V1_CI_PREREQUISITES,
} from "@/lib/kitchen/kds-staging-smoke-policy";

describe("KDS staging smoke policy", () => {
  it("locks era4 policy id", () => {
    expect(KDS_STAGING_SMOKE_POLICY_ID).toBe("era4-kds-staging-smoke-v1");
  });

  it("documents automated stages without rush-hour claims", () => {
    expect(KDS_STAGING_SMOKE_AUTOMATED_STAGES).toContain("queue_ticket_visible");
    expect(KDS_STAGING_SMOKE_AUTOMATED_STAGES).toContain("bump_to_ready");
    expect(KDS_STAGING_SMOKE_HONEST_SCOPE.rushHourCertified).toBe(false);
    expect(KDS_STAGING_SMOKE_HONEST_SCOPE.realtimePlaywrightCertified).toBe(false);
  });

  it("points to staging checklist and DB smoke script", () => {
    expect(KDS_STAGING_SMOKE_HONEST_SCOPE.stagingChecklistDoc).toBe(
      "docs/kds-staging-smoke-checklist.md",
    );
    expect(KDS_STAGING_SMOKE_HONEST_SCOPE.stagingDbSmokeScript).toBe(
      "scripts/smoke-kds-daily-service.ts",
    );
  });

  it("references KDS v1 CI prerequisites", () => {
    expect(KDS_V1_CI_PREREQUISITES).toContain("test:ci:kds-v1:integration");
  });

  it("forbids rush-hour and Toast-class KDS marketing claims", () => {
    const bad = [
      "rush-hour certified KDS",
      "multi-station certified routing",
      "realtime E2E certified",
      "Toast-class KDS",
    ];
    for (const text of bad) {
      const hit = KDS_STAGING_SMOKE_FORBIDDEN_CLAIMS.some((re) => re.test(text));
      expect(hit, text).toBe(true);
    }
  });
});
