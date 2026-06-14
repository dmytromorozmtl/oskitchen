import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  AUTHED_DASHBOARD_RSC_SMOKE_ROUTES,
} from "@/lib/smoke/authed-dashboard-rsc-routes";
import {
  AUTHED_RSC_PROBE_P0_12_ARTIFACT,
  AUTHED_RSC_PROBE_P0_12_CHECK_NPM_SCRIPT,
  AUTHED_RSC_PROBE_P0_12_CI_NPM_SCRIPT,
  AUTHED_RSC_PROBE_P0_12_DOC,
  AUTHED_RSC_PROBE_P0_12_EXTENDS_POLICY_ID,
  AUTHED_RSC_PROBE_P0_12_NPM_SCRIPT,
  AUTHED_RSC_PROBE_P0_12_POLICY_ID,
  AUTHED_RSC_PROBE_P0_12_PROBE_MODES,
  AUTHED_RSC_PROBE_P0_12_PROBE_SCRIPT,
  AUTHED_RSC_PROBE_P0_12_ROUTE_COUNT,
  AUTHED_RSC_PROBE_P0_12_TOTAL_PROBES,
  AUTHED_RSC_PROBE_P0_12_WIRING_PATHS,
  AUTHED_RSC_PROBE_P0_12_WORKFLOW_PATHS,
} from "@/lib/smoke/authed-rsc-probe-p0-12-policy";

const ROOT = process.cwd();

describe("authed dashboard RSC probe (P0-12)", () => {
  it("locks P0-12 policy, 46 routes, and document + RSC probe modes", () => {
    expect(AUTHED_RSC_PROBE_P0_12_POLICY_ID).toBe("p0-12-authed-rsc-probe-v1");
    expect(AUTHED_RSC_PROBE_P0_12_EXTENDS_POLICY_ID).toBe("authed-dashboard-rsc-smoke-v1");
    expect(AUTHED_RSC_PROBE_P0_12_ROUTE_COUNT).toBe(46);
    expect(AUTHED_DASHBOARD_RSC_SMOKE_ROUTES).toHaveLength(46);
    expect(AUTHED_RSC_PROBE_P0_12_PROBE_MODES).toEqual(["document", "rsc"]);
    expect(AUTHED_RSC_PROBE_P0_12_TOTAL_PROBES).toBe(92);
  });

  it("documents P0-12 and wires probe + workflow paths", () => {
    for (const rel of AUTHED_RSC_PROBE_P0_12_WIRING_PATHS) {
      if (rel.endsWith(".json")) continue;
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }

    const doc = readFileSync(join(ROOT, AUTHED_RSC_PROBE_P0_12_DOC), "utf8");
    expect(doc).toContain(AUTHED_RSC_PROBE_P0_12_POLICY_ID);
    expect(doc).toContain("46 pilot-critical dashboard routes");
    expect(doc).toContain(AUTHED_RSC_PROBE_P0_12_NPM_SCRIPT);

    const probe = readFileSync(join(ROOT, AUTHED_RSC_PROBE_P0_12_PROBE_SCRIPT), "utf8");
    expect(probe).toContain("runAuthedDashboardRscProbe");
    expect(probe).toContain("signInForDashboardProbe");
  });

  it("wires npm script, check script, artifact, and GHA workflows", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[AUTHED_RSC_PROBE_P0_12_NPM_SCRIPT]).toContain("probe-authed-dashboard.ts");
    expect(pkg.scripts?.[AUTHED_RSC_PROBE_P0_12_CHECK_NPM_SCRIPT]).toContain(
      "authed-rsc-probe-p0-12.test.ts",
    );
    expect(pkg.scripts?.[AUTHED_RSC_PROBE_P0_12_CI_NPM_SCRIPT]).toContain(
      "authed-rsc-probe-p0-12.test.ts",
    );

    for (const workflowPath of AUTHED_RSC_PROBE_P0_12_WORKFLOW_PATHS) {
      const workflow = readFileSync(join(ROOT, workflowPath), "utf8");
      expect(workflow).toContain(AUTHED_RSC_PROBE_P0_12_NPM_SCRIPT);
      expect(workflow).toContain("46 dashboard routes");
    }

    const artifact = JSON.parse(
      readFileSync(join(ROOT, AUTHED_RSC_PROBE_P0_12_ARTIFACT), "utf8"),
    ) as { policyId: string; routeCount: number; totalProbes: number };
    expect(artifact.policyId).toBe(AUTHED_RSC_PROBE_P0_12_POLICY_ID);
    expect(artifact.routeCount).toBe(46);
    expect(artifact.totalProbes).toBe(92);
  });
});
