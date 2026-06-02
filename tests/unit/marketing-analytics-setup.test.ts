import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SETUP_PATH = join(process.cwd(), "docs/marketing-analytics-setup.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("marketing analytics setup doc", () => {
  it("exists with tools, env vars, and event taxonomy", () => {
    const doc = readFileSync(SETUP_PATH, "utf8");
    expect(doc).toContain("# Marketing analytics setup — OS Kitchen");
    expect(doc).toContain("marketing-analytics-setup-v1");
    expect(doc).toContain("NEXT_PUBLIC_GA_MEASUREMENT_ID");
    expect(doc).toContain("NEXT_PUBLIC_POSTHOG_KEY");
    expect(doc).toContain("## Event taxonomy");
    expect(doc).toContain("sign_up");
    expect(doc).toContain("captureProductEvent");
    expect(doc).toContain("grantMarketingConsent");
    expect(doc).toContain("observability-setup.md");
  });

  it("reflects NO-GO baseline and safe external claims", () => {
    const doc = readFileSync(SETUP_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("NO-GO");
    expect(doc).toContain("0 signed LOI");
    expect(doc).toContain("sales-safe-claims-registry.md");
    expect(doc).toContain("Product-market fit");
    expect(doc).toContain("Cookie consent");
  });
});
