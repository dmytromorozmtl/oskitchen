import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { PRODUCTION_CALENDAR_FORM_DENY_POLICY_ID } from "@/lib/production/production-calendar-form-mutation";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("production calendar form deny CI certification (live repo)", () => {
  it("locks era6 production calendar form deny policy module", () => {
    expect(PRODUCTION_CALENDAR_FORM_DENY_POLICY_ID).toBe(
      "era6-production-calendar-form-deny-v1",
    );
    const actions = readFileSync(join(ROOT, "actions/production-calendar.ts"), "utf8");
    expect(actions).toContain("assertProductionCalendarFormGate");
    expect(actions).not.toMatch(/if \(!gate\.ok\) return;/);
    const page = readFileSync(
      join(ROOT, "app/dashboard/production/calendar/page.tsx"),
      "utf8",
    );
    expect(page).toContain("readProductionCalendarFormError");
  });

  it("wires production calendar form deny tests in rbac-wave4 bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:rbac-wave4"]).toContain("production-calendar-form-deny.test.ts");
    expect(scripts["test:ci:rbac-wave4"]).toContain(
      "production-calendar-form-deny-ci-live.test.ts",
    );
  });
});
