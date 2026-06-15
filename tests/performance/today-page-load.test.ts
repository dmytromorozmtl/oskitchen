import { performance } from "node:perf_hooks";

import { describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { loadGettingStartedStatus } from "@/services/onboarding/getting-started-status";
import { loadTodayCommandCenter } from "@/services/today/today-command-center-service";

/**
 * Today page server-load SLO — p95 critical path under 2s.
 *
 * Measures the owner Today data path (command center + getting started),
 * matching the sequential loaders before optional briefing/AI panels.
 *
 * @see app/dashboard/today/page.tsx
 * @see docs/PERFORMANCE_LOAD_BASELINE_PLAN.md
 * @see docs/fullreport3june.md (Today p95 target <2s)
 */

export const TODAY_PAGE_LOAD_P95_SLO_MS = 2_000;
export const TODAY_PAGE_PERF_WARMUP_ITERATIONS = 1;
export const TODAY_PAGE_PERF_SAMPLE_COUNT = 10;

const runLive =
  Boolean(process.env.DATABASE_URL?.trim()) &&
  (process.env.RUN_PERF_TESTS === "1" || process.env.RUN_DB_INTEGRATION === "1") &&
  process.env.SKIP_TODAY_PAGE_PERF !== "1";

export function computePercentile(sortedAsc: number[], p: number): number | null {
  if (sortedAsc.length === 0) return null;
  const idx = Math.ceil((p / 100) * sortedAsc.length) - 1;
  return sortedAsc[Math.max(0, Math.min(sortedAsc.length - 1, idx))] ?? null;
}

async function resolveBenchmarkOwnerUserId(): Promise<string | null> {
  const email = process.env.E2E_LOGIN_EMAIL?.trim();
  if (email) {
    const row = await prisma.userProfile.findFirst({
      where: { email },
      select: { id: true },
    });
    if (row?.id) return row.id;
  }

  const owner = await prisma.userProfile.findFirst({
    where: { role: "OWNER" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return owner?.id ?? null;
}

/** Owner Today critical path — command center then onboarding strip inputs. */
export async function loadTodayPageCriticalPath(userId: string): Promise<void> {
  await loadTodayCommandCenter(userId);
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });
  await loadGettingStartedStatus(userId, profile?.createdAt ?? new Date());
}

async function measureTodayPageCriticalPathMs(userId: string): Promise<number> {
  const start = performance.now();
  await loadTodayPageCriticalPath(userId);
  return performance.now() - start;
}

describe("today page load SLO policy", () => {
  it("defines p95 target under 2 seconds", () => {
    expect(TODAY_PAGE_LOAD_P95_SLO_MS).toBe(2_000);
    expect(TODAY_PAGE_PERF_SAMPLE_COUNT).toBeGreaterThanOrEqual(5);
  });

  it("computes p95 from sorted samples", () => {
    const samples = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1_000];
    expect(computePercentile(samples, 95)).toBe(1_000);
    expect(computePercentile(samples, 50)).toBe(500);
  });
});

describe.skipIf(!runLive)("today page load performance (live DB)", () => {
  it(
    `loadTodayPageCriticalPath p95 < ${TODAY_PAGE_LOAD_P95_SLO_MS}ms`,
    async () => {
      const userId = await resolveBenchmarkOwnerUserId();
      if (!userId) {
        expect.fail("No benchmark owner user — seed an OWNER or set E2E_LOGIN_EMAIL");
      }

      for (let i = 0; i < TODAY_PAGE_PERF_WARMUP_ITERATIONS; i += 1) {
        await loadTodayPageCriticalPath(userId!);
      }

      const durations: number[] = [];
      for (let i = 0; i < TODAY_PAGE_PERF_SAMPLE_COUNT; i += 1) {
        durations.push(await measureTodayPageCriticalPathMs(userId!));
      }

      const sorted = [...durations].sort((a, b) => a - b);
      const p50 = computePercentile(sorted, 50);
      const p95 = computePercentile(sorted, 95);

      expect(p95, `samples(ms): ${sorted.join(", ")}`).not.toBeNull();
      expect(p95!).toBeLessThan(TODAY_PAGE_LOAD_P95_SLO_MS);
      expect(p50).not.toBeNull();
      expect(p50!).toBeLessThan(TODAY_PAGE_LOAD_P95_SLO_MS);
    },
    120_000,
  );
});
