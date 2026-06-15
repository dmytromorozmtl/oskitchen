import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_PROCUREMENT_ERA15_FORBIDDEN_AFFIRMATIVE_CLAIMS,
  ENTERPRISE_PROCUREMENT_ERA15_IDENTITY_DELIVERY,
  ENTERPRISE_PROCUREMENT_ERA15_OPS_DOC,
  ENTERPRISE_PROCUREMENT_ERA15_POLICY_ID,
  ENTERPRISE_PROCUREMENT_ERA15_REQUIRED_SECTIONS,
} from "@/lib/enterprise/enterprise-procurement-era15-policy";
import { ENTERPRISE_PROCUREMENT_POLICY_ID } from "@/lib/enterprise/enterprise-procurement-policy";

const ROOT = process.cwd();

describe("enterprise procurement era15 policy", () => {
  it("locks era15 procurement recert policy id", () => {
    expect(ENTERPRISE_PROCUREMENT_ERA15_POLICY_ID).toBe(
      "era15-enterprise-procurement-recert-v1",
    );
    expect(ENTERPRISE_PROCUREMENT_ERA15_IDENTITY_DELIVERY.decision).toBe("roadmap_only");
    expect(ENTERPRISE_PROCUREMENT_ERA15_IDENTITY_DELIVERY.ssoR2Pilot).toBe("not_started");
  });

  it("procurement pack retains required sections and avoids false affirmative claims", () => {
    const content = readFileSync(
      join(ROOT, ENTERPRISE_PROCUREMENT_ERA15_OPS_DOC),
      "utf8",
    );
    expect(content).toContain(ENTERPRISE_PROCUREMENT_POLICY_ID);
    expect(content).toContain(ENTERPRISE_PROCUREMENT_ERA15_POLICY_ID);

    for (const section of ENTERPRISE_PROCUREMENT_ERA15_REQUIRED_SECTIONS) {
      expect(content, `missing section: ${section}`).toContain(`## ${section}`);
    }

    for (const pattern of ENTERPRISE_PROCUREMENT_ERA15_FORBIDDEN_AFFIRMATIVE_CLAIMS) {
      const negationAware = new RegExp(`(?<!not\\s)${pattern.source}`, pattern.flags);
      expect(content.match(negationAware), `forbidden claim matched: ${pattern}`).toBeNull();
    }
  });
});
