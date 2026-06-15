import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const AUDIT_PATH = join(process.cwd(), "docs/marketing-page-audit.md");

describe("marketing page audit doc", () => {
  it("exists with required sections and honesty findings", () => {
    const doc = readFileSync(AUDIT_PATH, "utf8");
    expect(doc).toContain("# Marketing page audit — OS Kitchen public surface");
    expect(doc).toContain("marketing-page-audit-v1");
    expect(doc).toContain("## Executive summary");
    expect(doc).toContain("## Inventory");
    expect(doc).toContain("## Page-by-page findings");
    expect(doc).toContain("## Remediation backlog");
    expect(doc).toContain("home-landing.tsx");
    expect(doc).toContain("Illustrative");
    expect(doc).toContain("Uber Direct");
    expect(doc).toContain("seo-audit.md");
    expect(doc).toContain("sales-safe-claims-registry.md");
  });
});
