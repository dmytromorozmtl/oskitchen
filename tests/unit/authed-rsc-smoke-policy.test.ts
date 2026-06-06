import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  AUTHED_DASHBOARD_RSC_SMOKE_POLICY_ID,
  AUTHED_DASHBOARD_RSC_SMOKE_ROUTES,
} from "@/lib/smoke/authed-dashboard-rsc-routes";
import {
  detectRscFailure,
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

  it("wires npm script, probe CLI, and GHA workflow", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["smoke:rsc-authed-dashboard"]).toContain("probe-authed-dashboard.ts");

    const workflow = readFileSync(join(ROOT, ".github/workflows/rsc-smoke.yml"), "utf8");
    expect(workflow).toContain("smoke:rsc-authed-dashboard");
    expect(workflow).toContain("46 dashboard routes");
    expect(workflow).toContain("E2E_LOGIN_EMAIL");

    const probe = readFileSync(join(ROOT, "scripts/probe-authed-dashboard.ts"), "utf8");
    expect(probe).toContain("runAuthedDashboardRscProbe");
    expect(probe).toContain("resolveAuthedDashboardProbePaths");
  });
});
