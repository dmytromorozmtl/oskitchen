import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/qr-code-ordering-plan.md");
const LIMITATION_PATH = join(process.cwd(), "docs/sales-limitation-sheet.md");
const QR_ROUTE_PATH = join(process.cwd(), "app/api/storefront/qr/route.ts");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("qr code ordering plan doc", () => {
  it("exists with journey, phases, and code references", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# QR code ordering plan — OS Kitchen");
    expect(doc).toContain("qr-code-ordering-plan-v1");
    expect(doc).toContain("qr-generator.tsx");
    expect(doc).toContain("/api/storefront/qr");
    expect(doc).toContain("daily-menu?table");
    expect(doc).toContain("## Phase 2 — Table metadata");
    expect(doc).toContain("feature-maturity-matrix.md");
  });

  it("reflects NO-GO baseline and aligns with limitation sheet and QR API", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const limitation = readFileSync(LIMITATION_PATH, "utf8");
    const qrRoute = readFileSync(QR_ROUTE_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("table metadata gap");
    expect(doc).toContain("sales-safe-claims-registry.md");
    expect(doc).toContain("Toast QR parity");
    expect(limitation).toContain("floor-plan realtime occupancy");
    expect(qrRoute).toContain("daily-menu");
  });
});
