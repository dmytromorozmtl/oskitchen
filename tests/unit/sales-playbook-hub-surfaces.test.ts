import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditMarketingSalesPlaybookCapstone } from "@/lib/marketing/marketing-sales-playbook-capstone-audit-policy";
import { SALES_PLAYBOOK_DOC, SALES_PLAYBOOK_HUB_MARKERS } from "@/lib/execution/sales-playbook-policy";

const ROOT = process.cwd();

describe("sales playbook hub surfaces — FINAL-20", () => {
  it("SALES_PLAYBOOK.md is the sales-safe hub with governance links", () => {
    const path = join(ROOT, SALES_PLAYBOOK_DOC);
    expect(existsSync(path)).toBe(true);
    const source = readFileSync(path, "utf8");
    for (const marker of SALES_PLAYBOOK_HUB_MARKERS) {
      expect(source, `playbook missing: ${marker}`).toContain(marker);
    }
  });

  it("MKT-41 capstone sub-audits pass including sales-playbook-hub", () => {
    const report = auditMarketingSalesPlaybookCapstone(ROOT);
    expect(report.passed).toBe(true);
    const hub = report.subAudits.find((a) => a.taskId === "sales-playbook-hub");
    expect(hub?.passed).toBe(true);
  });
});
