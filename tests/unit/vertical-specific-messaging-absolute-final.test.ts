import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditVerticalSpecificMessagingWiring } from "@/lib/marketing/vertical-specific-messaging-audit";
import {
  VERTICAL_MESSAGING_PRIMARY_HEADLINE,
  VERTICAL_MESSAGING_SEGMENTS,
} from "@/lib/marketing/vertical-specific-messaging-content";
import {
  VERTICAL_SPECIFIC_MESSAGING_ABSOLUTE_FINAL_POLICY_ID,
  VERTICAL_SPECIFIC_MESSAGING_CI_SCRIPTS,
  VERTICAL_SPECIFIC_MESSAGING_PRIMARY_HEADLINE,
  VERTICAL_SPECIFIC_MESSAGING_UNIT_TEST,
} from "@/lib/marketing/vertical-specific-messaging-absolute-final-policy";
import { SOLUTIONS_HUB_COPY } from "@/lib/marketing/solutions-hub-content";

const ROOT = process.cwd();

describe("Vertical-specific messaging (Absolute Final Task 79)", () => {
  it("locks absolute final policy and primary headline", () => {
    expect(VERTICAL_SPECIFIC_MESSAGING_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "vertical-specific-messaging-absolute-final-v1",
    );
    expect(VERTICAL_SPECIFIC_MESSAGING_PRIMARY_HEADLINE).toBe(
      "Built for multi-concept operators",
    );
    expect(VERTICAL_MESSAGING_PRIMARY_HEADLINE).toBe(
      "Built for multi-concept operators",
    );
  });

  it("ships five vertical segments with dedicated landing paths", () => {
    expect(VERTICAL_MESSAGING_SEGMENTS).toHaveLength(5);
    expect(VERTICAL_MESSAGING_SEGMENTS.map((s) => s.href)).toEqual([
      "/ghost-kitchen-software",
      "/ghost-kitchen-software",
      "/meal-prep-software",
      "/commissary-software",
      "/catering-management",
    ]);
  });

  it("wires primary headline into solutions hub copy", () => {
    expect(SOLUTIONS_HUB_COPY.headline).toBe("Built for multi-concept operators");
  });

  it("passes wiring audit", () => {
    const audit = auditVerticalSpecificMessagingWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of VERTICAL_SPECIFIC_MESSAGING_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(VERTICAL_SPECIFIC_MESSAGING_UNIT_TEST).toBe(
      "tests/unit/vertical-specific-messaging-absolute-final.test.ts",
    );
  });
});
