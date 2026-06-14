import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAdvisoryBoardPageP386,
  formatAdvisoryBoardPageP386AuditLines,
} from "@/lib/marketing/advisory-board-page-p3-86-audit";
import { ADVISORY_BOARD_PAGE_P3_86_RECRUITING_COPY } from "@/lib/marketing/advisory-board-page-p3-86-content";
import {
  ADVISORY_BOARD_PAGE_P3_86_ARTIFACT,
  ADVISORY_BOARD_PAGE_P3_86_CHECK_NPM_SCRIPT,
  ADVISORY_BOARD_PAGE_P3_86_CI_WORKFLOW,
  ADVISORY_BOARD_PAGE_P3_86_DOC,
  ADVISORY_BOARD_PAGE_P3_86_PAGE_MODE,
  ADVISORY_BOARD_PAGE_P3_86_POLICY_ID,
  ADVISORY_BOARD_PAGE_P3_86_PUBLISHED_MEMBER_COUNT,
  ADVISORY_BOARD_PAGE_P3_86_ROUTE,
  ADVISORY_BOARD_PAGE_P3_86_UNIT_TEST,
  ADVISORY_BOARD_PAGE_P3_86_WIRING_PATHS,
} from "@/lib/marketing/advisory-board-page-p3-86-policy";

const ROOT = process.cwd();

describe("Advisory board page (P3-86)", () => {
  it("locks policy with recruiting mode and zero published members", () => {
    expect(ADVISORY_BOARD_PAGE_P3_86_POLICY_ID).toBe("advisory-board-page-p3-86-v1");
    expect(ADVISORY_BOARD_PAGE_P3_86_PAGE_MODE).toBe("recruiting_application_only");
    expect(ADVISORY_BOARD_PAGE_P3_86_PUBLISHED_MEMBER_COUNT).toBe(0);
    expect(ADVISORY_BOARD_PAGE_P3_86_RECRUITING_COPY.idealProfiles.length).toBeGreaterThanOrEqual(4);
  });

  it("passes full P3-86 advisory board page audit", () => {
    const summary = auditAdvisoryBoardPageP386(ROOT);
    expect(summary.pageModeHonest).toBe(true);
    expect(summary.applicationFormPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.forbiddenPatternsAbsent).toBe(true);
    expect(summary.noPublishedMemberGrid).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-86 wiring paths, CI gate, and artifact", () => {
    for (const path of ADVISORY_BOARD_PAGE_P3_86_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[ADVISORY_BOARD_PAGE_P3_86_CHECK_NPM_SCRIPT]).toContain(
      ADVISORY_BOARD_PAGE_P3_86_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, ADVISORY_BOARD_PAGE_P3_86_CI_WORKFLOW), "utf8");
    expect(ci).toContain(ADVISORY_BOARD_PAGE_P3_86_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readFileSync(join(ROOT, ADVISORY_BOARD_PAGE_P3_86_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(ADVISORY_BOARD_PAGE_P3_86_POLICY_ID);
    expect(artifact.pageMode).toBe("recruiting_application_only");
    expect(artifact.publishedMemberCount).toBe(0);

    const page = readFileSync(join(ROOT, ADVISORY_BOARD_PAGE_P3_86_ROUTE), "utf8");
    expect(page).toContain("advisory-board-honesty");
    expect(page).not.toContain("our advisors include");

    const doc = readFileSync(join(ROOT, ADVISORY_BOARD_PAGE_P3_86_DOC), "utf8");
    expect(doc).toContain(ADVISORY_BOARD_PAGE_P3_86_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditAdvisoryBoardPageP386(ROOT);
    const lines = formatAdvisoryBoardPageP386AuditLines(summary);
    expect(lines.some((line) => line.includes(ADVISORY_BOARD_PAGE_P3_86_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
