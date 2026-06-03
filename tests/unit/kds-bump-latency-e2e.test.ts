import { randomUUID } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logKitchenOrderBumped = vi.hoisted(() => vi.fn());
const updateOrderStatus = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/services/kitchen/kitchen-permission-audit", () => ({
  logKitchenPermissionDenied: vi.fn(),
  logKitchenOrderBumped,
  logKitchenOrderRecalled: vi.fn(),
}));

vi.mock("@/actions/orders", () => ({
  updateOrderStatus,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { bumpDailyKdsOrderAction } from "@/actions/kitchen-daily-kds";
import {
  KDS_BUMP_LATENCY_E2E_MIN_SAMPLES,
  KDS_BUMP_LATENCY_P50_MS,
  KDS_BUMP_LATENCY_P95_MS,
  KDS_BUMP_LATENCY_P99_MS,
  KDS_BUMP_LATENCY_E2E_POLICY_ID,
  isWithinKdsBumpLatencySlo,
} from "@/lib/kitchen/kds-bump-latency-e2e-policy";
import {
  bumpLatencyBatchWithinSlo,
  recordKdsBumpLatencySample,
  summarizeKdsBumpLatencyMetrics,
} from "@/lib/kitchen/kds-bump-latency-metrics";

const actor = {
  ok: true as const,
  actor: {
    sessionUser: { id: "session-user-1" },
    sessionUserId: "session-user-1",
    userId: "owner-user-1",
    dataUserId: "owner-user-1",
    workspaceId: "ws-1",
    email: "line@example.com",
    workspaceRole: "STAFF" as const,
    staffRoleType: "LINE_COOK" as const,
    granted: new Set(["kitchen.view", "kitchen.bump"]),
  },
};

describe("kds bump latency E2E policy (QA-30)", () => {
  it("exports SLI-2 targets from kds-slo-proof-plan", () => {
    expect(KDS_BUMP_LATENCY_E2E_POLICY_ID).toBe("kds-bump-latency-e2e-v1");
    expect(KDS_BUMP_LATENCY_P50_MS).toBe(400);
    expect(KDS_BUMP_LATENCY_P95_MS).toBe(1_500);
    expect(KDS_BUMP_LATENCY_P99_MS).toBe(4_000);
    expect(isWithinKdsBumpLatencySlo(399, "p50")).toBe(true);
  });

  it("computes within-SLO snapshot for healthy bump batch", () => {
    const samples = Array.from({ length: KDS_BUMP_LATENCY_E2E_MIN_SAMPLES }, () => 180);
    const summary = summarizeKdsBumpLatencyMetrics(samples);
    expect(summary.withinSlo).toEqual({ p50: true, p95: true, p99: true });
    expect(bumpLatencyBatchWithinSlo(samples)).toBe(true);
  });
});

describe("kds bump action latency batch (QA-30)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logKitchenOrderBumped.mockResolvedValue(undefined);
    updateOrderStatus.mockResolvedValue({ ok: true });
    requireMutationPermission.mockResolvedValue(actor);
  });

  it("records p50/p95/p99 within bump SLO for sequential bump actions", async () => {
    let samples: number[] = [];
    const orderIds = Array.from({ length: KDS_BUMP_LATENCY_E2E_MIN_SAMPLES }, () => randomUUID());

    for (const orderId of orderIds) {
      const started = performance.now();
      await expect(bumpDailyKdsOrderAction(orderId)).resolves.toEqual({ ok: true });
      samples = recordKdsBumpLatencySample(samples, performance.now() - started);
    }

    const summary = summarizeKdsBumpLatencyMetrics(samples);
    expect(summary.sampleCount).toBe(KDS_BUMP_LATENCY_E2E_MIN_SAMPLES);
    expect(summary.p50Ms).not.toBeNull();
    expect(summary.p95Ms).not.toBeNull();
    expect(summary.p99Ms).not.toBeNull();
    expect(bumpLatencyBatchWithinSlo(samples)).toBe(true);
    expect(updateOrderStatus).toHaveBeenCalledTimes(KDS_BUMP_LATENCY_E2E_MIN_SAMPLES);
  });
});
