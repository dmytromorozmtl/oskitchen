import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("integration-health-strip ui", () => {
  it("exports polished IntegrationHealthStrip component", () => {
    const source = readFileSync(
      join(ROOT, "components/dashboard/integration-health-strip.tsx"),
      "utf8",
    );
    expect(source).toContain("export function IntegrationHealthStrip");
    expect(source).toContain("Channel health score");
    expect(source).toContain("data-testid=\"pilot-integration-health-strip\"");
    expect(source).toContain("data-testid=\"pilot-integration-beta-env-footnote\"");
  });

  it("pilot shim re-exports IntegrationHealthStrip", () => {
    const shim = readFileSync(
      join(ROOT, "components/dashboard/pilot-integration-health-strip.tsx"),
      "utf8",
    );
    expect(shim).toContain("@/components/dashboard/integration-health-strip");
    expect(shim).toContain("PilotIntegrationHealthStrip");
  });
});
