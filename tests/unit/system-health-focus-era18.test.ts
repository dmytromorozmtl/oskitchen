import { describe, expect, it } from "vitest";

import {
  SYSTEM_HEALTH_FOCUS_ERA18_BACKLOG_ID,
  SYSTEM_HEALTH_FOCUS_ERA18_POLICY_ID,
  SYSTEM_HEALTH_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/system-health/system-health-focus-era18-policy";
import {
  pickSystemHealthAttentionItems,
  pickSystemHealthEventNextActions,
  summarizeSystemHealthSnapshot,
  type SystemHealthSnapshot,
} from "@/lib/system-health/system-health-focus-era18";
import type { ObservabilityErrorEvent } from "@/services/observability/error-event-service";

function emptySnapshot(over: Partial<SystemHealthSnapshot> = {}): SystemHealthSnapshot {
  return {
    rollup: "HEALTHY",
    failedWebhooks: 0,
    errorIntegrations: 0,
    integrityIssueCount: 0,
    openSupportTickets: 0,
    unmatchedExternalProducts: 0,
    webhookProcessingErrors7d: 0,
    openWebhookJobRecoveries: 0,
    channelSyncFailed: 0,
    notificationFailures7d: 0,
    productionIncidentsCritical: 0,
    productionIncidentsOpen: 0,
    startupReadinessIncidents: 0,
    ...over,
  };
}

function sampleEvent(over: Partial<ObservabilityErrorEvent> = {}): ObservabilityErrorEvent {
  return {
    id: "sync:abc",
    severity: "medium",
    workspaceId: "ws-1",
    workspaceLabel: "Demo",
    module: "CHANNEL_SYNC",
    provider: "SHOPIFY",
    affectedEntityType: "ChannelSyncJob",
    affectedEntityId: "abc",
    summary: "catalog_pull: token expired",
    firstSeen: new Date("2026-05-28T10:00:00Z"),
    lastSeen: new Date("2026-05-28T10:00:00Z"),
    retryCount: 0,
    nextRecommendedAction: "Reconnect integration or re-run sync.",
    safeRetryHref: "/dashboard/sales-channels/health",
    supportTicketHref: "/dashboard/support/inbox",
    auditHref: "/dashboard/audit-logs",
    ...over,
  };
}

describe("system-health-focus-era18 policy", () => {
  it("registers era18 system health focus proof", () => {
    expect(SYSTEM_HEALTH_FOCUS_ERA18_POLICY_ID).toBe("era18-system-health-focus-v1");
    expect(SYSTEM_HEALTH_FOCUS_ERA18_PROOF_STATUS).toBe("system_health_focus_attention_wired");
    expect(SYSTEM_HEALTH_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-021");
  });
});

describe("pickSystemHealthAttentionItems", () => {
  it("prioritizes integration errors and channel sync failures", () => {
    const items = pickSystemHealthAttentionItems(
      emptySnapshot({
        errorIntegrations: 2,
        channelSyncFailed: 4,
        integrityIssueCount: 10,
      }),
    );

    expect(items[0]?.id).toBe("integration-errors");
    expect(items.some((item) => item.id === "channel-sync-failed")).toBe(true);
    expect(items[0]?.href).toBe("/dashboard/sales-channels/health");
  });

  it("surfaces startup readiness before integrity flags", () => {
    const items = pickSystemHealthAttentionItems(
      emptySnapshot({
        startupReadinessIncidents: 1,
        integrityIssueCount: 5,
      }),
    );

    expect(items[0]?.id).toBe("startup-readiness");
    expect(items[0]?.tone).toBe("urgent");
  });

  it("returns empty when workspace signals are clear", () => {
    expect(pickSystemHealthAttentionItems(emptySnapshot())).toEqual([]);
  });

  it("caps attention at four items", () => {
    const items = pickSystemHealthAttentionItems(
      emptySnapshot({
        productionIncidentsCritical: 1,
        startupReadinessIncidents: 1,
        errorIntegrations: 2,
        openWebhookJobRecoveries: 3,
        channelSyncFailed: 1,
        webhookProcessingErrors7d: 8,
        integrityIssueCount: 4,
      }),
    );

    expect(items).toHaveLength(4);
    expect(items.map((item) => item.id)).toEqual([
      "production-critical",
      "startup-readiness",
      "integration-errors",
      "webhook-job-recoveries",
    ]);
  });
});

describe("pickSystemHealthEventNextActions", () => {
  it("reuses observability event next actions", () => {
    const actions = pickSystemHealthEventNextActions([sampleEvent()]);
    expect(actions[0]?.href).toBe("/dashboard/sales-channels/health");
    expect(actions[0]?.detail).toContain("Reconnect");
  });
});

describe("summarizeSystemHealthSnapshot", () => {
  it("flags urgent when rollup is critical or integrations fail", () => {
    expect(
      summarizeSystemHealthSnapshot(emptySnapshot({ rollup: "CRITICAL" })).hasUrgent,
    ).toBe(true);
    expect(
      summarizeSystemHealthSnapshot(emptySnapshot({ errorIntegrations: 1 })).hasUrgent,
    ).toBe(true);
  });
});
