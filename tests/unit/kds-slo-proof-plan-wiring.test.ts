import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  getKdsRealtimeSloTargets,
  isWithinKdsRealtimeSlo,
  KDS_SLO_PROOF_DOC,
  KDS_SLO_PROOF_POLICY_ID,
  KDS_SLO_REALTIME_P50_MS,
  KDS_SLO_REALTIME_P95_MS,
  KDS_SLO_REALTIME_P99_MS,
  KDS_SLO_SALES_ONE_PAGER_DOC,
} from "@/lib/kitchen/kds-slo-proof-policy";

const ROOT = process.cwd();

describe("kds slo proof plan wiring", () => {
  it("locks critical features realtime SLO policy id", () => {
    expect(KDS_SLO_PROOF_POLICY_ID).toBe("critical-kds-realtime-slo-proof-v1");
  });

  it("defines LIVE transport SLO targets p50<500ms p95<2s p99<5s", () => {
    expect(getKdsRealtimeSloTargets()).toEqual({
      p50Ms: 500,
      p95Ms: 2_000,
      p99Ms: 5_000,
    });
    expect(KDS_SLO_REALTIME_P50_MS).toBe(500);
    expect(KDS_SLO_REALTIME_P95_MS).toBe(2_000);
    expect(KDS_SLO_REALTIME_P99_MS).toBe(5_000);
  });

  it("evaluates latency against percentile targets", () => {
    expect(isWithinKdsRealtimeSlo(499, "p50")).toBe(true);
    expect(isWithinKdsRealtimeSlo(500, "p50")).toBe(false);
    expect(isWithinKdsRealtimeSlo(1_999, "p95")).toBe(true);
    expect(isWithinKdsRealtimeSlo(4_999, "p99")).toBe(true);
  });

  it("ships slo proof plan and sales one-pager docs", () => {
    expect(existsSync(join(ROOT, KDS_SLO_PROOF_DOC))).toBe(true);
    expect(existsSync(join(ROOT, KDS_SLO_SALES_ONE_PAGER_DOC))).toBe(true);

    const proof = readFileSync(join(ROOT, KDS_SLO_PROOF_DOC), "utf8");
    expect(proof).toContain("p50");
    expect(proof).toContain("500ms");
    expect(proof).toContain("p95");
    expect(proof).toContain("2s");
    expect(proof).toContain("p99");
    expect(proof).toContain("5s");
    expect(proof).toContain("kds-slo-proof-policy.ts");

    const sales = readFileSync(join(ROOT, KDS_SLO_SALES_ONE_PAGER_DOC), "utf8");
    expect(sales).toContain("LIVE");
    expect(sales).toContain("POLLING");
    expect(sales).toContain("kds-slo-proof-plan.md");
  });
});
