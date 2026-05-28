import { describe, expect, it } from "vitest";

import {
  ERROR_RECOVERY_TILE_NEXT_ACTIONS_ERA18_BACKLOG_ID,
  ERROR_RECOVERY_TILE_NEXT_ACTIONS_ERA18_POLICY_ID,
  ERROR_RECOVERY_TILE_NEXT_ACTIONS_ERA18_PROOF_STATUS,
  PLATFORM_ERROR_RECOVERY_TILE_NEXT_ACTIONS_ERA18_POLICY_ID,
  PLATFORM_ERROR_RECOVERY_TILE_NEXT_ACTIONS_ERA18_PROOF_STATUS,
} from "@/lib/error-recovery/error-recovery-tile-next-actions-era18-policy";
import {
  resolveErrorRecoveryTileRowNextAction,
  resolvePlatformErrorRecoveryTileRowNextAction,
} from "@/lib/error-recovery/error-recovery-focus-era18";

describe("error-recovery-tile-next-actions-era18 policy", () => {
  it("registers era18 error recovery tile next action proof", () => {
    expect(ERROR_RECOVERY_TILE_NEXT_ACTIONS_ERA18_POLICY_ID).toBe(
      "era18-error-recovery-tile-next-actions-v1",
    );
    expect(ERROR_RECOVERY_TILE_NEXT_ACTIONS_ERA18_PROOF_STATUS).toBe(
      "error_recovery_tile_next_actions_wired",
    );
    expect(ERROR_RECOVERY_TILE_NEXT_ACTIONS_ERA18_BACKLOG_ID).toBe("KOS-E18-036");
  });

  it("registers era18 platform error recovery tile next action proof", () => {
    expect(PLATFORM_ERROR_RECOVERY_TILE_NEXT_ACTIONS_ERA18_POLICY_ID).toBe(
      "era18-platform-error-recovery-tile-next-actions-v1",
    );
    expect(PLATFORM_ERROR_RECOVERY_TILE_NEXT_ACTIONS_ERA18_PROOF_STATUS).toBe(
      "platform_error_recovery_tile_next_actions_wired",
    );
  });
});

describe("resolveErrorRecoveryTileRowNextAction", () => {
  it("returns urgent reconnect for integration errors", () => {
    expect(
      resolveErrorRecoveryTileRowNextAction("integration-errors", { count: 2 }),
    ).toEqual({
      label: "Reconnect integrations",
      href: "/dashboard/sales-channels/health",
      tone: "urgent",
    });
  });

  it("returns null when webhook backlog is clear", () => {
    expect(resolveErrorRecoveryTileRowNextAction("webhooks-queued", { count: 0 })).toBeNull();
  });

  it("escalates cron stalled escalations to urgent acknowledge", () => {
    expect(
      resolveErrorRecoveryTileRowNextAction("cron-attention", {
        count: 1,
        stalledEscalations: 2,
      }),
    ).toEqual({
      label: "Acknowledge stalled cron",
      href: "/dashboard/system-health/cron-execution",
      tone: "urgent",
    });
  });

  it("always offers data integrity check", () => {
    expect(
      resolveErrorRecoveryTileRowNextAction("data-integrity", { count: null }),
    ).toMatchObject({
      label: "Run integrity check",
      href: "/dashboard/system-health/data-integrity",
    });
  });

  it("triages critical production incidents first", () => {
    expect(
      resolveErrorRecoveryTileRowNextAction("production-incidents", {
        count: 3,
        criticalCount: 1,
      }),
    ).toEqual({
      label: "Triage critical incidents",
      href: "/dashboard/system-health/incidents",
      tone: "urgent",
    });
  });
});

describe("resolvePlatformErrorRecoveryTileRowNextAction", () => {
  it("returns urgent escalation response for critical tickets", () => {
    expect(resolvePlatformErrorRecoveryTileRowNextAction("critical-tickets", 2)).toEqual({
      label: "Respond to escalations",
      href: "/platform/support/escalations",
      tone: "urgent",
    });
  });

  it("returns null when integration errors are clear", () => {
    expect(resolvePlatformErrorRecoveryTileRowNextAction("integration-errors", 0)).toBeNull();
  });
});
