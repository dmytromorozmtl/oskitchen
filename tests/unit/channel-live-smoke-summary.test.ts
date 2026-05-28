import { describe, expect, it } from "vitest";

import {
  buildChannelLiveSmokeSummary,
  evaluateChannelLiveSmokePrerequisites,
  formatChannelLiveSmokeStepLine,
  formatMissingChannelLiveSmokeEnvVarsReason,
  listMissingChannelLiveSmokeEnvVars,
  resolveChannelLiveProviderProofStatus,
  resolveChannelLiveSmokeOverall,
} from "@/lib/integrations/channel-live-smoke-summary";

describe("channel live smoke summary", () => {
  it("evaluates prerequisites with explicit missing env list", () => {
    const missing = listMissingChannelLiveSmokeEnvVars({});
    expect(missing).toEqual(["DATABASE_URL", "ENCRYPTION_KEY", "CHANNEL_SMOKE_OWNER_EMAIL"]);
    expect(evaluateChannelLiveSmokePrerequisites({})).toEqual({
      ok: false,
      reason: formatMissingChannelLiveSmokeEnvVarsReason(missing),
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
      ]),
    ).toBe("FAILED");
  });

  it("builds summary artifact shape with Woo and Shopify proof status", () => {
    const summary = buildChannelLiveSmokeSummary(
      [
        { id: "synthetic", label: "Synthetic cert", status: "PASSED" },
        {
          id: "shopify_live_certification",
          label: "Shopify",
          status: "SKIPPED",
          reason: "Missing env vars",
        },
        {
          id: "woo_live_certification",
          label: "Woo",
          status: "SKIPPED",
          reason: "Missing env vars",
        },
      ],
      { missingEnvVars: ["DATABASE_URL"], prerequisitesMet: false },
    );
    expect(summary.version).toBe("era17-channel-live-smoke-v1");
    expect(summary.overall).toBe("PASSED");
    expect(summary.wooLiveProofStatus).toBe("proof_skipped_missing_prerequisites");
    expect(summary.shopifyLiveProofStatus).toBe("proof_skipped_missing_prerequisites");
  });

  it("resolves Woo proof_passed when woo step passes", () => {
    expect(
      resolveChannelLiveProviderProofStatus({
        prerequisitesMet: true,
        step: { id: "woo", label: "Woo", status: "PASSED" },
      }),
    ).toBe("proof_passed");
  });

  it("resolves Shopify proof_passed when shopify step passes", () => {
    expect(
      resolveChannelLiveProviderProofStatus({
        prerequisitesMet: true,
        step: { id: "shopify", label: "Shopify", status: "PASSED" },
      }),
    ).toBe("proof_passed");
  });
});
