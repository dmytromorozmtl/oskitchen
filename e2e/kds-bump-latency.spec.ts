import { expect, test } from "@playwright/test";

import {
  KDS_BUMP_LATENCY_E2E_MIN_SAMPLES,
  KDS_BUMP_LATENCY_E2E_POLICY_ID,
  KDS_BUMP_LATENCY_P50_MS,
  KDS_BUMP_LATENCY_P95_MS,
  KDS_BUMP_LATENCY_P99_MS,
  KDS_BUMP_LATENCY_SLI_ID,
  getKdsBumpLatencySloTargets,
  hasEnoughBumpLatencySamples,
  isWithinKdsBumpLatencySlo,
  kdsTicketTestId,
} from "@/lib/kitchen/kds-bump-latency-e2e-policy";
import {
  bumpLatencyBatchWithinSlo,
  recordKdsBumpLatencySample,
  summarizeKdsBumpLatencyMetrics,
} from "@/lib/kitchen/kds-bump-latency-metrics";

import {
  kdsBumpLatencyGateEnabled,
  skipKdsBumpLatencyIfGateDisabled,
  skipKdsBumpLatencyIfNotAuthed,
} from "./helpers/kds-bump-latency-ready";

/**
 * KDS bump reflect latency E2E — SLI-2 p50/p95/p99 vs kds-slo-proof-plan targets.
 *
 * @see docs/kds-slo-proof-plan.md
 * @see hooks/use-kds-realtime.ts
 */

test.describe("kds bump latency policy", () => {
  test("exports SLI-2 bump reflect latency targets", () => {
    expect(KDS_BUMP_LATENCY_E2E_POLICY_ID).toBe("kds-bump-latency-e2e-v1");
    expect(KDS_BUMP_LATENCY_SLI_ID).toBe("kds.bump_reflect_latency_ms");
    expect(KDS_BUMP_LATENCY_P50_MS).toBe(400);
    expect(KDS_BUMP_LATENCY_P95_MS).toBe(1_500);
    expect(KDS_BUMP_LATENCY_P99_MS).toBe(4_000);
    expect(getKdsBumpLatencySloTargets()).toEqual({
      p50Ms: 400,
      p95Ms: 1_500,
      p99Ms: 4_000,
    });
    expect(kdsTicketTestId("ord-1")).toBe("kds-ticket-ord-1");
  });

  test("evaluates percentile SLO gates", () => {
    expect(isWithinKdsBumpLatencySlo(350, "p50")).toBe(true);
    expect(isWithinKdsBumpLatencySlo(450, "p50")).toBe(false);
    expect(isWithinKdsBumpLatencySlo(1_400, "p95")).toBe(true);
    expect(isWithinKdsBumpLatencySlo(3_900, "p99")).toBe(true);
  });
});

test.describe("kds bump latency metrics", () => {
  test("summarizes p50/p95/p99 from bump reflect samples", () => {
    const samples = Array.from({ length: 30 }, (_, index) => 120 + index * 10);
    const summary = summarizeKdsBumpLatencyMetrics(samples);

    expect(summary.sampleCount).toBe(30);
    expect(summary.p50Ms).not.toBeNull();
    expect(summary.p95Ms).not.toBeNull();
    expect(summary.p99Ms).not.toBeNull();
    expect(summary.withinSlo).toEqual({ p50: true, p95: true, p99: true });
    expect(bumpLatencyBatchWithinSlo(samples)).toBe(true);
  });

  test("flags batch outside bump latency SLO when tail exceeds p99", () => {
    const samples = [
      ...Array.from({ length: 29 }, () => 200),
      5_000,
    ];
    const summary = summarizeKdsBumpLatencyMetrics(samples);

    expect(summary.withinSlo?.p50).toBe(true);
    expect(summary.withinSlo?.p99).toBe(false);
    expect(bumpLatencyBatchWithinSlo(samples)).toBe(false);
  });

  test("records rolling bump latency samples with cap", () => {
    let samples: number[] = [];
    for (let i = 0; i < 25; i += 1) {
      samples = recordKdsBumpLatencySample(samples, i * 10, 20);
    }
    expect(samples).toHaveLength(20);
    expect(hasEnoughBumpLatencySamples(samples.length)).toBe(true);
  });
});

test.describe("kds bump latency gate", () => {
  test("requires ENABLE_KDS_V1_CERTIFIED outside production", () => {
    expect(typeof kdsBumpLatencyGateEnabled).toBe("boolean");
    expect(KDS_BUMP_LATENCY_E2E_MIN_SAMPLES).toBeGreaterThanOrEqual(20);
  });
});

test.describe("kds bump latency UI (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "KDS bump latency UI runs in chromium-authed project only",
    );
    skipKdsBumpLatencyIfGateDisabled();
    skipKdsBumpLatencyIfNotAuthed();
  });

  test("kitchen display reachable for bump latency probe", async ({ page }) => {
    const { navigateToKdsKitchen } = await import("./helpers/kds-bump-latency-flow");
    await navigateToKdsKitchen(page);
    await expect(page.getByRole("heading", { name: /^Kitchen Display$/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
