import { readFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AUTHED_DASHBOARD_RSC_SMOKE_POLICY_ID,
  AUTHED_DASHBOARD_RSC_SMOKE_ROUTES,
} from "@/lib/smoke/authed-dashboard-rsc-routes";
import {
  detectRscFailure,
  probeAuthedDashboardPath,
  resolveAuthedDashboardProbePaths,
} from "@/lib/smoke/probe-authed-dashboard-rsc";

const ROOT = process.cwd();

describe("authed dashboard RSC smoke policy", () => {
  it("locks 46 pilot-critical dashboard routes", () => {
    expect(AUTHED_DASHBOARD_RSC_SMOKE_POLICY_ID).toBe("authed-dashboard-rsc-smoke-v1");
    expect(AUTHED_DASHBOARD_RSC_SMOKE_ROUTES).toHaveLength(46);
    expect(AUTHED_DASHBOARD_RSC_SMOKE_ROUTES[0]).toBe("/dashboard/today");
    expect(AUTHED_DASHBOARD_RSC_SMOKE_ROUTES.at(-1)).toBe("/dashboard/menu/universal");
  });

  it("defaults probe paths to the full route list", () => {
    expect(resolveAuthedDashboardProbePaths([])).toEqual(AUTHED_DASHBOARD_RSC_SMOKE_ROUTES);
    expect(resolveAuthedDashboardProbePaths(["/dashboard/today"])).toEqual(["/dashboard/today"]);
  });

  it("detects RSC crash markers in response bodies", () => {
    expect(detectRscFailure("<html>ok</html>").failed).toBe(false);
    expect(
      detectRscFailure("Something went wrong while loading this page").failed,
    ).toBe(true);
    expect(
      detectRscFailure("An error occurred in the Server Components render").failed,
    ).toBe(true);
  });

  it("flags HTTP 500 responses as probe failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 500,
        url: "https://example.com/dashboard/today",
        text: async () => "Internal Server Error",
      }),
    );

    const result = await probeAuthedDashboardPath({
      baseUrl: "https://example.com",
      cookie: "test=1",
      path: "/dashboard/today",
      mode: "document",
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
    expect(result.error).toBe("HTTP 500");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("wires npm script, probe CLI, and GHA workflows on every PR", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["smoke:rsc-authed-dashboard"]).toContain("probe-authed-dashboard.ts");

    const workflow = readFileSync(join(ROOT, ".github/workflows/rsc-smoke.yml"), "utf8");
    expect(workflow).toContain("smoke:rsc-authed-dashboard");
    expect(workflow).toContain("46 dashboard routes");
    expect(workflow).toContain("E2E_LOGIN_EMAIL");
    expect(workflow).not.toContain("paths:");

    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    expect(ci).toContain("authed-rsc-smoke:");
    expect(ci).toContain("smoke:rsc-authed-dashboard");

    const probe = readFileSync(join(ROOT, "scripts/probe-authed-dashboard.ts"), "utf8");
    expect(probe).toContain("runAuthedDashboardRscProbe");
    expect(probe).toContain("resolveAuthedDashboardProbePaths");
  });
});
