import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const TEMPLATE_PATH = join(process.cwd(), "docs/ai-crisis-communication-template.md");
const POLICY_PATH = join(process.cwd(), "docs/ai-honesty-policy.md");

describe("ai crisis communication template doc", () => {
  it("exists with scenarios, templates, and SLA", () => {
    const doc = readFileSync(TEMPLATE_PATH, "utf8");
    expect(doc).toContain("# AI crisis communication template — OS Kitchen");
    expect(doc).toContain("ai-crisis-communication-template-v1");
    expect(doc).toContain("## Trigger scenarios");
    expect(doc).toContain("Template B — Prospect / customer correction email");
    expect(doc).toContain("Template C — Public LinkedIn");
    expect(doc).toContain("ai-honesty-policy.md");
    expect(doc).toContain("sales-safe-claims-registry.md");
    expect(doc).toContain("verify-claims");
  });

  it("is linked from ai honesty policy and includes correction phrases", () => {
    const doc = readFileSync(TEMPLATE_PATH, "utf8");
    const policy = readFileSync(POLICY_PATH, "utf8");
    expect(policy).toContain("ai-crisis-communication-template.md");
    expect(doc).toContain("7 proprietary AI modules in production");
    expect(doc).toContain("Autonomous AI manager");
    expect(doc).toContain("5 business days");
    expect(doc).toContain("incident-response-process.md");
  });
});
