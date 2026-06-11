import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditPreviewRoutesHidden } from "@/lib/navigation/preview-route-audit";
import {
  isBlockedPreviewDashboardRoute,
  isPreviewRouteBlockExposure,
} from "@/lib/navigation/preview-route-guard";
import {
  PREVIEW_ROUTE_GUARD_CI_WORKFLOW,
  PREVIEW_ROUTE_GUARD_EXPECTED_MIN,
  PREVIEW_ROUTE_GUARD_NPM_SCRIPT,
  PREVIEW_ROUTE_GUARD_POLICY_ID,
  PREVIEW_ROUTE_GUARD_UNIT_TEST,
} from "@/lib/navigation/preview-route-guard-policy";

const ROOT = process.cwd();

describe("preview route guard (P1-40)", () => {
  it("locks policy id and blocks non-default exposures", () => {
    expect(PREVIEW_ROUTE_GUARD_POLICY_ID).toBe("preview-route-guard-p1-40-v1");
    expect(isPreviewRouteBlockExposure("preview")).toBe(true);
    expect(isPreviewRouteBlockExposure("hidden_default")).toBe(true);
    expect(isPreviewRouteBlockExposure("default")).toBe(false);
    expect(isBlockedPreviewDashboardRoute("/dashboard/copilot")).toBe(true);
    expect(isBlockedPreviewDashboardRoute("/dashboard/today")).toBe(false);
  });

  it("audits ≥280 guarded dashboard routes", () => {
    const summary = auditPreviewRoutesHidden(ROOT);
    expect(summary.blockedRouteCount).toBeGreaterThanOrEqual(PREVIEW_ROUTE_GUARD_EXPECTED_MIN);
    expect(summary.passed).toBe(true);
  });

  it("registers middleware guard, npm script, and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PREVIEW_ROUTE_GUARD_NPM_SCRIPT]).toContain(
      "audit-preview-routes-hidden.ts",
    );
    expect(pkg.scripts?.["test:ci:preview-route-guard"]).toContain(PREVIEW_ROUTE_GUARD_UNIT_TEST);

    const middleware = readFileSync(join(ROOT, "middleware.ts"), "utf8");
    expect(middleware).toContain("enforcePreviewRouteGuard");

    const guard = readFileSync(join(ROOT, "lib/navigation/preview-route-guard.ts"), "utf8");
    expect(guard).toContain("PREVIEW_ROUTE_GUARD_REDIRECT_PATH");
    expect(guard).toContain("previewRouteRedirectUrl");

    const workflow = readFileSync(join(ROOT, PREVIEW_ROUTE_GUARD_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:preview-routes-hidden");
  });
});
