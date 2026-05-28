import { describe, expect, it } from "vitest";

import {
  buildBriefingSmokeNextActionRankedAction,
  buildBriefingSmokeNextActionRiskSignal,
  enrichBriefingRiskSignalsWithSmokeNextAction,
  mergeBriefingSmokeNextTopActions,
  OWNER_DAILY_BRIEFING_SMOKE_ACTION_ERA19_POLICY_ID,
  briefingSmokeActionPolicySnapshot,
} from "@/lib/briefing/owner-daily-briefing-smoke-action-era19";
import { BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF } from "@/lib/briefing/owner-daily-briefing-smoke-action-era19-policy";
import type { IntegrationHealthSmokeNextAction } from "@/lib/integrations/integration-health-smoke-artifacts-depth-era19";
import type { OwnerDailyBriefingRiskSignal } from "@/lib/briefing/owner-daily-briefing-risk-radar-era19";

const p0NextAction: IntegrationHealthSmokeNextAction = {
  rowId: "p0-staging-proof-unblock",
  label: "P0 staging proof unblock",
  smokeScript: "smoke:p0-staging-proof-unblock",
  reason: "SKIPPED WITH REASON — 11 env var(s) missing.",
  displayStatus: "SKIPPED WITH REASON",
  missingEnvVars: ["DATABASE_URL", "E2E_STAGING_BASE_URL"],
  opsChecklistDoc: "docs/era18-p0-staging-proof-ops-checklist.md",
};

const channelNextAction: IntegrationHealthSmokeNextAction = {
  rowId: "channel-live-smoke",
  label: "Woo / Shopify live smoke",
  smokeScript: "smoke:woo-shopify-live",
  reason: "Artifact missing on this host — run the smoke script in CI or locally.",
  displayStatus: "MISSING",
  missingEnvVars: [],
  opsChecklistDoc: "docs/era18-p0-staging-proof-ops-checklist.md",
};

describe("owner-daily-briefing-smoke-action-era19 policy", () => {
  it("registers era19 briefing smoke action proof", () => {
    expect(OWNER_DAILY_BRIEFING_SMOKE_ACTION_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-smoke-action-v1",
    );
    expect(briefingSmokeActionPolicySnapshot().href).toBe(
      BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF,
    );
  });
});

describe("buildBriefingSmokeNextActionRiskSignal", () => {
  it("links to Integration Health next smoke action anchor", () => {
    const signal = buildBriefingSmokeNextActionRiskSignal(p0NextAction);
    expect(signal.href).toBe(BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF);
    expect(signal.smokeScript).toBe("smoke:p0-staging-proof-unblock");
    expect(signal.statusLabel).toBe("SKIPPED WITH REASON");
  });
});

describe("enrichBriefingRiskSignalsWithSmokeNextAction", () => {
  it("enriches matching P0 risk signal instead of duplicating", () => {
    const existing: OwnerDailyBriefingRiskSignal = {
      id: "risk-p0-staging-proof",
      category: "p0_proof",
      categoryLabel: "P0 proof",
      title: "P0 staging proof — awaiting ops credentials",
      detail: "11 ops env var(s) missing.",
      href: "/dashboard/integration-health#engineering-smoke-artifacts",
      severity: "high",
      statusLabel: "SKIPPED",
      priority: 2,
    };

    const enriched = enrichBriefingRiskSignalsWithSmokeNextAction([existing], p0NextAction);
    expect(enriched).toHaveLength(1);
    expect(enriched[0]?.href).toBe(BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF);
    expect(enriched[0]?.smokeScript).toBe("smoke:p0-staging-proof-unblock");
    expect(enriched[0]?.detail).toContain("smoke:p0-staging-proof-unblock");
  });

  it("adds standalone signal when no matching risk row exists", () => {
    const enriched = enrichBriefingRiskSignalsWithSmokeNextAction([], channelNextAction);
    expect(enriched).toHaveLength(1);
    expect(enriched[0]?.id).toBe("risk-next-engineering-smoke");
    expect(enriched[0]?.category).toBe("live_smoke");
  });

  it("returns signals unchanged when next action is null", () => {
    const existing: OwnerDailyBriefingRiskSignal = {
      id: "risk-stuck-orders",
      category: "stuck_orders",
      categoryLabel: "Stuck orders",
      title: "Stuck orders",
      detail: "1 order blocked",
      href: "/dashboard/order-hub",
      severity: "high",
      statusLabel: "1",
      priority: 5,
    };
    expect(enrichBriefingRiskSignalsWithSmokeNextAction([existing], null)).toEqual([existing]);
  });
});

describe("buildBriefingSmokeNextActionRankedAction", () => {
  it("builds owner-ranked action with honest status", () => {
    const action = buildBriefingSmokeNextActionRankedAction(p0NextAction);
    expect(action.ownerRole).toBe("owner");
    expect(action.href).toBe(BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF);
    expect(action.unblockCondition).toContain("never upgrade SKIPPED");
  });
});

describe("mergeBriefingSmokeNextTopActions", () => {
  it("dedupes and sorts smoke action ahead of lower-priority general actions", () => {
    const smoke = buildBriefingSmokeNextActionRankedAction(p0NextAction);
    const general = [
      {
        id: "low-stock",
        title: "Review low stock",
        reason: "Par breach",
        severity: "normal" as const,
        ownerRole: "owner" as const,
        href: "/dashboard/purchasing",
        status: "monitor" as const,
        unblockCondition: "Restock",
        priority: 20,
        ctaLabel: "Open purchasing",
        tone: "normal" as const,
      },
    ];

    const merged = mergeBriefingSmokeNextTopActions(smoke, general);
    expect(merged[0]?.id).toBe(smoke.id);
    expect(merged).toHaveLength(2);
  });
});
