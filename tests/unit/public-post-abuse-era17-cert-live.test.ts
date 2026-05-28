import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PUBLIC_POST_ABUSE_ERA17_BILLING_RATE_MODULE,
  PUBLIC_POST_ABUSE_ERA17_CANONICAL_DOC_PATHS,
  PUBLIC_POST_ABUSE_ERA17_CANONICAL_MARKERS,
  PUBLIC_POST_ABUSE_ERA17_CI_SCRIPTS,
  PUBLIC_POST_ABUSE_ERA17_DOC,
  PUBLIC_POST_ABUSE_ERA17_GUARD_MODULE,
  PUBLIC_POST_ABUSE_ERA17_HARDENED_ROUTES,
  PUBLIC_POST_ABUSE_ERA17_MATRIX_MODULE,
  PUBLIC_POST_ABUSE_ERA17_POLICY_ID,
  PUBLIC_POST_ABUSE_ERA17_REVIEW_SECTION,
  PUBLIC_POST_ABUSE_ERA17_UNIT_TESTS,
} from "@/lib/security/public-post-abuse-era17-policy";

const ROOT = process.cwd();

const ROUTE_FILES: Record<string, string> = {
  "/api/storefront/experiment/auto-conclude/approve":
    "app/api/storefront/experiment/auto-conclude/approve/route.ts",
  "/api/storefront/experiment/auto-conclude/reject":
    "app/api/storefront/experiment/auto-conclude/reject/route.ts",
  "/api/storefront/experiment/orchestrator/approve":
    "app/api/storefront/experiment/orchestrator/approve/route.ts",
  "/api/iot/temperature": "app/api/iot/temperature/route.ts",
  "/api/billing/portal": "app/api/billing/portal/route.ts",
  "/api/billing-portal": "app/api/billing-portal/route.ts",
};

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("public POST abuse era17 CI certification (live repo)", () => {
  it("locks era17 public POST abuse policy id", () => {
    expect(PUBLIC_POST_ABUSE_ERA17_POLICY_ID).toBe("era17-public-post-abuse-v1");
  });

  it("defines era17 public POST abuse cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of PUBLIC_POST_ABUSE_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:public-post-fail-closed"]).toContain(
      "public-post-abuse-era17-cert-live",
    );
  });

  it("wires guards into hardened route modules", () => {
    expect(existsSync(join(ROOT, PUBLIC_POST_ABUSE_ERA17_MATRIX_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, PUBLIC_POST_ABUSE_ERA17_GUARD_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, PUBLIC_POST_ABUSE_ERA17_BILLING_RATE_MODULE))).toBe(true);

    for (const path of PUBLIC_POST_ABUSE_ERA17_HARDENED_ROUTES) {
      const rel = ROUTE_FILES[path];
      expect(rel, path).toBeTruthy();
      const source = readFileSync(join(ROOT, rel!), "utf8");
      if (path.includes("experiment")) {
        expect(source, path).toContain("enforceStorefrontRouteRateLimit");
      } else if (path.includes("iot")) {
        expect(source, path).toContain("enforceIngestRateLimit");
      } else if (path.includes("billing")) {
        expect(source, path).toContain("enforceBillingApiRateLimit");
      }
    }
  });

  it("documents era17 public POST abuse in canonical docs", () => {
    expect(existsSync(join(ROOT, PUBLIC_POST_ABUSE_ERA17_DOC))).toBe(true);
    for (const rel of PUBLIC_POST_ABUSE_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(PUBLIC_POST_ABUSE_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(PUBLIC_POST_ABUSE_ERA17_REVIEW_SECTION);
    for (const marker of PUBLIC_POST_ABUSE_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PUBLIC_POST_ABUSE_ERA17_POLICY_ID);
    for (const rel of PUBLIC_POST_ABUSE_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
