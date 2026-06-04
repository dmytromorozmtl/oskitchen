import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  FINAL_EXECUTION_DOC_MARKERS,
  FINAL_EXECUTION_DOC_PATH,
} from "@/lib/execution/final-execution-doc-policy";
import {
  auditFinalExecutionDocContent,
  renderFinalExecutionMarkdown,
  syncFinalExecutionDoc,
} from "@/lib/execution/sync-final-execution-doc";
import { FINAL_EXECUTION_JSON_POLICY_ID } from "@/lib/execution/final-execution-json-policy";

const ROOT = process.cwd();

describe("final execution doc sync — FINAL-23", () => {
  it("renders markdown with FINAL-23 contract markers from JSON", () => {
    const { markdown, report } = syncFinalExecutionDoc(ROOT);
    expect(report.version).toBe(FINAL_EXECUTION_JSON_POLICY_ID);
    expect(auditFinalExecutionDocContent(markdown, report)).toBe(true);
    for (const marker of FINAL_EXECUTION_DOC_MARKERS) {
      expect(markdown, `missing ${marker}`).toContain(marker);
    }
    expect(markdown).toContain("goDecision");
  });

  it("on-disk doc matches JSON when synced", () => {
    const { report } = syncFinalExecutionDoc(ROOT);
    const path = join(ROOT, FINAL_EXECUTION_DOC_PATH);
    if (!existsSync(path)) return;
    const markdown = readFileSync(path, "utf8");
    if (!markdown.includes("Final execution report (FINAL-23)")) return;
    expect(auditFinalExecutionDocContent(markdown, report)).toBe(true);
  });

  it("render helper includes orchestrator gate table rows", () => {
    const { report } = syncFinalExecutionDoc(ROOT);
    const md = renderFinalExecutionMarkdown(report);
    expect(md).toContain("| FINAL-01 |");
    expect(md).toContain("| FINAL-26 |");
  });
});
