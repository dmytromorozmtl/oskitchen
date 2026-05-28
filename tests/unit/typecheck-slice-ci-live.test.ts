import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  TYPECHECK_FULL_SCRIPT,
  TYPECHECK_SLICE_CI_SCRIPTS,
  TYPECHECK_SLICE_POLICY_ID,
  TYPECHECK_SLICES,
} from "@/lib/ci/typecheck-slice-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("typecheck slice CI certification (live repo)", () => {
  it("locks era5 typecheck slice policy", () => {
    expect(TYPECHECK_SLICE_POLICY_ID).toBe("era5-typecheck-slice-v2");
    expect(TYPECHECK_SLICES.map((s) => s.id)).toEqual([
      "services-core",
      "dashboard-services-api",
      "storefront-marketing",
    ]);
  });

  it("defines full typecheck and slice scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts.typecheck).toContain(TYPECHECK_FULL_SCRIPT);
    expect(scripts[TYPECHECK_FULL_SCRIPT]).toContain("tsconfig.typecheck.json");
    expect(scripts["typecheck:slice:services-core"]).toContain("tsconfig.slice.services-core.json");
    expect(scripts["typecheck:slice:services-core"]).toContain("6144");
    expect(scripts["typecheck:slice:dashboard-services-api"]).toContain(
      "tsconfig.slice.dashboard-services-api.json",
    );
    expect(scripts["typecheck:slice:dashboard-services-api"]).toContain("6144");
    expect(scripts["typecheck:slice:storefront-marketing"]).toContain(
      "tsconfig.slice.storefront-marketing.json",
    );
    expect(scripts["typecheck:slice:storefront-marketing"]).toContain("6144");
    for (const name of TYPECHECK_SLICE_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("includes typecheck slice cert in governance bundles", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:typecheck-slice:cert");
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:typecheck-slice");
  });

  it("has tsconfig base and slice configs on disk", () => {
    expect(existsSync(join(ROOT, "tsconfig.base.json"))).toBe(true);
    for (const slice of TYPECHECK_SLICES) {
      expect(existsSync(join(ROOT, slice.tsconfig)), slice.tsconfig).toBe(true);
    }
    const main = JSON.parse(readFileSync(join(ROOT, "tsconfig.json"), "utf8")) as {
      extends?: string;
    };
    expect(main.extends).toBe("./tsconfig.base.json");
  });

  it("documents typecheck slices in devops readiness", () => {
    const devops = readFileSync(join(ROOT, "docs/devops-release-enterprise-readiness.md"), "utf8");
    expect(devops).toContain("era5-typecheck-slice-v2");
    expect(devops).toContain("typecheck:slice:dashboard-services-api");
    expect(devops).toContain("typecheck:slice:storefront-marketing");
    expect(devops).toMatch(/typecheck:full|8192/);
  });
});
