import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { INTEGRATION_REGISTRY } from "@/lib/integrations/integration-registry";

const MATRIX_PATH = join(process.cwd(), "docs/integration-escalation-matrix.md");

describe("integration escalation matrix doc", () => {
  it("exists with escalation levels and integration rows", () => {
    const doc = readFileSync(MATRIX_PATH, "utf8");
    expect(doc).toContain("# Integration escalation matrix — OS Kitchen");
    expect(doc).toContain("integration-escalation-matrix-v1");
    expect(doc).toContain("## Escalation levels");
    expect(doc).toContain("L0");
    expect(doc).toContain("L3");
    expect(doc).toContain("incident-response-process.md");
    expect(doc).toContain("live-integration-definition-of-done.md");
  });

  it("covers every integration registry id with BETA honesty", () => {
    const doc = readFileSync(MATRIX_PATH, "utf8");
    for (const entry of INTEGRATION_REGISTRY) {
      expect(doc).toContain(entry.name);
    }
    expect(doc).toContain("0 LIVE partner integrations");
    expect(doc).toContain("Uber Direct");
    expect(doc).toContain("PLACEHOLDER");
    expect(doc).toContain("WooCommerce");
    expect(doc).toContain("Shopify");
  });
});
