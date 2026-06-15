import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/offline-pos-plan.md");
const LIMITATION_PATH = join(process.cwd(), "docs/sales-limitation-sheet.md");
const TOAST_GAP_PATH = join(process.cwd(), "docs/toast-gap-analysis.md");
const POS_OFFLINE_PATH = join(process.cwd(), "docs/POS_OFFLINE_MODE.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("offline POS plan doc", () => {
  it("exists with phases, shipped queue, and staging proof gate", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# Offline POS mode plan — OS Kitchen");
    expect(doc).toContain("offline-pos-plan-v1");
    expect(doc).toContain("## Maturity phases");
    expect(doc).toContain("Phase 2 — Staging proof");
    expect(doc).toContain("offline-pos-queue.ts");
    expect(doc).toContain("posPaymentAllowedWhileOffline");
    expect(doc).toContain("POS_OFFLINE_MODE.md");
    expect(doc).toContain("EMV store-and-forward");
  });

  it("reflects NO-GO baseline and aligns with limitation sheet and toast gap", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const limitation = readFileSync(LIMITATION_PATH, "utf8");
    const toastGap = readFileSync(TOAST_GAP_PATH, "utf8");
    const posOffline = readFileSync(POS_OFFLINE_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("not production-certified");
    expect(doc).toContain("offline POS ready");
    expect(doc).toContain("sales-safe-claims-registry.md");
    expect(limitation).toContain("No offline POS");
    expect(toastGap).toContain("offline-pos-plan.md");
    expect(posOffline).toContain("IndexedDB");
  });
});
