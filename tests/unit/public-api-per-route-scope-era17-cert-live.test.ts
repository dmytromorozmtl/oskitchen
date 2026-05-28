import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_CANONICAL_DOC_PATHS,
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_CANONICAL_MARKERS,
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_CI_SCRIPTS,
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_ORCHESTRATOR_SCRIPT,
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_POLICY_ID,
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_REVIEW_SECTION,
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_UNIT_TESTS,
} from "@/lib/api-public/public-api-per-route-scope-era17-policy";

const ROOT = process.cwd();
const V1_RESOURCES = [
  "products",
  "customers",
  "orders",
  "inventory",
  "locations",
  "recipes",
  "staff",
  "webhooks",
] as const;

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("public API per-route scope era17 CI certification (live repo)", () => {
  it("locks era17 public API per-route scope policy id", () => {
    expect(PUBLIC_API_PER_ROUTE_SCOPE_ERA17_POLICY_ID).toBe(
      "era17-public-api-per-route-scope-v1",
    );
  });

  it("defines era17 public API per-route scope scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:public-api-per-route-scope"]).toContain(
      PUBLIC_API_PER_ROUTE_SCOPE_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of PUBLIC_API_PER_ROUTE_SCOPE_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:public-api-v1:cert"]).toContain(
      "public-api-per-route-scope-era17-cert-live",
    );
  });

  it("guards all eight v1 resources with guardPublicApiV1Resource", () => {
    const guard = readFileSync(join(ROOT, "lib/api-public/guard.ts"), "utf8");
    expect(guard).toContain("guardPublicApiV1Resource");
    expect(guard).toContain("requiredScope");
    expect(guard).toContain("status: 403");

    for (const resource of V1_RESOURCES) {
      const routePath = join(ROOT, `app/api/public/v1/${resource}/route.ts`);
      const source = readFileSync(routePath, "utf8");
      expect(source, resource).toContain("guardPublicApiV1Resource");
      expect(source, resource).toContain("isGuardError");
    }
  });

  it("documents era17 public API per-route scope in canonical docs", () => {
    expect(existsSync(join(ROOT, PUBLIC_API_PER_ROUTE_SCOPE_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    for (const rel of PUBLIC_API_PER_ROUTE_SCOPE_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(
        PUBLIC_API_PER_ROUTE_SCOPE_ERA17_POLICY_ID.toLowerCase(),
      );
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(PUBLIC_API_PER_ROUTE_SCOPE_ERA17_REVIEW_SECTION);
    for (const marker of PUBLIC_API_PER_ROUTE_SCOPE_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PUBLIC_API_PER_ROUTE_SCOPE_ERA17_POLICY_ID);
    for (const rel of PUBLIC_API_PER_ROUTE_SCOPE_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
