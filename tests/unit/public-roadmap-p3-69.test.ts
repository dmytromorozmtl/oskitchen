import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPublicRoadmapP3_69,
  formatPublicRoadmapP3_69AuditLines,
} from "@/lib/marketing/public-roadmap-p3-69-audit";
import { validatePublicRoadmapContract } from "@/lib/marketing/public-roadmap-p3-69-measurement";
import {
  PUBLIC_ROADMAP_P3_69_AUDIT_SCRIPT,
  PUBLIC_ROADMAP_P3_69_CANONICAL_PATH,
  PUBLIC_ROADMAP_P3_69_CHECK_NPM_SCRIPT,
  PUBLIC_ROADMAP_P3_69_DOC,
  PUBLIC_ROADMAP_P3_69_NPM_SCRIPT,
  PUBLIC_ROADMAP_P3_69_NPM_SCRIPTS,
  PUBLIC_ROADMAP_P3_69_POLICY_ID,
  PUBLIC_ROADMAP_P3_69_PRIMARY_KEYWORD,
  PUBLIC_ROADMAP_P3_69_UNIT_TEST,
  publicRoadmapPathsAligned,
} from "@/lib/marketing/public-roadmap-p3-69-policy";

const ROOT = process.cwd();

describe("Public roadmap (P3-69)", () => {
  it("locks canonical /roadmap path", () => {
    expect(PUBLIC_ROADMAP_P3_69_POLICY_ID).toBe("public-roadmap-p3-69-v1");
    expect(PUBLIC_ROADMAP_P3_69_CANONICAL_PATH).toBe("/roadmap");
    expect(PUBLIC_ROADMAP_P3_69_PRIMARY_KEYWORD).toBe("os kitchen roadmap");
    expect(publicRoadmapPathsAligned()).toBe(true);
  });

  it("validates public roadmap contract", () => {
    const validation = validatePublicRoadmapContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.pathsAligned).toBe(true);
    expect(validation.sitemapWired).toBe(true);
    expect(validation.upstreamDocOk).toBe(true);
    expect(validation.wiringOk).toBe(true);
  });

  it("passes full public roadmap audit", () => {
    const summary = auditPublicRoadmapP3_69(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.canonicalPathWired).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatPublicRoadmapP3_69AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, PUBLIC_ROADMAP_P3_69_DOC))).toBe(true);
    expect(existsSync(join(ROOT, PUBLIC_ROADMAP_P3_69_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, PUBLIC_ROADMAP_P3_69_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PUBLIC_ROADMAP_P3_69_NPM_SCRIPT]).toContain(
      "audit-public-roadmap-p3-69.ts",
    );
    expect(pkg.scripts?.[PUBLIC_ROADMAP_P3_69_CHECK_NPM_SCRIPT]).toContain(
      PUBLIC_ROADMAP_P3_69_UNIT_TEST,
    );
    for (const script of PUBLIC_ROADMAP_P3_69_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
