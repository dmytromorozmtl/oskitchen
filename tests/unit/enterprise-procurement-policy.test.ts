import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_PROCUREMENT_FORBIDDEN_AFFIRMATIVE_CLAIMS,
  ENTERPRISE_PROCUREMENT_PACK_DOC,
  ENTERPRISE_PROCUREMENT_POLICY_ID,
  ENTERPRISE_PROCUREMENT_REQUIRED_SECTIONS,
} from "@/lib/enterprise/enterprise-procurement-policy";

const ROOT = process.cwd();

describe("enterprise procurement policy", () => {
  it("locks era4 procurement honesty policy id", () => {
    expect(ENTERPRISE_PROCUREMENT_POLICY_ID).toBe("era4-procurement-honesty-v1");
    expect(ENTERPRISE_PROCUREMENT_REQUIRED_SECTIONS.length).toBeGreaterThanOrEqual(10);
  });

  it("procurement pack contains required sections and avoids false affirmative claims", () => {
    const content = readFileSync(join(ROOT, ENTERPRISE_PROCUREMENT_PACK_DOC), "utf8");
    expect(content).toContain(ENTERPRISE_PROCUREMENT_POLICY_ID);

    for (const section of ENTERPRISE_PROCUREMENT_REQUIRED_SECTIONS) {
      expect(content, `missing section: ${section}`).toContain(`## ${section}`);
    }

    for (const pattern of ENTERPRISE_PROCUREMENT_FORBIDDEN_AFFIRMATIVE_CLAIMS) {
      const negationAware = new RegExp(`(?<!not\\s)${pattern.source}`, pattern.flags);
      expect(content.match(negationAware), `forbidden claim matched: ${pattern}`).toBeNull();
    }

    expect(content).toMatch(/not\s+SOC\s*2/i);
    expect(content).toMatch(/SSO.*not available today|Not available today/i);
  });
});
