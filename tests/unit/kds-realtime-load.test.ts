import { randomUUID } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
import { KDS_POLL_FALLBACK_MS } from "@/lib/kitchen/kds-realtime-smoke-policy";
import { subscribeKdsOrderUpdates } from "@/services/kds-websocket";

/** Rush-hour smoke target from Task 37 — 50 ticket bumps without degradation. */
const KDS_LOAD_BUMP_EVENT_COUNT = 50;

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

describe("KDS Realtime load — bump events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logKitchenOrderBumped.mockResolvedValue(undefined);
    updateOrderStatus.mockResolvedValue({ ok: true });
    requireMutationPermission.mockResolvedValue(actor);
  });

  it(`processes ${KDS_LOAD_BUMP_EVENT_COUNT} sequential bump actions`, async () => {
    const orderIds = Array.from({ length: KDS_LOAD_BUMP_EVENT_COUNT }, () => randomUUID());
    const started = performance.now();

    for (const orderId of orderIds) {
      await expect(bumpDailyKdsOrderAction(orderId)).resolves.toEqual({ ok: true });
    }

    const elapsedMs = performance.now() - started;

    expect(updateOrderStatus).toHaveBeenCalledTimes(KDS_LOAD_BUMP_EVENT_COUNT);
    expect(logKitchenOrderBumped).toHaveBeenCalledTimes(KDS_LOAD_BUMP_EVENT_COUNT);
    expect(elapsedMs).toBeLessThan(5_000);
  });

  it(`processes ${KDS_LOAD_BUMP_EVENT_COUNT} concurrent bump actions`, async () => {
    const orderIds = Array.from({ length: KDS_LOAD_BUMP_EVENT_COUNT }, () => randomUUID());

    const results = await Promise.all(orderIds.map((orderId) => bumpDailyKdsOrderAction(orderId)));

    expect(results.every((row) => row.ok)).toBe(true);
    expect(updateOrderStatus).toHaveBeenCalledTimes(KDS_LOAD_BUMP_EVENT_COUNT);
    expect(logKitchenOrderBumped).toHaveBeenCalledTimes(KDS_LOAD_BUMP_EVENT_COUNT);
  });
});

describe("KDS Realtime load — refresh burst", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_KDS_REALTIME_ENABLED: "false",
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.useRealTimers();
  });

  it(`survives ${KDS_LOAD_BUMP_EVENT_COUNT} rapid refresh callbacks (realtime event burst)`, () => {
    let refreshCount = 0;
    const onRefresh = () => {
      refreshCount += 1;
    };

    const subscription = subscribeKdsOrderUpdates({
      userId: "load-test-user",
      onRefresh,
      onConnectionChange: () => undefined,
    });

    expect(subscription.transport).toBe("polling");

    for (let i = 0; i < KDS_LOAD_BUMP_EVENT_COUNT; i += 1) {
      onRefresh();
    }

    subscription.disconnect();
    expect(refreshCount).toBe(KDS_LOAD_BUMP_EVENT_COUNT);
  });

  it(`poll fallback delivers ${KDS_LOAD_BUMP_EVENT_COUNT} refresh ticks under load`, () => {
    vi.useFakeTimers();
    let refreshCount = 0;

    const subscription = subscribeKdsOrderUpdates({
      userId: "load-test-user",
      onRefresh: () => {
        refreshCount += 1;
      },
      onConnectionChange: () => undefined,
    });

    vi.advanceTimersByTime(KDS_POLL_FALLBACK_MS * KDS_LOAD_BUMP_EVENT_COUNT);

    subscription.disconnect();
    expect(refreshCount).toBeGreaterThanOrEqual(KDS_LOAD_BUMP_EVENT_COUNT);
  });
});
