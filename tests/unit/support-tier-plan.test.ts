import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/support-tier-plan.md");
const CS_PLAYBOOK_PATH = join(process.cwd(), "docs/customer-success-playbook.md");
const INCIDENT_PATH = join(process.cwd(), "docs/incident-response-process.md");
const ENTERPRISE_PATH = join(process.cwd(), "docs/enterprise-mvp-spec.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("support tier plan doc", () => {
  it("exists with tiers, severity alignment, and 24/7 roadmap", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# 24/7 support tier plan — OS Kitchen");
    expect(doc).toContain("support-tier-plan-v1");
    expect(doc).toContain("## Support tier matrix (restaurant workspace)");
    expect(doc).toContain("T4");
    expect(doc).toContain("24/7");
    expect(doc).toContain("## Roadmap — when 24/7 (Tier 4) becomes sellable");
    expect(doc).toContain("PagerDuty");
    expect(doc).toContain("incident-response-process.md");
    expect(doc).toContain("customer-success-playbook.md");
  });

  it("reflects NO-GO baseline and is linked from CS and incident docs", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const cs = readFileSync(CS_PLAYBOOK_PATH, "utf8");
    const incident = readFileSync(INCIDENT_PATH, "utf8");
    const enterprise = readFileSync(ENTERPRISE_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("no contracted 24/7");
    expect(doc).toContain("founder on-call");
    expect(doc).toContain("sales-safe-claims-registry.md");
    expect(cs).toContain("support-tier-plan.md");
    expect(incident).toContain("support-tier-plan.md");
    expect(enterprise).toContain("support-tier-plan.md");
  });
});
