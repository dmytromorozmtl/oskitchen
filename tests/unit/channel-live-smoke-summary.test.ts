import { describe, expect, it } from "vitest";

import {
  buildChannelLiveSmokeSummary,
  evaluateChannelLiveSmokePrerequisites,
  formatChannelLiveSmokeStepLine,
  resolveChannelLiveSmokeOverall,
} from "@/lib/integrations/channel-live-smoke-summary";

describe("channel live smoke summary", () => {
  it("evaluates prerequisites with explicit skip reasons", () => {
    expect(evaluateChannelLiveSmokePrerequisites({})).toEqual({
      ok: false,
      reason: "DATABASE_URL is not configured — live tenant smoke requires a database connection.",
    });
    expect(
      evaluateChannelLiveSmokePrerequisites({
        databaseUrl: "postgres://local",
      }),
    ).toEqual({
      ok: false,
      reason: "ENCRYPTION_KEY is not configured — integration credentials cannot be decrypted.",
    });
    expect(
      evaluateChannelLiveSmokePrerequisites({
        databaseUrl: "postgres://local",
        encryptionKey: "key",
      }),
    ).toEqual({
      ok: false,
      reason:
        "Set CHANNEL_SMOKE_OWNER_EMAIL or CHANNEL_SMOKE_CONNECTION_ID (or CLI flags) to select a Woo/Shopify connection.",
    });
    expect(
      evaluateChannelLiveSmokePrerequisites({
        databaseUrl: "postgres://local",
        encryptionKey: "key",
        ownerEmail: "owner@example.com",
      }),
    ).toEqual({ ok: true });
  });

  it("formats step lines with SKIPPED WITH REASON", () => {
    expect(
      formatChannelLiveSmokeStepLine({
        id: "live",
        label: "Live tenant certification",
        status: "SKIPPED",
        reason: "DATABASE_URL is not configured",
      }),
    ).toBe(
      "[SKIPPED WITH REASON] Live tenant certification: DATABASE_URL is not configured",
    );
  });

  it("resolves overall PASSED, FAILED, and SKIPPED", () => {
    expect(
      resolveChannelLiveSmokeOverall([
        { id: "a", label: "Synthetic", status: "PASSED" },
        { id: "b", label: "Live", status: "SKIPPED", reason: "no db" },
      ]),
    ).toBe("PASSED");
    expect(
      resolveChannelLiveSmokeOverall([
        { id: "a", label: "Synthetic", status: "FAILED" },
        { id: "b", label: "Live", status: "SKIPPED", reason: "no db" },
      ]),
    ).toBe("FAILED");
    expect(
      resolveChannelLiveSmokeOverall([
        { id: "b", label: "Live", status: "SKIPPED", reason: "no db" },
      ]),
    ).toBe("SKIPPED");
  });

  it("builds summary artifact shape", () => {
    const summary = buildChannelLiveSmokeSummary([
      { id: "synthetic", label: "Synthetic cert", status: "PASSED" },
    ]);
    expect(summary.version).toBe("era16-channel-live-smoke-v1");
    expect(summary.overall).toBe("PASSED");
    expect(summary.steps).toHaveLength(1);
  });
});
