import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const POLICY_PATH = join(process.cwd(), "docs/ai-honesty-policy.md");
const MOATS_PATH = join(process.cwd(), "docs/ai-moats-honest-positioning.md");

describe("ai honesty policy doc", () => {
  it("exists with public principles and module disclosures", () => {
    const doc = readFileSync(POLICY_PATH, "utf8");
    expect(doc).toContain("# AI honesty policy — OS Kitchen");
    expect(doc).toContain("ai-honesty-policy-v1");
    expect(doc).toContain("## Our commitment");
    expect(doc).toContain("seven AI modules");
    expect(doc).toContain("Human in the loop");
    expect(doc).toContain("Kitchen Camera AI");
    expect(doc).toContain("verify-claims");
    expect(doc).toContain("ai-moats-honest-positioning.md");
  });

  it("aligns with moats doc forbidden and approved language sections", () => {
    const policy = readFileSync(POLICY_PATH, "utf8");
    const moats = readFileSync(MOATS_PATH, "utf8");
    expect(moats).toContain("7 proprietary AI modules in production");
    expect(policy).toContain("7 proprietary AI modules in production");
    expect(policy).toContain("## Forbidden public language");
    expect(moats).toContain("## Forbidden umbrella claims");
    expect(policy).toContain("pre-revenue");
  });
});
