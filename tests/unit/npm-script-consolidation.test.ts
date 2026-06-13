import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  NPM_SCRIPT_ARCHIVE_PATH,
  NPM_SCRIPT_CONSOLIDATION_MAX_SCRIPTS,
  NPM_SCRIPT_CONSOLIDATION_POLICY_ID,
  NPM_SCRIPT_CONSOLIDATION_UNIT_TEST,
  NPM_SCRIPT_ROUTER_PREFIXES,
  findRouterPrefixForScript,
  resolveArchivedScriptKey,
} from "@/lib/devops/npm-script-consolidation-policy";

const ROOT = process.cwd();

describe("npm script consolidation (P1-16)", () => {
  it("locks policy id and <200 script target", () => {
    expect(NPM_SCRIPT_CONSOLIDATION_POLICY_ID).toBe("npm-script-consolidation-p1-16-v1");
    expect(NPM_SCRIPT_CONSOLIDATION_MAX_SCRIPTS).toBe(200);
    expect(NPM_SCRIPT_ROUTER_PREFIXES.length).toBeGreaterThanOrEqual(10);
  });

  it("keeps package.json scripts under 200 with router prefixes", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    const count = Object.keys(pkg.scripts ?? {}).length;
    expect(count).toBeLessThan(NPM_SCRIPT_CONSOLIDATION_MAX_SCRIPTS);

    for (const prefix of NPM_SCRIPT_ROUTER_PREFIXES) {
      expect(pkg.scripts?.[prefix]).toContain("npm-script-router.ts");
    }
  });

  it("archives sprawl prefixes and resolves router keys", () => {
    expect(existsSync(join(ROOT, NPM_SCRIPT_ARCHIVE_PATH))).toBe(true);
    const archive = JSON.parse(readFileSync(join(ROOT, NPM_SCRIPT_ARCHIVE_PATH), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(Object.keys(archive.scripts).length).toBeGreaterThan(1500);

    const sampleKey = resolveArchivedScriptKey("test:ci", "webhook-security-era16");
    expect(archive.scripts[sampleKey]).toContain("vitest");
    expect(findRouterPrefixForScript(sampleKey)).toBe("test:ci");
  });

  it("registers consolidation test script and wiring", () => {
    expect(existsSync(join(ROOT, "scripts/consolidate-npm-scripts.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "scripts/npm-script-router.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "scripts/audit-npm-script-surface.ts"))).toBe(true);
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["check:npm-script-surface"]).toContain("audit-npm-script-surface.ts");
  });
});
