import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditWorksWithOsKitchenP257,
  formatWorksWithOsKitchenP257AuditLines,
} from "@/lib/marketing/works-with-os-kitchen-p2-57-audit";
import {
  WORKS_WITH_OS_KITCHEN_LIVE_INTEGRATIONS,
  worksWithLogoPublicPath,
} from "@/lib/marketing/works-with-os-kitchen-p2-57-content";
import {
  WORKS_WITH_OS_KITCHEN_P2_57_ARTIFACT,
  WORKS_WITH_OS_KITCHEN_P2_57_CHECK_NPM_SCRIPT,
  WORKS_WITH_OS_KITCHEN_P2_57_CI_NPM_SCRIPT,
  WORKS_WITH_OS_KITCHEN_P2_57_CI_WORKFLOW,
  WORKS_WITH_OS_KITCHEN_P2_57_DOC,
  WORKS_WITH_OS_KITCHEN_P2_57_LIVE_COUNT,
  WORKS_WITH_OS_KITCHEN_P2_57_POLICY_ID,
  WORKS_WITH_OS_KITCHEN_P2_57_PUBLIC_ROUTE,
  WORKS_WITH_OS_KITCHEN_P2_57_UNIT_TEST,
  WORKS_WITH_OS_KITCHEN_P2_57_WIRING_PATHS,
} from "@/lib/marketing/works-with-os-kitchen-p2-57-policy";

const ROOT = process.cwd();

describe("Works with OS Kitchen (P2-57)", () => {
  it("locks policy id, route, and 17 LIVE integrations", () => {
    expect(WORKS_WITH_OS_KITCHEN_P2_57_POLICY_ID).toBe("works-with-os-kitchen-p2-57-v1");
    expect(WORKS_WITH_OS_KITCHEN_P2_57_PUBLIC_ROUTE).toBe("/works-with-os-kitchen");
    expect(WORKS_WITH_OS_KITCHEN_P2_57_LIVE_COUNT).toBe(17);
    expect(WORKS_WITH_OS_KITCHEN_LIVE_INTEGRATIONS).toHaveLength(17);
    expect(WORKS_WITH_OS_KITCHEN_LIVE_INTEGRATIONS.every((c) => c.status === "LIVE")).toBe(true);
  });

  it("has logo SVG for every LIVE integration", () => {
    for (const card of WORKS_WITH_OS_KITCHEN_LIVE_INTEGRATIONS) {
      expect(existsSync(join(ROOT, worksWithLogoPublicPath(card.id)))).toBe(true);
      expect(card.logoAlt).toContain(card.name);
    }
  });

  it("passes full P2-57 works-with audit", () => {
    const summary = auditWorksWithOsKitchenP257(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.gridWired).toBe(true);
    expect(summary.liveCountOk).toBe(true);
    expect(summary.logosPresent).toBe(true);
    expect(summary.registryAligned).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-57 wiring paths, CI gate, and artifact", () => {
    for (const path of WORKS_WITH_OS_KITCHEN_P2_57_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[WORKS_WITH_OS_KITCHEN_P2_57_CHECK_NPM_SCRIPT]).toContain(
      WORKS_WITH_OS_KITCHEN_P2_57_UNIT_TEST,
    );
    expect(pkg.scripts?.[WORKS_WITH_OS_KITCHEN_P2_57_CI_NPM_SCRIPT]).toContain(
      WORKS_WITH_OS_KITCHEN_P2_57_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, WORKS_WITH_OS_KITCHEN_P2_57_CI_WORKFLOW), "utf8");
    expect(ci).toContain(WORKS_WITH_OS_KITCHEN_P2_57_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, WORKS_WITH_OS_KITCHEN_P2_57_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(WORKS_WITH_OS_KITCHEN_P2_57_POLICY_ID);
    expect(artifact.liveCount).toBe(17);
    expect(artifact.integrationIds).toHaveLength(17);

    const doc = readFileSync(join(ROOT, WORKS_WITH_OS_KITCHEN_P2_57_DOC), "utf8");
    expect(doc).toContain(WORKS_WITH_OS_KITCHEN_P2_57_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditWorksWithOsKitchenP257(ROOT);
    const lines = formatWorksWithOsKitchenP257AuditLines(summary);
    expect(lines.some((line) => line.includes(WORKS_WITH_OS_KITCHEN_P2_57_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
