import { beforeEach, describe, expect, it, vi } from "vitest";

const requireStorefrontManageActor = vi.hoisted(() => vi.fn());
const isPrefrontalEthicsBoardEnabled = vi.hoisted(() => vi.fn());
const prismaFindFirst = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/storefront/require-storefront-actor", () => ({
  requireStorefrontManageActor,
}));

vi.mock("@/lib/storefront/theme-experiment-prefrontal-ethics-board", () => ({
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard: vi.fn(() => ({ queue: [] })),
  enqueueEthicsReview: vi.fn((_json: unknown, _input: unknown) => ({ json: {} })),
}));

vi.mock("@/lib/storefront/theme-experiment-cerebellar-motor-organoid", () => ({
  syncCerebellarFromEthicsBoard: vi.fn((json: unknown) => ({ json })),
}));
vi.mock("@/lib/storefront/theme-experiment-brainstem-autonomic-guard", () => ({
  syncBrainstemFromCerebellar: vi.fn((json: unknown) => ({ json })),
}));
vi.mock("@/lib/storefront/theme-experiment-spinal-cord-publish-throttle", () => ({
  syncSpinalThrottleFromBrainstem: vi.fn((json: unknown) => ({ json })),
}));
vi.mock("@/lib/storefront/theme-experiment-medulla-oblongata-emergency-halt", () => ({
  syncMedullaFromSpinalAndEthics: vi.fn((json: unknown) => ({ json })),
}));
vi.mock("@/lib/storefront/theme-experiment-pons-autonomic-bridge-failover", () => ({
  syncPonsFromMedullaAndSpinal: vi.fn((json: unknown) => ({ json })),
}));
vi.mock("@/lib/storefront/theme-experiment-midbrain-arousal-publish-pacing", () => ({
  syncMidbrainFromPonsAndSpinal: vi.fn((json: unknown) => ({ json })),
}));
vi.mock("@/lib/storefront/theme-experiment-thalamus-sensory-gating-publish", () => ({
  syncThalamusFromMidbrainAndSpinal: vi.fn((json: unknown) => ({ json })),
}));
vi.mock("@/lib/storefront/theme-experiment-basal-ganglia-action-selection-publish", () => ({
  syncBasalGangliaFromThalamusAndMidbrain: vi.fn((json: unknown) => ({ json })),
}));
vi.mock("@/lib/storefront/theme-experiment-cerebellum-motor-refinement-publish", () => ({
  syncCerebellumFromBasalGangliaAndMidbrain: vi.fn((json: unknown) => ({ json })),
}));
vi.mock("@/lib/storefront/theme-experiment-motor-cortex-execution-publish", () => ({
  syncMotorCortexFromCerebellumAndMidbrain: vi.fn((json: unknown) => ({ json })),
}));
vi.mock("@/lib/storefront/theme-experiment-premotor-sma-planning-publish", () => ({
  syncPremotorSmaFromMotorCortexAndEthics: vi.fn((json: unknown) => ({ json })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    storefrontSettings: {
      findFirst: prismaFindFirst,
      update: vi.fn(),
    },
  },
}));

import { submitEthicsReviewAction } from "@/actions/experiment-ethics-review";

describe("experiment ethics review RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isPrefrontalEthicsBoardEnabled.mockReturnValue(true);
    prismaFindFirst.mockResolvedValue({ id: "sf-1", themeExperimentJson: {} });
  });

  it("denies submit without storefront.manage", async () => {
    requireStorefrontManageActor.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    const formData = new FormData();
    formData.set("status", "approved");

    const result = await submitEthicsReviewAction(null, formData);

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(requireStorefrontManageActor).toHaveBeenCalledWith({
      operation: "storefront.experiment_ethics_review",
    });
    expect(prismaFindFirst).not.toHaveBeenCalled();
  });

  it("allows submit when storefront manage gate passes", async () => {
    requireStorefrontManageActor.mockResolvedValue({
      ok: true,
      actor: {
        sessionUserId: "owner-1",
        userId: "owner-1",
        dataUserId: "owner-1",
        sessionUser: { id: "owner-1", email: "owner@example.com" },
      },
    });

    const formData = new FormData();
    formData.set("status", "approved");

    const result = await submitEthicsReviewAction(null, formData);

    expect(result).toEqual({ ok: true });
    expect(prismaFindFirst).toHaveBeenCalled();
  });
});
