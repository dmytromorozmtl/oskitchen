import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const TEMPLATE_PATH = join(process.cwd(), "templates/emails/ai-briefing-email.html");

describe("ai-briefing-email.html template", () => {
  const html = readFileSync(TEMPLATE_PATH, "utf8");

  it("ships the static design reference aligned to formatBriefingEmail layout", () => {
    expect(html).toContain("AI-assisted briefing");
    expect(html).toContain("OS Kitchen Daily Briefing");
    expect(html).toContain("critical item(s)");
    expect(html).toContain("Forecast:");
    expect(html).toContain("Inventory");
    expect(html).toContain("Labor");
    expect(html).toContain("Menu profitability");
    expect(html).toContain("Profit drivers");
    expect(html).toContain("Predictive alerts");
    expect(html).toContain("Open Today dashboard");
    expect(html).toContain("briefing-delivery-format.ts");
  });

  it("labels sample data for honest public marketing use", () => {
    expect(html).toContain("Sample briefing for marketing");
    expect(html).toContain("verify before purchasing or scheduling changes");
  });
});
