import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditArchiveEraScriptsP376,
  formatArchiveEraScriptsP376AuditLines,
} from "@/lib/devops/archive-era-scripts-p3-76-audit";
import {
  ARCHIVE_ERA_SCRIPTS_P3_76_ARTIFACT,
  ARCHIVE_ERA_SCRIPTS_P3_76_BASELINE_SCRIPT_COUNT,
  ARCHIVE_ERA_SCRIPTS_P3_76_CHECK_NPM_SCRIPT,
  ARCHIVE_ERA_SCRIPTS_P3_76_CI_NPM_SCRIPT,
  ARCHIVE_ERA_SCRIPTS_P3_76_CI_WORKFLOW,
  ARCHIVE_ERA_SCRIPTS_P3_76_DOC,
  ARCHIVE_ERA_SCRIPTS_P3_76_MAX_ACTIVE_SCRIPTS,
  ARCHIVE_ERA_SCRIPTS_P3_76_POLICY_ID,
  ARCHIVE_ERA_SCRIPTS_P3_76_UNIT_TEST,
  ARCHIVE_ERA_SCRIPTS_P3_76_WIRING_PATHS,
} from "@/lib/devops/archive-era-scripts-p3-76-policy";
import { runArchiveEraScriptsBenchmarkP376 } from "@/lib/devops/archive-era-scripts-p3-76-scoring";

const ROOT = process.cwd();

describe("Archive era npm scripts (P3-76)", () => {
  it("locks P3-76 policy and max active script target", () => {
    expect(ARCHIVE_ERA_SCRIPTS_P3_76_POLICY_ID).toBe("archive-era-scripts-p3-76-v1");
    expect(ARCHIVE_ERA_SCRIPTS_P3_76_MAX_ACTIVE_SCRIPTS).toBe(500);
    expect(ARCHIVE_ERA_SCRIPTS_P3_76_BASELINE_SCRIPT_COUNT).toBe(1902);
  });

  it("passes archive era scripts benchmark with live counts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    const activeKeys = Object.keys(pkg.scripts ?? {});
    const archiveKeys = Object.keys(archive.scripts ?? {});

    const benchmark = runArchiveEraScriptsBenchmarkP376({
      activeScriptCount: activeKeys.length,
      archivedScriptCount: archiveKeys.length,
      eraInArchiveCount: archiveKeys.filter((k) => /era[0-9]/i.test(k)).length,
      eraInActiveCount: activeKeys.filter((k) => /era[0-9]/i.test(k)).length,
      sprawlInActive: activeKeys.filter((name) => {
        const prefixes = [
          "test:ci",
          "ops",
          "smoke",
          "audit",
          "workspace",
          "storefront",
          "beta",
          "staging",
          "pilot",
          "verify",
          "validate",
          "cert",
        ];
        return prefixes.some((prefix) => name.startsWith(`${prefix}:`));
      }).length,
      routerPrefixesPresent: ["test:ci", "audit", "smoke"].every((prefix) =>
        pkg.scripts?.[prefix]?.includes("npm-script-router.ts"),
      ),
    });

    expect(benchmark.passPct).toBe(100);
    expect(benchmark.passed).toBe(true);
  });

  it("passes full P3-76 archive era scripts audit", () => {
    const summary = auditArchiveEraScriptsP376(ROOT);
    expect(summary.activeScriptCount).toBeLessThan(ARCHIVE_ERA_SCRIPTS_P3_76_MAX_ACTIVE_SCRIPTS);
    expect(summary.eraInActiveCount).toBe(0);
    expect(summary.eraInArchiveCount).toBeGreaterThan(0);
    expect(summary.routerPrefixesPresent).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-76 wiring paths, CI gate, and artifact", () => {
    for (const path of ARCHIVE_ERA_SCRIPTS_P3_76_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[ARCHIVE_ERA_SCRIPTS_P3_76_CHECK_NPM_SCRIPT]).toContain(
      ARCHIVE_ERA_SCRIPTS_P3_76_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, ARCHIVE_ERA_SCRIPTS_P3_76_CI_WORKFLOW), "utf8");
    expect(ci).toContain(ARCHIVE_ERA_SCRIPTS_P3_76_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, ARCHIVE_ERA_SCRIPTS_P3_76_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(ARCHIVE_ERA_SCRIPTS_P3_76_POLICY_ID);
    expect(artifact.afterActive).toBeLessThan(500);

    const doc = readFileSync(join(ROOT, ARCHIVE_ERA_SCRIPTS_P3_76_DOC), "utf8");
    expect(doc).toContain(ARCHIVE_ERA_SCRIPTS_P3_76_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditArchiveEraScriptsP376(ROOT);
    const lines = formatArchiveEraScriptsP376AuditLines(summary);
    expect(lines.some((line) => line.includes(ARCHIVE_ERA_SCRIPTS_P3_76_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
