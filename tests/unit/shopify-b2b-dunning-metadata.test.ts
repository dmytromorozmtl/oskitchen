import { describe, expect, it } from "vitest";

import {
  B2B_OPERATOR_DIGEST_MIN_INTERVAL_MS,
  DEFAULT_B2B_DUNNING_CADENCE_DAYS,
  resolveB2bAutoDunningEnabled,
  resolveB2bDunningCadenceDays,
  resolveB2bOperatorDigestEnabled,
  shouldSendB2bOperatorDigest,
} from "@/lib/commercial/shopify-market-b2b-dunning";
import {
  buildB2bOperatorDigestPreview,
  incrementB2bDunningStats,
  resolveB2bAutoDunningTier,
} from "@/lib/integrations/shopify-b2b-dunning-metadata";
import { buildB2bArAgingSnapshot } from "@/lib/integrations/shopify-b2b-ar-aging-metadata";

describe("shopify-b2b-dunning-metadata", () => {
  it("resolves auto-dunning tier by cadence and reminder count", () => {
    const cadence = [...DEFAULT_B2B_DUNNING_CADENCE_DAYS];
    expect(
      resolveB2bAutoDunningTier({ daysPastDue: 20, reminderCount: 0, cadenceDays: cadence }),
    ).toBeNull();
    expect(
      resolveB2bAutoDunningTier({ daysPastDue: 35, reminderCount: 0, cadenceDays: cadence }),
    ).toBe(0);
    expect(
      resolveB2bAutoDunningTier({ daysPastDue: 65, reminderCount: 1, cadenceDays: cadence }),
    ).toBe(1);
    expect(
      resolveB2bAutoDunningTier({ daysPastDue: 70, reminderCount: 2, cadenceDays: cadence }),
    ).toBeNull();
  });

  it("defaults cadence to day 35 / day 65", () => {
    expect(resolveB2bDunningCadenceDays(null)).toEqual([35, 65]);
    expect(resolveB2bDunningCadenceDays([65, 35, 35])).toEqual([35, 65]);
  });

  it("requires explicit opt-in for auto dunning", () => {
    expect(resolveB2bAutoDunningEnabled(undefined)).toBe(false);
    expect(resolveB2bAutoDunningEnabled(true)).toBe(true);
  });

  it("defaults operator digest on unless explicitly disabled", () => {
    expect(resolveB2bOperatorDigestEnabled(undefined)).toBe(true);
    expect(resolveB2bOperatorDigestEnabled(false)).toBe(false);
  });

  it("enforces weekly digest interval", () => {
    const now = Date.parse("2026-06-15T09:00:00.000Z");
    expect(shouldSendB2bOperatorDigest(null, now)).toBe(true);
    expect(
      shouldSendB2bOperatorDigest("2026-06-10T09:00:00.000Z", now),
    ).toBe(false);
    expect(
      shouldSendB2bOperatorDigest(
        new Date(now - B2B_OPERATOR_DIGEST_MIN_INTERVAL_MS - 1000).toISOString(),
        now,
      ),
    ).toBe(true);
  });

  it("builds digest preview from aging snapshot", () => {
    const snapshot = buildB2bArAgingSnapshot([]);
    const preview = buildB2bOperatorDigestPreview({
      snapshot,
      cadenceDays: [35, 65],
      autoDunningEnabled: true,
      operatorDigestEnabled: true,
      lastDigestAt: null,
      lastRunAt: null,
    });
    expect(preview.openTotal).toBe(0);
    expect(preview.cadenceDays).toEqual([35, 65]);
    expect(preview.autoDunningEnabled).toBe(true);
  });

  it("increments dunning stats", () => {
    const next = incrementB2bDunningStats(null, {
      runs: 1,
      digestsSent: 1,
      autoRemindersSent: 2,
    });
    expect(next.runs).toBe(1);
    expect(next.digestsSent).toBe(1);
    expect(next.autoRemindersSent).toBe(2);
  });
});
