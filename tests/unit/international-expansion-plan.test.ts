import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/international-expansion-plan.md");
const I18N_PATH = join(process.cwd(), "lib/i18n.ts");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("international expansion plan doc", () => {
  it("exists with UK first, multi-currency, multi-language, and GDPR", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# International expansion plan — OS Kitchen");
    expect(doc).toContain("international-expansion-plan-v1");
    expect(doc).toContain("United Kingdom");
    expect(doc).toContain("## Multi-currency");
    expect(doc).toContain("GBP");
    expect(doc).toContain("## Multi-language");
    expect(doc).toContain("## GDPR");
    expect(doc).toContain("UK GDPR");
  });

  it("aligns with partial i18n and honest baseline", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const i18n = readFileSync(I18N_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(i18n).toContain('"en"');
    expect(doc).toContain("lib/i18n.ts");
    expect(doc).toContain("Forbidden");
  });
});
