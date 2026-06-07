import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditCompetitorParityWiring } from "@/lib/competitor/absolute-final-competitor-parity-audit";
import {
  COMPETITOR_PARITY_21_ENTRIES,
  COMPETITOR_PARITY_21_SLUGS,
  COMPETITOR_PARITY_ABSOLUTE_FINAL_POLICY_ID,
  COMPETITOR_PARITY_DOC_PATH,
  COMPETITOR_PARITY_MANUAL_GATE_NOTE,
  COMPETITOR_PARITY_TOTAL,
} from "@/lib/competitor/absolute-final-competitor-parity-policy";

const ROOT = process.cwd();
/** Absolute Final Task 150 — full competitor parity check (21 competitors) */
const TASK = 150;

describe(`Full competitor parity check (Absolute Final Task ${TASK})`, () => {
  it("locks absolute final 21-competitor parity policy id and count", () => {
    expect(COMPETITOR_PARITY_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-competitor-parity-21-v1",
    );
    expect(COMPETITOR_PARITY_TOTAL).toBe(21);
    expect(COMPETITOR_PARITY_21_SLUGS).toHaveLength(21);
    expect(COMPETITOR_PARITY_21_ENTRIES).toHaveLength(21);
  });

  it("maps all 21 competitors from battle map with parity status", () => {
    expect(COMPETITOR_PARITY_21_SLUGS).toContain("toast");
    expect(COMPETITOR_PARITY_21_SLUGS).toContain("marginedge");
    expect(COMPETITOR_PARITY_21_SLUGS).toContain("oracle_micros");
    expect(COMPETITOR_PARITY_21_SLUGS).toContain("ncr_aloha");
    for (const entry of COMPETITOR_PARITY_21_ENTRIES) {
      expect(entry.osKitchenEdge.length).toBeGreaterThan(5);
      expect(entry.gap.length).toBeGreaterThan(5);
      expect(["PARITY", "PARTIAL", "DEFER", "LIVE"]).toContain(entry.parityStatus);
    }
  });

  it("documents manual sales-safe gate alongside automation", () => {
    expect(COMPETITOR_PARITY_MANUAL_GATE_NOTE).toContain("not certified feature equivalence");
  });

  it("references full parity doc with 21-competitor certification", () => {
    const doc = readFileSync(join(ROOT, COMPETITOR_PARITY_DOC_PATH), "utf8");
    expect(doc).toContain("Absolute Final Task 150");
    expect(doc).toContain(COMPETITOR_PARITY_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("21-competitor parity matrix");
    expect(doc).toContain("Toast");
    expect(doc).toContain("MarginEdge");
  });

  it("consolidates eight battle cards and sales-safe claims upstream", () => {
    const policySource = readFileSync(
      join(ROOT, "lib/competitor/absolute-final-competitor-parity-policy.ts"),
      "utf8",
    );
    expect(policySource).toContain("Absolute Final Task 150");
    expect(policySource).toContain("competitor-battle-cards-eight-policy");
    expect(policySource).toContain("competitor-sales-safe-claims-policy");
    expect(policySource).toContain("competitor-feature-gap-matrix");
  });

  it("includes LIVE integrations for delivery and labor channels", () => {
    const live = COMPETITOR_PARITY_21_ENTRIES.filter((e) => e.parityStatus === "LIVE");
    expect(live.map((e) => e.slug)).toEqual(["homebase", "doordash", "uber_eats"]);
  });

  it("passes full competitor parity wiring audit", () => {
    const audit = auditCompetitorParityWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("locks CI cert script for competitor parity gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["test:ci:competitor-parity-absolute-final:cert"]).toContain(
      "absolute-final-competitor-parity-check.test.ts",
    );
  });
});
